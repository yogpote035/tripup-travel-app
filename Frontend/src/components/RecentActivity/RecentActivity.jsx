import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FaTrain,
  FaBus,
  FaPlane,
  FaClipboardList,
  FaRegNewspaper,
} from "react-icons/fa";
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
    switch (type) {
      case "train":
        return <FaTrain className="text-blue-500" />;
      case "bus":
        return <FaBus className="text-green-500" />;
      case "flight":
        return <FaPlane className="text-purple-500" />;
      case "plan":
        return <FaClipboardList className="text-orange-500" />;
      case "post":
        return <FaRegNewspaper className="text-pink-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg rounded-2xl p-6 w-full max-w-2xl mx-auto mt-12 mb-12 transition-all duration-300">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        📌 Recent Activity
      </h2>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          Loading recent activity...
        </p>
      ) : activities.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          No recent activity found.
        </p>
      ) : (
        <ul className="space-y-4">
          {activities.map((activity) => (
            <li
              key={activity.id}
              className="flex items-start gap-4 border border-gray-300 dark:border-gray-700 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
            >
              <div className="flex-shrink-0 text-3xl">{getIcon(activity.type)}</div>
              <div className="flex flex-col">
                <p className="text-gray-800 dark:text-gray-200 font-semibold text-lg">
                  {activity.title}
                </p>
                <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {format(new Date(activity?.createdAt),"dd MMM yyyy, hh:mm a")}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentActivity;
