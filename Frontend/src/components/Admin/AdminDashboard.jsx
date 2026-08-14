import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CalendarCheck, IndianRupee, Plane, Train, Bus, Hotel, Users, MessageSquare } from "lucide-react";
import { fetchDashboard } from "../../../AllStatesFeatures/Admin/AdminSlice";
import { EmptyState, formatCurrency, Skeleton } from "./AdminShared";

const icons = [Users, Users, CalendarCheck, Plane, Train, Bus, Hotel, MessageSquare, IndianRupee];
const metricLabels = ["Total users", "Active users", "Total bookings", "Flights", "Trains", "Buses", "Hotels", "Posts", "Revenue"];
const metricKeys = ["totalUsers", "activeUsers", "totalBookings", "flights", "trains", "buses", "hotels", "posts", "revenue"];
function Chart({ title, data = [], currency = false }) { const max = Math.max(...data.map((item) => item.value), 1); return <section className="admin-chart"><h2>{title}</h2>{data.length ? <div className="admin-bars">{data.map((item) => <div className="admin-bar" key={item.label}><span title={`${item.label}: ${item.value}`} style={{ height: `${Math.max(6, (item.value / max) * 100)}%` }} /><small>{item.label}</small>{currency && <em>{formatCurrency(item.value)}</em>}</div>)}</div> : <EmptyState title="No data yet" description="Data will appear as activity is recorded." />}</section> }
export default function AdminDashboard() {
    const dispatch = useDispatch();
    const { data, loading, error } = useSelector((state) => state.admin.dashboard);

    useEffect(() => {
        dispatch(fetchDashboard());
    }, [dispatch]);

    if (loading && !data) return <Skeleton rows={10} />;
    if (error) return <EmptyState title="Dashboard unavailable" description="Please refresh and try again." />;

    const metrics = data?.metrics || {
        totalUsers: 0,
        activeUsers: 0,
        totalBookings: 0,
        flights: 0,
        trains: 0,
        buses: 0,
        hotels: 0,
        posts: 0,
        revenue: 0,
    };

    const charts = data?.charts || {
        monthlyRevenue: [],
        dailyBookings: [],
        userGrowth: [],
        popularDestinations: [],
        bookingTypes: [],
    };

    return (
        <>
            <div className="admin-page-heading">
                <div>
                    <p>Overview</p>
                    <h1>Dashboard</h1>
                </div>
                <button className="admin-secondary" onClick={() => dispatch(fetchDashboard())}>
                    Refresh
                </button>
            </div>

            <div className="admin-metrics">
                {metricKeys.map((key, index) => {
                    const Icon = icons[index];
                    return (
                        <section className="admin-metric" key={key}>
                            <span>
                                <Icon size={19} />
                            </span>
                            <p>{metricLabels[index]}</p>
                            <strong>
                                {key === "revenue"
                                    ? formatCurrency(metrics[key])
                                    : Number(metrics[key] || 0).toLocaleString()}
                            </strong>
                        </section>
                    );
                })}
            </div>

            <div className="admin-charts-grid">
                <Chart title="Monthly revenue" data={charts.monthlyRevenue} currency />
                <Chart title="Daily bookings" data={charts.dailyBookings} />
                <Chart title="User growth" data={charts.userGrowth} />
            </div>

            <div className="admin-bottom-grid">
                <Chart title="Popular destinations" data={charts.popularDestinations} />
                <Chart title="Booking types" data={charts.bookingTypes} />
                <section className="admin-activity">
                    <h2>Recent activity</h2>
                    {data?.recentActivity?.length ? (
                        data.recentActivity.map((item) => (
                            <article key={item.id}>
                                <span>{item.type[0].toUpperCase()}</span>
                                <div>
                                    <b>{item.customer}</b>
                                    <p>
                                        {item.type} booking to {item.destination}
                                    </p>
                                </div>
                                <strong>{formatCurrency(item.amount)}</strong>
                            </article>
                        ))
                    ) : (
                        <EmptyState title="No recent activity" description="Data will appear as bookings are made." />
                    )}
                </section>
            </div>
        </>
    );
}
