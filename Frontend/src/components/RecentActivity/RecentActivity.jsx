import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  TrainFront,
  Bus,
  Plane,
  MapPin,
  Newspaper,
  Clock,
  Compass,
} from "lucide-react";
import { GetRecentActivity } from "../../../AllStatesFeatures/Recent Activity/RecentActivitySlice";
import { format } from "date-fns";
import Loading from "../../General/Loading";

const typeConfig = {
  train:  { icon: TrainFront, label: "Train" },
  bus:    { icon: Bus,        label: "Bus" },
  flight: { icon: Plane,      label: "Flight" },
  plan:   { icon: MapPin,     label: "Plan" },
  post:   { icon: Newspaper,  label: "Post" },
};

const RecentActivity = () => {
  const dispatch = useDispatch();
  const { loading, activities } = useSelector((state) => state.recentActivity);

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(GetRecentActivity());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-orange-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Heading */}
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Recent Activity</h1>
          <p className="text-sm text-stone-500 mt-1">Your latest bookings, plans, and posts.</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-orange-200 rounded-2xl shadow-sm overflow-hidden">

          {loading ? (
            // <div className="flex flex-col items-center justify-center py-16 gap-3">
            //   <div className="w-8 h-8 rounded-full border-2 border-orange-200 border-t-orange-500 animate-spin" />
            //   <p className="text-sm text-stone-400">Loading activity…</p>
            // </div>
            <Loading message="Loading activity…" color="border-t-orange-500" />
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Compass size={36} className="text-stone-300" strokeWidth={1.5} />
              <p className="text-sm text-stone-400">No activity yet. Start exploring!</p>
            </div>
          ) : (
            <ul className="divide-y divide-orange-100">
              {activities.map((activity) => {
                const config = typeConfig[activity.type] || { icon: Compass, label: "Other" };
                const Icon = config.icon;

                return (
                  <li
                    key={activity.id}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-orange-50 transition-colors cursor-pointer"
                  >
                    {/* Icon */}
                    <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-orange-500" strokeWidth={2} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-stone-800 truncate">
                        {activity.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock size={11} className="text-stone-400" strokeWidth={2} />
                        <span className="text-xs text-stone-400">
                          {format(new Date(activity.createdAt), "dd MMM yyyy, hh:mm a")}
                        </span>
                      </div>
                    </div>

                    {/* Type badge */}
                    <span className="shrink-0 text-xs font-semibold tracking-wide uppercase text-orange-400 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-lg">
                      {config.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
};

export default RecentActivity;