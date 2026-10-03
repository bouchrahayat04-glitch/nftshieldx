import React from "react";
import Layout from "../Component/layout/Layout";
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const ContactUs = () => {
  return (
    <Layout>

        <div className="max-h-screen bg-[#0a0a23] text-white px-6 py-16 flex flex-col items-center justify-center">

        {/* ✅ CENTERED TITLE ABOVE THE BOX */}
        <h1 className="text-5xl font-bold mb-12 text-center">
        <span>Contact</span>
        <span className="ml-2 bg-gradient-to-l from-blue-400 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            Us
        </span>
        </h1>
        <div className="bg-[#111132] rounded-2xl p-10 w-full max-w-6xl flex flex-col md:flex-row gap-10 border border-violet-700 shadow-lg">
          
          {/* Left - Form */}
          <div className="md:w-2/3">
            <form className="space-y-6">
              <div>
                <label className="block mb-2 text-sm">Name</label>
                <input type="text" placeholder="Your name" className="w-full p-3 rounded-xl text-black" />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block mb-2 text-sm">Email</label>
                  <input type="email" placeholder="Your email" className="w-full p-3 rounded-xl text-black" />
                </div>
                <div className="flex-1">
                  <label className="block mb-2 text-sm">Phone Number</label>
                  <input type="tel" placeholder="Your phone" className="w-full p-3 rounded-xl text-black" />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm">Message</label>
                <textarea rows="4" placeholder="Write your message..." className="w-full p-3 rounded-xl text-black"></textarea>
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-10 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-bold hover:from-purple-600 hover:to-pink-500 transition"
              >
                Submit
              </button>
            </form>
          </div>

          {/* Right - Info */}
          <div className="md:w-1/3 flex flex-col justify-center">
            <h2 className="text-4xl font-bold mb-12">
                Get In Touch 
            </h2> <br />
            <p className="text-gray-400 mb-12">
              For questions, technical assistance, or collaboration opportunities via the contact information provided.
            </p>

            <div className="flex items-center gap-4 mb-4">
              <FaPhoneAlt className="text-teal-400" />
              <span>+212 612345678</span>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <FaEnvelope className="text-teal-400" />
              <span>support@nftshieldx.com</span>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <FaMapMarkerAlt className="text-teal-400" />
              <span>Casablanca, Morocco</span>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default ContactUs;
