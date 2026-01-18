import React from "react";

const TermsAndConditions = () => {
  window.scrollTo(0, 0); //only once 1st time scroll to top

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600 dark:text-blue-400">
          Terms & Conditions
        </h1>

        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Last updated: August 7, 2025
        </p>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing or using our website and services, you agree to be
            bound by these Terms & Conditions.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">2. Use of Services</h2>
          <p>
            You agree to use our services only for lawful purposes and in a
            manner that does not violate the rights of others.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">3. Booking & Payments</h2>
          <p>
            All bookings are subject to availability and confirmation. Payments
            must be completed securely via our approved payment gateways.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            4. Cancellations & Refunds
          </h2>
          <p>
            Cancellation policies vary by ticket and provider. Please check
            individual booking terms. Refunds will be processed within 7–10
            business days, where applicable.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            5. Limitation of Liability
          </h2>
          <p>
            We are not liable for any indirect, incidental, or consequential
            damages resulting from the use of our services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">6. Governing Law</h2>
          <p>
            These Terms are governed by and construed in accordance with the
            laws of your jurisdiction.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsAndConditions;
