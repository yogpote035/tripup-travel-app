import React, { useEffect } from "react";
import { Shield, Lock, Eye, FileText, UserCheck, Cookie, Bell, Mail } from "lucide-react";

const sections = [
  {
    icon: FileText,
    title: "Introduction",
    content: "We value your privacy. This Privacy Policy outlines how we collect, use, and protect your information when you use our website or services.",
  },
  {
    icon: Eye,
    title: "Information We Collect",
    items: [
      "Personal Information (e.g., name, email address, phone number)",
      "Flight and booking information",
      "Device and usage data (e.g., IP address, browser type)",
    ],
  },
  {
    icon: Lock,
    title: "How We Use Your Information",
    items: [
      "To provide and manage flight bookings",
      "To improve our services and user experience",
      "To communicate important updates or offers",
      "To ensure security and prevent fraud",
    ],
  },
  {
    icon: Shield,
    title: "Data Sharing",
    content: "We do not sell your personal information. We may share data with third-party partners only when necessary to provide our services or comply with legal obligations.",
  },
  {
    icon: UserCheck,
    title: "Your Rights",
    items: [
      "You can request access to your data",
      "You can ask us to correct or delete your data",
      "You can opt out of marketing communications",
    ],
  },
  {
    icon: Cookie,
    title: "Cookies",
    content: "We use cookies to enhance your browsing experience. You can manage your cookie preferences in your browser settings.",
  },
  {
    icon: Bell,
    title: "Changes to This Policy",
    content: "We may update this policy from time to time. Changes will be posted on this page with an updated revision date.",
  },
];

const PrivacyPolicy = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-orange-50 pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white border border-orange-200 rounded-full px-4 py-1.5 mb-4">
            <Shield size={13} className="text-orange-400" />
            <span className="text-xs font-bold tracking-widest text-stone-400 uppercase">Legal</span>
          </div>
          <h1 className="text-4xl font-black text-stone-800 mb-2">Privacy Policy</h1>
          <p className="text-xs text-stone-400 font-medium">Last updated: August 7, 2025</p>
        </div>

        {/* Sections Card */}
        <div className="bg-white border border-orange-200 rounded-2xl shadow-sm overflow-hidden">

          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <div key={idx} className={`px-6 py-5 ${idx !== sections.length - 1 ? "border-b border-orange-100" : ""}`}>
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={16} className="text-orange-500" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-sm font-bold text-stone-800 mb-1.5">{section.title}</h2>
                    {section.content && (
                      <p className="text-sm text-stone-500 leading-relaxed">{section.content}</p>
                    )}
                    {section.items && (
                      <ul className="space-y-1">
                        {section.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-stone-500 leading-relaxed">
                            <span className="text-orange-400 font-black flex-shrink-0 mt-0.5">·</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Contact */}
          <div className="px-6 py-5 bg-orange-50 border-t border-orange-200">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 bg-white border border-orange-200 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                <Mail size={16} className="text-orange-500" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-stone-800 mb-1">Contact Us</h2>
                <p className="text-sm text-stone-500 leading-relaxed">
                  Questions or concerns? Reach us at{" "}
                  <a href="mailto:support@example.com" className="text-orange-500 hover:text-orange-400 font-semibold transition-colors">
                    support@example.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-stone-400 mt-6 leading-relaxed">
          By using our services, you acknowledge that you have read and understood this Privacy Policy.
        </p>

      </div>
    </div>
  );
};

export default PrivacyPolicy;