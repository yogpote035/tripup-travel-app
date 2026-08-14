import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { useDispatch, useSelector } from "react-redux";
import { searchLocations } from "../../../AllStatesFeatures/Location/locationSlice";
import Loading from "../../General/Loading";
import { IndianRupeeIcon } from "lucide-react";
import "../travel-experience.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const HotelSearch = () => {
    const dispatch = useDispatch();
    const { searchResults } = useSelector((state) => state.locations);
    const [hotels, setHotels] = useState([]);
    const [query, setQuery] = useState({ city: "", name: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [bookingState, setBookingState] = useState({ checkIn: "", checkOut: "", rooms: 1, guests: 1, roomType: "", paymentMethod: "card", submitting: false });
    const [bookingResult, setBookingResult] = useState(null);
    const [citySearchLoading, setCitySearchLoading] = useState(false);
    const [showCitySuggestions, setShowCitySuggestions] = useState(false);

    const fetchHotels = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {};
            if (query.city.trim()) params.city = query.city.trim();
            if (query.name.trim()) params.name = query.name.trim();
            const response = await axios.get(`${API_BASE_URL}/hotels`, { params });
            setHotels(response.data?.data || []);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Unable to load hotels.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const searchValue = query.city.trim();
        if (searchValue.length >= 2) {
            setCitySearchLoading(true);
            const timer = window.setTimeout(() => {
                dispatch(searchLocations(searchValue)).finally(() => setCitySearchLoading(false));
                setShowCitySuggestions(true);
            }, 250);
            return () => window.clearTimeout(timer);
        }
        setShowCitySuggestions(false);
    }, [query.city, dispatch]);

    useEffect(() => {
        fetchHotels();
    }, []);

    const selectedHotelDetails = useMemo(() => {
        if (!selectedHotel) return null;
        return hotels.find((hotel) => hotel._id === selectedHotel);
    }, [selectedHotel, hotels]);

    useEffect(() => {
        if (selectedHotelDetails?.roomTypes?.length) {
            setBookingState((prev) => ({
                ...prev,
                roomType: prev.roomType || selectedHotelDetails.roomTypes[0].type,
            }));
        }
    }, [selectedHotelDetails]);

    const handleSearchSubmit = (event) => {
        event.preventDefault();
        fetchHotels();
    };

    const loadRazorpayScript = () => new Promise((resolve, reject) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => reject(new Error("Unable to load Razorpay SDK"));
        document.body.appendChild(script);
    });

    const handleBookingSubmit = async (event) => {
        event.preventDefault();
        if (!selectedHotelDetails) return;
        setBookingState((state) => ({ ...state, submitting: true }));
        setBookingResult(null);

        if (!bookingState.checkIn || !bookingState.checkOut || !bookingState.rooms || !bookingState.guests) {
            setBookingResult({ success: false, message: "Please complete the booking form before continuing." });
            setBookingState((state) => ({ ...state, submitting: false }));
            return;
        }

        try {
            const response = await axios.post(
                `${API_BASE_URL}/hotels/book`,
                {
                    hotelId: selectedHotelDetails._id,
                    checkIn: bookingState.checkIn,
                    checkOut: bookingState.checkOut,
                    rooms: bookingState.rooms,
                    guests: bookingState.guests,
                    roomType: bookingState.roomType,
                    paymentMethod: bookingState.paymentMethod,
                },
                { withCredentials: true }
            );

            const order = response.data?.data?.paymentOrder;
            const paymentKeyId = response.data?.data?.paymentKeyId;
            const booking = response.data?.data?.booking;

            if (!order || !paymentKeyId || !booking) {
                throw new Error("Payment order could not be created");
            }

            await loadRazorpayScript();

            const razorpay = new window.Razorpay({
                key: paymentKeyId,
                amount: order.amount,
                currency: order.currency,
                name: selectedHotelDetails.name,
                description: `${bookingState.roomType || "Hotel"} stay at ${selectedHotelDetails.name}`,
                order_id: order.id,
                handler: async (paymentResponse) => {
                    try {
                        const confirmRes = await axios.post(
                            `${API_BASE_URL}/hotels/book/${booking._id}/confirm`,
                            {
                                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                                razorpay_order_id: paymentResponse.razorpay_order_id,
                                razorpay_signature: paymentResponse.razorpay_signature,
                            },
                            { withCredentials: true }
                        );
                        setBookingResult({ success: true, message: "Payment successful! Your hotel booking is confirmed." });
                        setBookingState((state) => ({ ...state, rooms: 1, guests: 1, checkIn: "", checkOut: "", roomType: "", paymentMethod: "card" }));
                        console.log(confirmRes.data.data);
                    } catch (confirmError) {
                        console.error(confirmError);
                        setBookingResult({ success: false, message: "Payment received. Your booking is being confirmed. Please check your bookings shortly." });
                    }
                },
                modal: {
                    ondismiss: () => {
                        setBookingResult({ success: false, message: "Payment window closed before completion." });
                    },
                },
                prefill: {
                    name: "",
                    email: "",
                },
                theme: {
                    color: "#1f2937",
                },
            });

            razorpay.open();
        } catch (err) {
            console.error(err);
            setBookingResult({ success: false, message: err.response?.data?.message || err.message || "Unable to book hotel" });
        } finally {
            setBookingState((state) => ({ ...state, submitting: false }));
        }
    };

    if (loading) return <Loading message="Searching hotels for your next adventure..." />;

    return (
        <div className="hotel-luxury min-h-screen py-8 px-4 sm:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="hotel-hero mb-8 rounded-3xl p-6 sm:p-8">
                    <span className="text-xs font-bold tracking-[0.24em] uppercase opacity-80">TripUp Signature Stays</span>
                    <h1 className="text-3xl sm:text-4xl font-semibold mt-3 mb-3">A stay worth arriving for</h1>
                    <p className="mb-6 max-w-2xl opacity-80">Discover exceptional hotels, thoughtful rooms, and seamless reservations for your next escape.</p>
                    <form onSubmit={handleSearchSubmit} className="grid gap-4 sm:grid-cols-3">
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">City</span>
                            <input
                                type="text"
                                value={query.city}
                                onChange={(event) => setQuery((prev) => ({ ...prev, city: event.target.value }))}
                                className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 focus:border-slate-500 focus:outline-none"
                                placeholder="City or destination"
                            />
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-slate-700">Hotel name</span>
                            <input
                                type="text"
                                value={query.name}
                                onChange={(event) => setQuery((prev) => ({ ...prev, name: event.target.value }))}
                                className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 focus:border-slate-500 focus:outline-none"
                                placeholder="Optional hotel name"
                            />
                        </label>
                        <button
                            type="submit"
                            className="self-end rounded-2xl bg-slate-900 px-6 py-3 text-white shadow hover:bg-slate-800 transition"
                        >
                            Search hotels
                        </button>
                    </form>
                </div>

                {error ? (
                    <div className="rounded-3xl bg-rose-50 border border-rose-200 p-4 text-rose-700">{error}</div>
                ) : null}

                <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                    <div className="space-y-6">
                        {hotels.length === 0 ? (
                            <div className="rounded-3xl bg-white p-8 border border-slate-200 text-slate-700">
                                We could not find any hotels matching your search. Try a different city or remove the hotel name filter.
                            </div>
                        ) : (
                            hotels.map((hotel) => (
                                <div key={hotel._id} className="hotel-card rounded-3xl bg-white p-6 border border-slate-200">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <h2 className="text-xl font-semibold text-slate-900">{hotel.name}</h2>
                                            <p className="text-sm text-slate-500">{hotel.city} · {hotel.address || "No address available"}</p>
                                        </div>
                                        <div className="hotel-rating inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm">
                                            {Number(hotel.starRating || 3).toFixed(1)} ★
                                        </div>
                                    </div>
                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-slate-600">
                                        <span>{hotel.availableRooms ?? 0} rooms available</span>
                                        <span className="text-lg flex justify-center align-middle font-semibold text-slate-900"><IndianRupeeIcon size={18} />{Number(hotel.pricePerNight || 0).toFixed(0)}/night</span>
                                    </div>
                                    <div className="mt-5 flex flex-wrap gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedHotel(hotel._id)}
                                            className="hotel-book-button rounded-2xl px-5 py-3 text-sm font-medium transition"
                                        >
                                            View & Book
                                        </button>
                                        <span className="text-sm text-slate-500">{hotel.amenities?.slice(0, 4).join(" · ")}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {selectedHotelDetails ? (
                        <div className="hotel-booking-card sticky top-8 rounded-3xl bg-white p-6 border border-slate-200">
                            <h3 className="text-2xl font-semibold text-slate-900 mb-3">Reserve at {selectedHotelDetails.name}</h3>
                            <p className="text-sm text-slate-500 mb-5">{selectedHotelDetails.address || selectedHotelDetails.city}</p>
                            <div className="grid gap-4">
                                <label className="block">
                                    <span className="text-sm font-medium text-slate-700">Check-in</span>
                                    <input
                                        type="date"
                                        value={bookingState.checkIn}
                                        onChange={(event) => setBookingState((prev) => ({ ...prev, checkIn: event.target.value }))}
                                        className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 focus:border-slate-500 focus:outline-none"
                                    />
                                </label>
                                <label className="block">
                                    <span className="text-sm font-medium text-slate-700">Check-out</span>
                                    <input
                                        type="date"
                                        value={bookingState.checkOut}
                                        onChange={(event) => setBookingState((prev) => ({ ...prev, checkOut: event.target.value }))}
                                        className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 focus:border-slate-500 focus:outline-none"
                                    />
                                </label>
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className="block">
                                            <span className="text-sm font-medium text-slate-700">Rooms</span>
                                            <input
                                                type="number"
                                                min="1"
                                                value={bookingState.rooms}
                                                onChange={(event) => setBookingState((prev) => ({ ...prev, rooms: Number(event.target.value) || 1 }))}
                                                className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 focus:border-slate-500 focus:outline-none"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-sm font-medium text-slate-700">Guests</span>
                                            <input
                                                type="number"
                                                min="1"
                                                value={bookingState.guests}
                                                onChange={(event) => setBookingState((prev) => ({ ...prev, guests: Number(event.target.value) || 1 }))}
                                                className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 focus:border-slate-500 focus:outline-none"
                                            />
                                        </label>
                                    </div>
                                    {selectedHotelDetails.roomTypes?.length ? (
                                        <label className="block">
                                            <span className="text-sm font-medium text-slate-700">Room type</span>
                                            <select
                                                value={bookingState.roomType || selectedHotelDetails.roomTypes?.[0]?.type || ""}
                                                onChange={(event) => setBookingState((prev) => ({ ...prev, roomType: event.target.value }))}
                                                className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 focus:border-slate-500 focus:outline-none"
                                            >
                                                {selectedHotelDetails.roomTypes.map((room) => (
                                                    <option key={room.type} value={room.type}>
                                                        {room.type} — ₹{room.pricePerNight} / night · {room.availableRooms} available
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                    ) : null}
                                    <label className="block">
                                        <span className="text-sm font-medium text-slate-700">Payment method</span>
                                        <select
                                            value={bookingState.paymentMethod}
                                            onChange={(event) => setBookingState((prev) => ({ ...prev, paymentMethod: event.target.value }))}
                                            className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 focus:border-slate-500 focus:outline-none"
                                        >
                                            {[
                                                { value: "card", label: "Card" },
                                                { value: "netbanking", label: "Netbanking" },
                                                { value: "upi", label: "UPI" },
                                                { value: "wallet", label: "Wallet" },
                                                { value: "other", label: "Other" },
                                            ].map((method) => (
                                                <option key={method.value} value={method.value}>
                                                    {method.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </div>
                                <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
                                    <p>Estimated stay:</p>
                                    <p className="font-semibold mt-1">{bookingState.checkIn && bookingState.checkOut ? `${format(new Date(bookingState.checkIn), "MMM d")} → ${format(new Date(bookingState.checkOut), "MMM d")}` : "Select dates to preview"}</p>
                                    <p className="mt-1">Price per night: <span className="font-semibold text-slate-900">₹{(selectedHotelDetails.roomTypes?.find((room) => room.type === bookingState.roomType)?.pricePerNight ?? selectedHotelDetails.pricePerNight)?.toFixed(0) || 0}</span></p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleBookingSubmit}
                                    disabled={bookingState.submitting}
                                    className="hotel-book-button rounded-2xl px-6 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {bookingState.submitting ? "Booking…" : "Book this hotel"}
                                </button>
                                {bookingResult ? (
                                    <div className={`rounded-2xl p-4 ${bookingResult.success ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"}`}>
                                        {bookingResult.message}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    ) : (
                        <div className="hotel-empty-card rounded-3xl bg-white p-6 border border-slate-200">
                            <h3 className="text-xl font-semibold text-slate-900 mb-3">Select a hotel</h3>
                            <p className="text-slate-500">Tap a hotel card above to open the booking form and reserve your stay.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HotelSearch;
