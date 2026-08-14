const router = require("express").Router();
const {
  razorpayClient,
  verifyWebhookSignature,
} = require("../../services/payment/RazorpayPaymentService");
const { confirmWebhookPayment, markWebhookPaymentFailed } = require("../../services/payment/UniversalConfirmationService");

router.post("/webhook", async (req, res) => {
  const signature = req.get("x-razorpay-signature");
  if (!verifyWebhookSignature(req.rawBody, signature)) {
    return res.status(400).json({ message: "Invalid Razorpay webhook signature" });
  }

  try {
    const event = req.body?.event;
    const payment = req.body?.payload?.payment?.entity;
    if (!payment?.id || !payment?.order_id) return res.status(200).json({ received: true });

    const order = await razorpayClient.orders.fetch(payment.order_id);
    const { bookingId, bookingType, bookingSource } = order.notes || {};
    if (!bookingId || !bookingType) {
      console.warn(`[RAZORPAY] missing booking notes orderId=${payment.order_id} paymentId=${payment.id}`);
      return res.status(200).json({ received: true });
    }

    console.log(`[RAZORPAY] event=${event} bookingType=${bookingType} bookingId=${bookingId} orderId=${payment.order_id} paymentId=${payment.id}`);
    if (event === "payment.captured") {
      await confirmWebhookPayment({ bookingId, bookingType, bookingSource, payment, orderId: payment.order_id });
    } else if (event === "payment.failed") {
      await markWebhookPaymentFailed({ bookingId, bookingType, bookingSource, payment, orderId: payment.order_id });
    }
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook processing failed:", error.message);
    return res.status(500).json({ message: "Webhook processing failed" });
  }
});

module.exports = router;
