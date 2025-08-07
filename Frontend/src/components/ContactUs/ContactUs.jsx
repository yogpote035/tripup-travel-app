import React from "react";

const ContactUs = () => {
    window.scrollTo(0, 0); //only once 1st time scroll to top

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600 dark:text-blue-400">
          Contact Us
        </h1>

        <p className="mb-4">
          If you have any questions, concerns, or need support, feel free to reach out to us.
        </p>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Email</h2>
            <a
              href="mailto:support@example.com"
              className="text-blue-500 hover:underline"
            >
              support@example.com
            </a>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Phone</h2>
            <p className="text-gray-700 dark:text-gray-300">+91-9876543210</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Address</h2>
            <p className="text-gray-700 dark:text-gray-300">
              TripUp Headquarters<br />
              123 Aviation Street<br />
              New Delhi, India – 110001
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
