import React, { useEffect } from "react";
import { FileText, Check, CreditCard, RotateCcw, ShieldAlert, Scale, Mail } from "lucide-react";

const sections = [
  {
    icon: Check,
    title: "Acceptance of Terms",
    content: "By accessing or using our website and services, you agree to be bound by these Terms & Conditions.",
  },
  {
    icon: FileText,
    title: "Use of Services",
    content: "You agree to use our services only for lawful purposes and in a manner that does not violate the rights of others.",
  },
  {
    icon: CreditCard,
    title: "Booking & Payments",
    content: "All bookings are subject to availability and confirmation. Payments must be completed securely via our approved payment gateways.",
  },
  {
    icon: RotateCcw,
    title: "Cancellations & Refunds",
    content: "Cancellation policies vary by ticket and provider. Please check individual booking terms. Refunds will be processed within 7–10 business days, where applicable.",
  },
  {
    icon: ShieldAlert,
    title: "Limitation of Liability",
    content: "We are not liable for any indirect, incidental, or consequential damages resulting from the use of our services.",
  },
  {
    icon: Scale,
    title: "Governing Law",
    content: "These Terms are governed by and construed in accordance with the laws of your jurisdiction.",
  },
];

const TermsAndConditions = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-orange-50 pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white border border-orange-200 rounded-full px-4 py-1.5 mb-4">
            <FileText size={13} className="text-orange-400" />
            <span className="text-xs font-bold tracking-widest text-stone-400 uppercase">Legal</span>
          </div>
          <h1 className="text-4xl font-black text-stone-800 mb-2">Terms & Conditions</h1>
          <p className="text-xs text-stone-400 font-medium">Last updated: August 7, 2025</p>
        </div>

        {/* Notice banner */}
        <div className="flex items-start gap-3 bg-white border border-orange-200 rounded-2xl px-5 py-4 mb-5 shadow-sm">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <Check size={14} className="text-white" strokeWidth={3} />
          </div>
          <div>
            <p className="text-sm font-bold text-stone-800 mb-1">Please Read Carefully</p>
            <p className="text-sm text-stone-500 leading-relaxed">
              These terms constitute a legal agreement between you and our service. By continuing to use our platform, you acknowledge that you have read, understood, and agree to be bound by these terms.
            </p>
          </div>
        </div>

        {/* Sections Card */}
        <div className="bg-white border border-orange-200 rounded-2xl shadow-sm overflow-hidden">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <div
                key={idx}
                className={`px-6 py-5 ${idx !== sections.length - 1 ? "border-b border-orange-100" : ""}`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={16} className="text-orange-500" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-sm font-bold text-stone-800 mb-1.5">{section.title}</h2>
                    <p className="text-sm text-stone-500 leading-relaxed">{section.content}</p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Contact row */}
          <div className="px-6 py-5 bg-orange-50 border-t border-orange-200">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 bg-white border border-orange-200 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail size={16} className="text-orange-500" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-800 mb-0.5">Questions?</p>
                  <a
                    href="mailto:legal@example.com"
                    className="text-sm text-orange-500 hover:text-orange-400 font-semibold transition-colors"
                  >
                    legal@example.com
                  </a>
                </div>
              </div>
              <a
                href="mailto:legal@example.com"
                className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-400 active:scale-95 text-white font-bold px-4 py-2 rounded-xl transition-all text-xs tracking-wide"
              >
                <Mail size={13} /> Contact Us
              </a>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-stone-400 mt-6 leading-relaxed">
          By using our services, you confirm that you have read and agree to these Terms & Conditions.
        </p>

      </div>
    </div>
  );
};

export default TermsAndConditions;