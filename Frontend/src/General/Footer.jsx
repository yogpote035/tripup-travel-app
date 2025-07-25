const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-4 shadow-inner">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm">
        <p>&copy; {new Date().getFullYear()} TripUp. All rights reserved.</p>
        <div className="flex space-x-4 mt-2 md:mt-0">
          <a href="/privacy-policy" className="hover:text-blue-600">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:text-blue-600">
            Terms
          </a>
          <a href="/contact" className="hover:text-blue-600">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
