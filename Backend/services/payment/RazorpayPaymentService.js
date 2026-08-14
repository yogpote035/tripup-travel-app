const crypto = require("crypto");
const Razorpay = require("razorpay");
const { getConfig } = require("../../config/environment");

const config = getConfig();
const razorpayClient = config.razorpay?.keyId && config.razorpay?.keySecret
  ? new Razorpay({ key_id: config.razorpay.keyId, key_secret: config.razorpay.keySecret })
  : null;

function timingSafeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function verifyCheckoutSignature({ orderId, paymentId, signature }) {
  if (!config.razorpay?.keySecret || !orderId || !paymentId || !signature) return false;
  const expected = crypto.createHmac("sha256", config.razorpay.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return timingSafeEqual(expected, signature);
}

function verifyWebhookSignature(rawBody, signature) {
  if (!config.razorpay?.webhookSecret || !rawBody || !signature) return false;
  const expected = crypto.createHmac("sha256", config.razorpay.webhookSecret)
    .update(rawBody)
    .digest("hex");
  return timingSafeEqual(expected, signature);
}

function paymentRecord(payment, originalMethod) {
  return {
    provider: "razorpay",
    status: "success",
    reference: payment.id,
    orderId: payment.order_id,
    amount: Number(payment.amount) / 100,
    currency: payment.currency,
    method: payment.method || originalMethod || "other",
    originalMethod: originalMethod || null,
    email: payment.email || null,
    contact: payment.contact || null,
    captured: Boolean(payment.captured || payment.status === "captured"),
    cardType: payment.card?.type || null,
    bank: payment.bank || null,
    wallet: payment.wallet || null,
    createdAt: payment.created_at ? new Date(payment.created_at * 1000) : new Date(),
  };
}

async function getCapturedPayment({ paymentId, orderId, payment }) {
  // Fetch from Razorpay even for a signed webhook: this keeps amount, capture
  // state, and order binding authoritative instead of trusting request payloads.
  const resolved = razorpayClient ? await razorpayClient.payments.fetch(paymentId) : payment;
  if (!resolved) throw new Error("Razorpay is not configured on the server");
  if (resolved.id !== paymentId || resolved.order_id !== orderId) throw new Error("Razorpay payment does not match the order");
  if (resolved.status !== "captured" || !resolved.captured) throw new Error("Razorpay payment has not been captured");
  if (String(resolved.currency).toUpperCase() !== "INR") throw new Error("Razorpay payment currency must be INR");
  return resolved;
}

function assertAmount(payment, amount) {
  const expected = Math.round(Number(amount) * 100);
  if (!Number.isFinite(expected) || Number(payment.amount) !== expected) {
    throw new Error("Razorpay payment amount does not match the booking amount");
  }
}

module.exports = {
  config,
  razorpayClient,
  verifyCheckoutSignature,
  verifyWebhookSignature,
  paymentRecord,
  getCapturedPayment,
  assertAmount,
};
