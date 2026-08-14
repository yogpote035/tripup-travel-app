import React from "react";
import {
  Mail, Phone, User, GraduationCap, Code2,
  ExternalLink, Github, Globe, Sparkles, ArrowRight,
} from "lucide-react";

const contactDetails = [
  {
    icon: User,
    label: "Full Name",
    value: "Yogesh Pote",
  },
  {
    icon: GraduationCap,
    label: "Education",
    value: "B.Sc. Computer Science",
  },
  {
    icon: Code2,
    label: "Tech Stack",
    value: "MERN Stack · Java · C++ · MySQL · Redux · OOPs",
  },
  {
    icon: Mail,
    label: "Email",
    value: "yogpote035@gmail.com",
    link: "mailto:yogpote035@gmail.com",
  },
  {
    icon: Phone,
    label: "Contact",
    value: "+91 8999390368",
    link: "tel:+918999390368",
  },
  {
    icon: Globe,
    label: "Portfolio",
    value: "Visit Portfolio",
    link: "https://yogeshpote.vercel.app/",
    external: true,
  },
  {
    icon: Github,
    label: "GitHub",
    value: "@yogpote035",
    link: "https://github.com/yogpote035",
    external: true,
  },
];

const ContactUs = () => {
  React.useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-orange-50 pt-24 pb-16 px-4">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white border border-orange-200 rounded-full px-4 py-1.5 mb-4">
            <Sparkles size={13} className="text-orange-400" />
            <span className="text-xs font-bold tracking-widest text-stone-400 uppercase">Developer Contact</span>
          </div>
          <h1 className="text-4xl font-black text-stone-800 mb-2">Contact Us</h1>
          <p className="text-stone-400 text-sm max-w-sm mx-auto">
            Questions, collaborations, or support? Feel free to reach out.
          </p>
        </div>

        {/* Contact Card */}
        <div className="bg-white border border-orange-200 rounded-2xl shadow-sm overflow-hidden">
          {contactDetails.map((detail, idx) => {
            const Icon = detail.icon;
            return (
              <div
                key={idx}
                className={`flex items-center gap-4 px-6 py-4 ${idx !== contactDetails.length - 1 ? "border-b border-orange-100" : ""}`}
              >
                <div className="w-9 h-9 bg-orange-50 border border-orange-200 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-orange-500" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-stone-400 leading-none mb-1">
                    {detail.label}
                  </p>
                  {detail.link ? (
                    <a
                      href={detail.link}
                      target={detail.external ? "_blank" : undefined}
                      rel={detail.external ? "noopener noreferrer" : undefined}
                      className="text-sm font-semibold text-orange-500 hover:text-orange-400 inline-flex items-center gap-1 transition-colors"
                    >
                      {detail.value}
                      {detail.external && <ExternalLink size={12} className="flex-shrink-0" />}
                    </a>
                  ) : (
                    <p className="text-sm font-semibold text-stone-700 truncate">{detail.value}</p>
                  )}
                </div>
              </div>
            );
          })}

          {/* CTA footer */}
          <div className="px-6 py-5 bg-orange-50 border-t border-orange-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-0.5">Open to opportunities</p>
              <p className="text-sm text-stone-600 font-medium">💡 Collaborations & exciting projects welcome!</p>
            </div>
            <a
              href="mailto:yogpote035@gmail.com"
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 active:scale-95 text-white font-bold px-5 py-2.5 rounded-xl transition-all text-xs tracking-wide flex-shrink-0"
            >
              <Mail size={14} />
              Send Email
              <ArrowRight size={13} />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ContactUs;