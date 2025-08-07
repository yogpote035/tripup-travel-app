import React from "react";
import { FaCheckCircle, FaTimesCircle, FaTicketAlt } from "react-icons/fa";

const activities = [
  {
    id: 1,
    icon: <FaTicketAlt className="text-blue-500" />,
    description: "Booked a bus ticket from Delhi to Jaipur",
    time: "2 hours ago",
  },
  {
    id: 2,
    icon: <FaCheckCircle className="text-green-500" />,
    description: "Payment successful for ticket ID #12345",
    time: "3 hours ago",
  },
  {
    id: 3,
    icon: <FaTimesCircle className="text-red-500" />,
    description: "Cancelled ticket from Mumbai to Pune",
    time: "1 day ago",
  },
];

const RecentActivity = () => {
  window.scrollTo(0, 0); //only once 1st time scroll to top

  return (
    <div className="bg-white border-white border-1 mt-9 dark:bg-gray-900 shadow rounded-lg p-6 w-full max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Recent Activity
      </h2>
      <ul className="space-y-4">
        {activities.map((activity) => (
          <li
            key={activity.id}
            className="flex items-start border-1 border-gray-300 p-4 rounded gap-4"
          >
            <div className="text-2xl">{activity.icon}</div>
            <div>
              <p className="text-gray-700 dark:text-gray-300">
                {activity.description}
              </p>
              <span className="text-sm text-gray-400">{activity.time}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivity;
