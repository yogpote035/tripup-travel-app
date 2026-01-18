import React from "react";

const ContactUs = () => {
  React.useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top only on mount
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600 dark:text-blue-400">
          Contact Us
        </h1>

        <p className="mb-4">
          If you have any questions, project collaborations, or need support,
          feel free to reach out.
        </p>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-blue-500">👨‍💻 Developer Info</h2>
            <p className="mt-2"><strong>Name:</strong> Yogesh Pote</p>
            <p><strong>Education:</strong> B.Sc. Computer Science</p>
            <p><strong>Tech Stack:</strong> MERN, Java, DSA, C++, PHP, MySQL, T-SQL, OOPs</p>
            <p>
              <strong>Email:</strong>{" "}
              <a
                href="mailto:yogpote035@gmail.com"
                className="text-blue-500 hover:underline"
              >
                yogpote035@gmail.com
              </a>
            </p>
            <p><strong>Contact:</strong> +91 8999390368</p>
            <p>
              <strong>Portfolio:</strong>{" "}
              <a
                href="https://yogpote035.github.io/Portfolio-Website/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Visit Portfolio
              </a>
            </p>
            <p>
              <strong>GitHub:</strong>{" "}
              <a
                href="https://github.com/yogpote035"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                @yogpote035
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
