import { Link } from "react-router-dom";

const Footer = () => {
  
  return (
    <footer className="bg-gray-800 text-white py-4 shadow-inner">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm">
        <p>&copy; {new Date().getFullYear()} TripUp. All rights reserved.</p>
        <div className="flex space-x-4 mt-2 md:mt-0">
          <Link to="/privacy-policy" className="hover:text-blue-600">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-blue-600">
            Terms
          </Link>
          <Link to="/contact" className="hover:text-blue-600">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
