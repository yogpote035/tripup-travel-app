import { useEffect, useState } from "react";
import axios from "axios";
import { CalendarDays, MapPin, Users, Bed, ReceiptText, Clock3, ArrowLeft, Hotel, CheckCircle2, XCircle } from "lucide-react";
import { Link } from "react-router-dom";

const money = (value) => {
    const numeric = Number(value ?? 0);
    return Number.isFinite(numeric) ? `₹${numeric.toLocaleString("en-IN")}` : "₹0";
};

const statusClasses = {
    confirmed: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    pending: "bg-amber-100 text-amber-700 border border-amber-200",
    cancelled: "bg-red-100 text-red-700 border border-red-200",
    refunded: "bg-slate-200 text-slate-700 border border-slate-300",
    default: "bg-stone-100 text-stone-700 border border-stone-200",
};

export default function HotelBookingHistory() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                setLoading(true);
                setError("");
                const { data } = await axios.get("/hotels/bookings");
                const items = Array.isArray(data?.data) ? data.data : [];
                if (mounted) setBookings(items);
            } catch (err) {
                if (mounted) setError(err.response?.data?.message || "Unable to load hotel booking history");
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();
        return () => { mounted = false; };
    }, []);

    return (
        <div className="min-h-screen bg-orange-50 px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.26em] text-orange-500">
                            <Hotel size={14} />
                            Hotel Travel Record
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-stone-900">Hotel booking history</h1>
                    </div>
                    <Link
                        to="/bookings"
                        className="inline-flex items-center gap-2 self-start rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-600 shadow-sm transition hover:border-orange-300 hover:shadow-md"
                    >
                        <ArrowLeft size={16} />
                        Back to bookings
                    </Link>
                </div>

                {loading ? (
                    <div className="rounded-2xl border border-orange-200 bg-white p-8 text-center text-stone-500 shadow-sm">
                        Loading your hotel booking history…
                    </div>
                ) : error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600 shadow-sm">
                        {error}
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-orange-200 bg-white p-12 text-center shadow-sm">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                            <Hotel size={28} />
                        </div>
                        <h2 className="text-xl font-bold text-stone-800">No hotel bookings yet</h2>
                        <p className="mt-2 text-sm text-stone-500">Your hotel stays and reservations will appear here once you book.</p>
                        <Link
                            to="/hotels"
                            className="mt-5 inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-400"
                        >
                            Book a hotel
                            <ArrowLeft size={16} className="rotate-180" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-5">
                        {bookings.map((booking) => {
                            const hotelName = booking.hotelName || booking.hotel?.name || "Hotel booking";
                            const hotelImage = booking.hotel?.image || booking.image || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=80";
                            const payment = booking.payment || {};
                            const statusKey = String(booking.status || "pending").toLowerCase();

                            return (
                                <article
                                    key={booking._id || booking.id}
                                    className="overflow-hidden rounded-3xl border border-orange-200 bg-white shadow-sm transition hover:shadow-md"
                                >
                                    <div className="flex flex-col lg:flex-row">
                                        <div className="lg:w-72">
                                            <img
                                                src={hotelImage}
                                                alt={hotelName}
                                                className="h-52 w-full object-cover lg:h-full"
                                            />
                                        </div>

                                        <div className="flex-1 p-5 sm:p-6">
                                            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.28em] text-sky-500">Hotel reservation</p>
                                                    <h2 className="mt-1 text-2xl font-black text-stone-900">{hotelName}</h2>
                                                </div>
                                                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${statusClasses[statusKey] || statusClasses.default}`}>
                                                    {statusKey === "confirmed" ? <CheckCircle2 size={12} /> : statusKey === "cancelled" ? <XCircle size={12} /> : <Clock3 size={12} />}
                                                    {booking.status || "Pending"}
                                                </span>
                                            </div>

                                            <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                                <div className="rounded-2xl bg-sky-50 p-3">
                                                    <div className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-sky-600">
                                                        <MapPin size={12} />
                                                        Location
                                                    </div>
                                                    <p className="text-sm font-semibold text-stone-800">{booking.hotel?.city || booking.city || "Not specified"}</p>
                                                </div>
                                                <div className="rounded-2xl bg-orange-50 p-3">
                                                    <div className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-orange-600">
                                                        <CalendarDays size={12} />
                                                        Check-in
                                                    </div>
                                                    <p className="text-sm font-semibold text-stone-800">{booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : "—"}</p>
                                                </div>
                                                <div className="rounded-2xl bg-orange-50 p-3">
                                                    <div className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-orange-600">
                                                        <CalendarDays size={12} />
                                                        Check-out
                                                    </div>
                                                    <p className="text-sm font-semibold text-stone-800">{booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : "—"}</p>
                                                </div>
                                                <div className="rounded-2xl bg-stone-100 p-3">
                                                    <div className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-stone-600">
                                                        <Bed size={12} />
                                                        Stay
                                                    </div>
                                                    <p className="text-sm font-semibold text-stone-800">{booking.rooms || 1} room • {booking.guests || 1} guest</p>
                                                </div>
                                            </div>

                                            <div className="grid gap-3 md:grid-cols-3">
                                                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-stone-500">Booking ID</p>
                                                    <p className="mt-1 break-all text-sm font-semibold text-stone-800">{booking._id || booking.id || "—"}</p>
                                                </div>
                                                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-stone-500">Room type</p>
                                                    <p className="mt-1 text-sm font-semibold text-stone-800">{booking.roomType || "Standard"}</p>
                                                </div>
                                                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-stone-500">Payment</p>
                                                    <p className="mt-1 text-sm font-semibold text-stone-800">{payment.method || "Card"} • {payment.status || "Pending"}</p>
                                                </div>
                                            </div>

                                            <div className="mt-4 flex flex-col gap-3 border-t border-orange-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex items-center gap-6 text-sm text-stone-500">
                                                    <span className="inline-flex items-center gap-2"><ReceiptText size={14} /> {payment.reference || booking.paymentId || "No reference"}</span>
                                                    <span className="inline-flex items-center gap-2"><Users size={14} /> {booking.guests || 1} guest{(booking.guests || 1) > 1 ? "s" : ""}</span>
                                                </div>
                                                <div className="text-left sm:text-right">
                                                    <p className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">Total amount</p>
                                                    <p className="text-2xl font-black text-orange-500">{money(booking.totalFare)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
