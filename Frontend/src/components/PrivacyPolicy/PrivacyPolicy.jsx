import React, { useEffect } from "react";
import { Shield, Lock, Eye, FileText, UserCheck, Cookie, Bell, Mail } from "lucide-react";

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      icon: <FileText size={24} className="text-blue-500" />,
      title: "Introduction",
      content: "We value your privacy. This Privacy Policy outlines how we collect, use, and protect your information when you use our website or services."
    },
    {
      icon: <Eye size={24} className="text-purple-500" />,
      title: "Information We Collect",
      items: [
        "Personal Information (e.g., name, email address, phone number)",
        "Flight and booking information",
        "Device and usage data (e.g., IP address, browser type)"
      ]
    },
    {
      icon: <Lock size={24} className="text-green-500" />,
      title: "How We Use Your Information",
      items: [
        "To provide and manage flight bookings",
        "To improve our services and user experience",
        "To communicate important updates or offers",
        "To ensure security and prevent fraud"
      ]
    },
    {
      icon: <Shield size={24} className="text-orange-500" />,
      title: "Data Sharing",
      content: "We do not sell your personal information. We may share data with third-party partners only when necessary to provide our services or comply with legal obligations."
    },
    {
      icon: <UserCheck size={24} className="text-indigo-500" />,
      title: "Your Rights",
      items: [
        "You can request access to your data",
        "You can ask us to correct or delete your data",
        "You can opt out of marketing communications"
      ]
    },
    {
      icon: <Cookie size={24} className="text-amber-500" />,
      title: "Cookies",
      content: "We use cookies to enhance your browsing experience. You can manage your cookie preferences in your browser settings."
    },
    {
      icon: <Bell size={24} className="text-rose-500" />,
      title: "Changes to This Policy",
      content: "We may update this policy from time to time. Changes will be posted on this page with an updated revision date."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-100 p-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-6">
            <Shield size={32} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-800 inline-block px-4 py-2 rounded-full">
            Last updated: August 7, 2025
          </p>
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
                  {section.content && (
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {section.content}
                    </p>
                  )}
                  {section.items && (
                    <ul className="space-y-2">
                      {section.items.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-600 dark:text-gray-300">
                          <span className="text-blue-500 mt-1.5">•</span>
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Contact Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border border-blue-200 dark:border-gray-600 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl">
                <Mail size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
                  8. Contact Us
                </h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  If you have any questions or concerns, please contact us at:{" "}
                  <a
                    href="mailto:support@example.com"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium underline decoration-2 underline-offset-2 transition-colors"
                  >
                    support@example.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            By using our services, you acknowledge that you have read and understood this Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;