import React from "react";
import { 
  Mail, 
  Phone, 
  User, 
  GraduationCap, 
  Code2, 
  ExternalLink, 
  Github, 
  Globe,
  MessageCircle,
  Sparkles
} from "lucide-react";

const ContactUs = () => {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const contactDetails = [
    {
      icon: <User size={20} strokeWidth={2} />,
      label: "Name",
      value: "Yogesh Pote",
      color: "blue"
    },
    {
      icon: <GraduationCap size={20} strokeWidth={2} />,
      label: "Education",
      value: "B.Sc. Computer Science",
      color: "purple"
    },
    {
      icon: <Code2 size={20} strokeWidth={2} />,
      label: "Tech Stack",
      value: "MERN Stack, Java, C++, MySQL, Redux, OOPs",
      color: "green"
    },
    {
      icon: <Mail size={20} strokeWidth={2} />,
      label: "Email",
      value: "yogpote035@gmail.com",
      link: "mailto:yogpote035@gmail.com",
      color: "orange"
    },
    {
      icon: <Phone size={20} strokeWidth={2} />,
      label: "Contact",
      value: "+91 8999390368",
      link: "tel:+918999390368",
      color: "rose"
    },
    {
      icon: <Globe size={20} strokeWidth={2} />,
      label: "Portfolio",
      value: "Visit Portfolio",
      link: "https://yogpote035.github.io/Portfolio-Website/",
      external: true,
      color: "indigo"
    },
    {
      icon: <Github size={20} strokeWidth={2} />,
      label: "GitHub",
      value: "@yogpote035",
      link: "https://github.com/yogpote035",
      external: true,
      color: "white"
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: "from-blue-500 to-blue-600 text-blue-500",
      purple: "from-purple-500 to-purple-600 text-purple-500",
      green: "from-green-500 to-green-600 text-green-500",
      orange: "from-orange-500 to-orange-600 text-orange-500",
      rose: "from-rose-500 to-rose-600 text-rose-500",
      indigo: "from-indigo-500 to-indigo-600 text-indigo-500",
      gray: "from-gray-600 to-gray-700 text-gray-600"
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-100 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-6">
            <MessageCircle size={32} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Contact Us
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto leading-relaxed">
            If you have any questions, project collaborations, or need support, feel free to reach out.
          </p>
        </div>

        {/* Developer Info Card */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <User size={28} className="text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  Developer Info
                  <Sparkles size={20} className="text-yellow-300" />
                </h2>
                <p className="text-blue-100 text-sm">Full Stack Developer</p>
              </div>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-6 space-y-4">
            {contactDetails.map((detail, index) => {
              const colorClasses = getColorClasses(detail.color);
              const iconColor = colorClasses.split(' ')[2];
              
              return (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  <div className="flex-shrink-0 bg-white dark:bg-gray-600 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-500">
                    <div className={iconColor}>
                      {detail.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      {detail.label}
                    </p>
                    {detail.link ? (
                      <a
                        href={detail.link}
                        target={detail.external ? "_blank" : undefined}
                        rel={detail.external ? "noopener noreferrer" : undefined}
                        className={`${iconColor} dark:opacity-90 hover:underline font-medium inline-flex items-center gap-1 group`}
                      >
                        {detail.value}
                        {detail.external && (
                          <ExternalLink size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        )}
                      </a>
                    ) : (
                      <p className="text-gray-800 dark:text-gray-200 font-medium">
                        {detail.value}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-8 text-center">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border border-blue-200 dark:border-gray-600 rounded-xl p-6">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              💡 Open to exciting opportunities and collaborations!
            </p>
            <a
              href="mailto:yogpote035@gmail.com"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg hover:scale-105"
            >
              <Mail size={20} />
              Send an Email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;