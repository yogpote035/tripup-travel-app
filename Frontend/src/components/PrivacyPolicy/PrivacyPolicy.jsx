import React from "react";

const PrivacyPolicy = () => {
    window.scrollTo(0, 0); //only once 1st time scroll to top

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600 dark:text-blue-400">
          Privacy Policy
        </h1>

        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Last updated: August 7, 2025
        </p>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
          <p>
            We value your privacy. This Privacy Policy outlines how we collect,
            use, and protect your information when you use our website or
            services.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">2. Information We Collect</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Personal Information (e.g., name, email address, phone number)</li>
            <li>Flight and booking information</li>
            <li>Device and usage data (e.g., IP address, browser type)</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">3. How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>To provide and manage flight bookings</li>
            <li>To improve our services and user experience</li>
            <li>To communicate important updates or offers</li>
            <li>To ensure security and prevent fraud</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">4. Data Sharing</h2>
          <p>
            We do not sell your personal information. We may share data with
            third-party partners only when necessary to provide our services or
            comply with legal obligations.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">5. Your Rights</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>You can request access to your data</li>
            <li>You can ask us to correct or delete your data</li>
            <li>You can opt out of marketing communications</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">6. Cookies</h2>
          <p>
            We use cookies to enhance your browsing experience. You can manage
            your cookie preferences in your browser settings.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">7. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. Changes will be posted
            on this page with an updated revision date.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">8. Contact Us</h2>
          <p>
            If you have any questions or concerns, please contact us at:{" "}
            <a
              href="mailto:support@example.com"
              className="text-blue-500 hover:underline"
            >
              support@example.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
