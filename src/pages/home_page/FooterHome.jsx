import React from "react";
import { Link } from "react-router-dom";

const FooterHome = () => (
  <footer className="bg-gray-900 text-gray-200 py-8 mt-12">
    <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="text-center md:text-left">
        <div className="font-bold text-lg mb-1">ResellerBrain</div>
        <div className="text-sm mb-1">House 1, Road 13, Sector 13. Garib E Nawaz Avenue. Uttara Dhaka-1230</div>
        <div className="text-xs text-gray-400">&copy; {new Date().getFullYear()} ResellerBrain. All rights reserved.</div>
      </div>
      <div className="flex flex-col md:flex-row gap-2 md:gap-6 text-sm items-center">
        <Link to="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link>
        <Link to="/terms-and-conditions" className="hover:text-white transition">Terms &amp; Conditions</Link>
        <Link to="/about-us" className="hover:text-white transition">About Us</Link>
        <Link to="/contact-us" className="hover:text-white transition">Contact Us</Link>
      </div>
    </div>
  </footer>
);

export default FooterHome;
