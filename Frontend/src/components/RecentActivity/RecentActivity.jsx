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

const RecentActivity = () => {
  const dispatch = useDispatch();
  const { loading, activities } = useSelector((state) => state.recentActivity);

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(GetRecentActivity());
  }, [dispatch]);

  const getIcon = (type) => {
    const iconProps = { size: 24, strokeWidth: 2 };
    
    switch (type) {
      case "train":
        return <TrainFront {...iconProps} className="text-blue-600" />;
      case "bus":
        return <Bus {...iconProps} className="text-emerald-600" />;
      case "flight":
        return <Plane {...iconProps} className="text-indigo-600" />;
      case "plan":
        return <MapPin {...iconProps} className="text-amber-600" />;
      case "post":
        return <Newspaper {...iconProps} className="text-rose-600" />;
      default:
        return <Compass {...iconProps} className="text-gray-600" />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 border border-blue-200 dark:border-gray-700 shadow-xl rounded-3xl p-8 w-full max-w-3xl mx-auto mt-12 mb-12 transition-all duration-300">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-lg">
          <Clock size={28} className="text-white" strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
          Recent Journeys
        </h2>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 text-center">
            Loading your travel history...
          </p>
        </div>
      ) : activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Compass size={64} className="text-gray-300 dark:text-gray-600 mb-4" strokeWidth={1.5} />
          <p className="text-gray-500 dark:text-gray-400 text-center text-lg">
            No journeys yet. Start exploring!
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {activities.map((activity) => (
            <li
              key={activity.id}
              className="flex items-start gap-4 border border-blue-100 dark:border-gray-700 p-5 rounded-2xl bg-white dark:bg-gray-800 hover:shadow-lg hover:scale-[1.02] hover:border-blue-300 dark:hover:border-gray-600 transition-all duration-300 cursor-pointer"
            >
              <div className="flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-3 rounded-xl shadow-sm">
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 dark:text-gray-100 font-semibold text-lg mb-1 truncate">
                  {activity.title}
                </p>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(activity?.createdAt), "dd MMM yyyy, hh:mm a")}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentActivity;