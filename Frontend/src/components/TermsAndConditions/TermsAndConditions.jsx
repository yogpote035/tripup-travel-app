import React, { useEffect } from "react";
import { FileText, Check, CreditCard, RotateCcw, ShieldAlert, Scale } from "lucide-react";

const TermsAndConditions = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      icon: <Check size={24} className="text-green-500" />,
      title: "Acceptance of Terms",
      content: "By accessing or using our website and services, you agree to be bound by these Terms & Conditions."
    },
    {
      icon: <FileText size={24} className="text-blue-500" />,
      title: "Use of Services",
      content: "You agree to use our services only for lawful purposes and in a manner that does not violate the rights of others."
    },
    {
      icon: <CreditCard size={24} className="text-purple-500" />,
      title: "Booking & Payments",
      content: "All bookings are subject to availability and confirmation. Payments must be completed securely via our approved payment gateways."
    },
    {
      icon: <RotateCcw size={24} className="text-orange-500" />,
      title: "Cancellations & Refunds",
      content: "Cancellation policies vary by ticket and provider. Please check individual booking terms. Refunds will be processed within 7–10 business days, where applicable."
    },
    {
      icon: <ShieldAlert size={24} className="text-red-500" />,
      title: "Limitation of Liability",
      content: "We are not liable for any indirect, incidental, or consequential damages resulting from the use of our services."
    },
    {
      icon: <Scale size={24} className="text-indigo-500" />,
      title: "Governing Law",
      content: "These Terms are governed by and construed in accordance with the laws of your jurisdiction."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-100 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-6">
            <FileText size={32} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            Terms & Conditions
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-800 inline-block px-4 py-2 rounded-full">
            Last updated: August 7, 2025
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-l-4 border-blue-500 dark:border-blue-400 rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className="bg-blue-500 dark:bg-blue-400 rounded-full p-1">
                <Check size={16} className="text-white" strokeWidth={3} />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Please Read Carefully
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                These terms constitute a legal agreement between you and our service. By continuing to use our platform, you acknowledge that you have read, understood, and agree to be bound by these terms.
              </p>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 p-3 rounded-xl">
                  {section.icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
                    {index + 1}. {section.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Agreement */}
        <div className="mt-12 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 border border-gray-300 dark:border-gray-600 rounded-2xl p-8 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-4">
            <Scale size={24} className="text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Agreement Confirmation
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            By using our services, you confirm that you have read, understood, and agree to abide by these Terms & Conditions. If you do not agree with any part of these terms, please discontinue use of our services immediately.
          </p>
        </div>

        {/* Contact Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Questions about these terms? Contact us at{" "}
            <a
              href="mailto:legal@example.com"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium underline decoration-2 underline-offset-2 transition-colors"
            >
              legal@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;