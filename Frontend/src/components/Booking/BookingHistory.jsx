import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Download, QrCode, ReceiptText, XCircle } from "lucide-react";
import { toast } from "react-toastify";

export default function BookingHistory() {
  const [items, setItems] = useState([]);
  const [hotelItems, setHotelItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hotelLoading, setHotelLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `/bookings/history${filter ? `?status=${filter}` : ""}`,
      );
      setItems(data.data);
    } catch {
      toast.error("Unable to load booking history");
    } finally {
      setLoading(false);
    }
  }, [filter]);
  const loadHotelBookings = useCallback(async () => {
    try {
      setHotelLoading(true);
      const { data } = await axios.get(`/hotels/bookings`);
      setHotelItems(data.data || []);
    } catch {
      toast.error("Unable to load hotel booking history");
    } finally {
      setHotelLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    loadHotelBookings();
  }, [load, loadHotelBookings]);
  const cancel = async (id) => {
    try {
      await axios.post(`/bookings/${id}/cancel`, {
        reason: "Cancelled from booking history",
      });
      toast.success("Booking cancelled; refund is pending review");
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to cancel booking");
    }
  };
  const invoice = async (id) => {
    try {
      const { data } = await axios.get(`/bookings/${id}/invoice`);
      const blob = new Blob([JSON.stringify(data.data, null, 2)], {
        type: "application/json",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${data.data.invoiceNumber}.json`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {
      toast.error("Unable to prepare invoice");
    }
  };

  const getPaymentInfo = (payment) => {
    const safePayment = payment || {};
    const method = safePayment.method || safePayment.mode || safePayment.type || "Cash";
    const status = safePayment.status || "pending";
    const reference = safePayment.reference || safePayment.paymentId || safePayment.id || "";

    return {
      method,
      status,
      reference,
    };
  };

  return (
    <div className="min-h-screen bg-orange-50 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-500">
              Traveller account
            </p>
            <h1 className="text-3xl font-bold text-stone-800">
              Booking history
            </h1>
          </div>
          <select
            className="rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="">All statuses</option>
            {["pending", "confirmed", "cancelled", "refunded", "expired"].map(
              (status) => (
                <option key={status}>{status}</option>
              ),
            )}
          </select>
        </div>
        {loading ? (
          <p className="text-stone-500">Loading bookings…</p>
        ) : items.length ? (
          <div className="grid gap-4">
            {items.map((booking) => {
              const payment = getPaymentInfo(booking.payment);

              return (
                <article
                  className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm"
                  key={booking._id}
                >
                  <div className="flex flex-wrap justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold uppercase text-orange-500">
                        {booking.bookingType}
                      </span>
                      <h2 className="font-bold text-stone-800">
                        {booking.route?.from} → {booking.route?.to}
                      </h2>
                      <p className="text-sm text-stone-500">
                        {booking.passengers.length} passenger(s) · ₹
                        {booking.amount}
                      </p>
                    </div>
                    <span
                      className={`h-fit rounded-full px-3 py-1 text-xs font-bold ${booking.status === "confirmed" ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-600"}`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div className="mt-3 rounded-xl bg-orange-50 p-3 text-xs text-stone-700">
                    <p className="font-bold uppercase tracking-wide text-orange-600">Payment</p>
                    <p className="mt-1">
                      {payment.method} · {payment.status}
                    </p>
                    {payment.reference && (
                      <p className="mt-1 break-all">Ref: {payment.reference}</p>
                    )}
                  </div>

                  {booking.status === "confirmed" && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-orange-50 px-3 py-2 text-xs text-stone-600">
                        <QrCode size={15} /> {booking.qrCodePayload}
                      </span>
                      <button
                        className="inline-flex items-center gap-1 rounded-lg bg-stone-900 px-3 py-2 text-xs font-semibold text-white"
                        onClick={() => invoice(booking._id)}
                      >
                        <ReceiptText size={15} /> Invoice
                      </button>
                      <button
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600"
                        onClick={() => cancel(booking._id)}
                      >
                        <XCircle size={15} /> Cancel
                      </button>
                    </div>
                  )}

                  <p className="mt-3 text-xs text-stone-400">
                    Ticket:{" "}
                    {booking.ticketNumber || "Created after placeholder payment"}
                  </p>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-orange-200 bg-white p-10 text-center text-stone-500">
            No lifecycle bookings yet.
          </div>
        )}

        <div className="mt-10">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-sky-500">
                Hotel history
              </p>
              <h2 className="text-2xl font-bold text-stone-800">Hotel bookings</h2>
            </div>
            <span className="text-sm text-stone-500">
              {hotelItems.length} hotel booking{hotelItems.length === 1 ? "" : "s"}
            </span>
          </div>
          {hotelLoading ? (
            <p className="text-stone-500">Loading hotel booking history…</p>
          ) : hotelItems.length ? (
            <div className="grid gap-4">
              {hotelItems.map((booking) => {
                const payment = getPaymentInfo(booking.payment);

                return (
                  <article
                    key={booking._id}
                    className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-sky-500">
                          Hotel reservation
                        </span>
                        <h2 className="font-bold text-stone-800">
                          {booking.hotelName || booking.hotel?.name || "Hotel booking"}
                        </h2>
                        <p className="text-sm text-stone-500">
                          {booking.roomType || "Standard"} · {booking.rooms} room{booking.rooms > 1 ? "s" : ""}
                        </p>
                      </div>
                      <span
                        className={`h-fit rounded-full px-3 py-1 text-xs font-bold ${booking.status === "confirmed" ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-600"}`}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl bg-sky-50 p-4">
                        <p className="text-xs uppercase tracking-widest text-sky-500">Dates</p>
                        <p className="text-sm text-stone-700">
                          {new Date(booking.checkIn).toLocaleDateString()} – {new Date(booking.checkOut).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-widest text-slate-500">Total paid</p>
                        <p className="text-lg font-semibold text-stone-900">₹{booking.totalFare?.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="mt-3 rounded-xl bg-sky-50 p-3 text-xs text-stone-700">
                      <p className="font-bold uppercase tracking-wide text-sky-600">Payment</p>
                      <p className="mt-1">
                        {payment.method} · {payment.status}
                      </p>
                      {payment.reference && (
                        <p className="mt-1 break-all">Ref: {payment.reference}</p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-10 text-center text-slate-600">
              No hotel bookings found yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
