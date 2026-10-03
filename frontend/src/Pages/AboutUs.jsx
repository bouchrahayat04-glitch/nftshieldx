import React, { useState } from "react";
import Layout from "../Component/layout/Layout";
import Button from "../Component/reuseableComponent/Button";
import { Link } from "react-router-dom";

const AboutUs = () => {
  const [faqOpen, setFaqOpen] = useState(null);

  const toggleFAQ = (index) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#0a0a23] text-white px-8 py-16 space-y-32">

        {/* Header */}
        <h1 className="text-5xl font-bold text-center">
          <span className="logo text-5xl font-bold">About</span>
          <span className="ml-2 bg-gradient-to-l from-blue-400 via-purple-600 to-pink-500 bg-clip-text text-transparent">Us</span>
        </h1>

        {/* Our Mission */}
        <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-6xl mx-auto 
        border border-violet-700 rounded-2xl p-10 bg-[#111132] shadow-lg">
          <div className="md:w-1/2 mb-10 md:mb-0 flex justify-center">
            <img
              src="/blocks.jpg"
              alt="About NFTShieldX"
              className="w-full h-64 object-cover rounded-xl shadow-lg border-4 border-white max-w-sm"
            />
          </div>
          <div className="w-full md:w-1/2 md:pl-10 text-lg leading-relaxed text-white">
            <h2 className="text-4xl font-semibold mb-6">Our Mission</h2>
            <p className="mb-8">
              We're building a trusted gateway to the world of NFTs — where transparency, security, and accessibility come first.
              Our goal is to make NFTs user-friendly for everyone, from first-time buyers to experienced collectors.
            </p>
            <Link to="/contact">
              <Button
                bg="bg-gradient-to-l from-blue-400 via-purple-600 to-pink-500"
                textColor="text-white"
                btnText="Contact Us"
                className="py-3 px-6 rounded-full hover:bg-gradient-to-r text-xl font-bold"
              />
            </Link>
          </div>
        </div>

        {/* Meet Our Team */}
        <div className="w-full max-w-6xl mx-auto border border-violet-700 rounded-2xl p-10 bg-[#111132] shadow-lg">
          <h2 className="text-4xl font-bold text-center mb-16">Meet Our Team</h2>
          {[
            {
              name: "Bouchra Hayat",
              title: "frontend developer",
              image: "Bouchra.jpg",
              desc: "I made sure the user interface was not only intuitive but also secure. I implemented Web3 wallet connection, captcha validation, and protected user inputs to prevent XSS and injection attacks.Security Focus: Safe wallet integration, reCAPTCHA, secure input handling.Tools: React.js, Tailwind CSS, MetaMask, reCAPTCHA",
              reverse: false,
            },
            {
              name: "Malak Elferdaous Alioua",
              title: "Backend developer",
              image: "malak.jpg",
              desc: "I handled the backend of NFTShieldX, built with Node.js and MongoDB. I ensured secure authentication using JWTs, sanitized API routes, and integrated safe data flows between the database and the blockchain.Security Focus: API protection, JWT auth, secure DB queries, rate limiting.Tools: Node.js, Express.js, MongoDB, JWT",
              reverse: true,
            },
            {
              name: "Hamza Bahalloul",
              title: "Creative Director",
              image: "Hamza.jpg",
              desc: "I worked on developing and testing the smart contracts behind NFTShieldX with a focus on integrity and verification. I also contributed to ZKP-based admin authentication to ensure access control without revealing identities.Security Focus: Role verification with Merkle trees, ZKPs, and secure admin-only actions.Tools: Solidity, Circom, SnarkJS, Merkle trees",
              reverse: false,
            },
            {
              name: "Youssef Ladnany",
              title: "Co-developer of the NFTShieldX smart contract",
              image: "Youssef.jpg",
              desc: "I focused on writing secure, gas-efficient Solidity code and integrating protections against common blockchain attacks like reentrancy and overflow. I also helped design logic to prevent duplicate NFTs using hash-based validation.Security Focus: Smart contract audits, safe minting logic, anti-fraud image hashing.Tools: Solidity, Hardhat, OpenZeppelin, IPFS",
              reverse: true,
            }
          ].map((member, index, array) => (
            <div key={index} className="w-full">
              <div className={`flex flex-col md:flex-row items-center ${member.reverse ? "md:flex-row-reverse" : ""} mb-10`}>
                <div className="w-full md:w-1/2 flex justify-center mb-6 md:mb-0">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-64 h-64 object-cover rounded-full shadow-lg border-4 border-white max-w-sm"
                  />
                </div>
                <div className="w-full md:w-1/2 md:px-10 text-white text-center md:text-left">
                  <h3 className="text-2xl font-semibold">{member.name}</h3>
                  <p className="text-sm text-violet-400 mb-2">{member.title}</p>
                  <p className="text-gray-300">{member.desc}</p>
                </div>
              </div>
              {index < array.length - 1 && <hr className="border-t border-violet-700 my-8" />}
            </div>
          ))}
        </div>

        {/* Our Vision */}
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Our Vision</h2>
          <p className="text-gray-300">
            We envision a world where everyone — artists, collectors, and enthusiasts — can explore, create, and trade digital assets freely and securely.
          </p>
        </div>

        {/* Core Values */}
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">Core Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: "🛡️", title: "Security" },
              { icon: "🎨", title: "Creativity" },
              { icon: "🌐", title: "Accessibility" },
              { icon: "🤝", title: "Trust" },
            ].map((val, i) => (
              <div key={i} className="bg-[#111132] border border-violet-700 rounded-xl py-8 px-4 shadow text-white">
                <div className="text-4xl mb-2">{val.icon}</div>
                <h3 className="text-xl font-semibold">{val.title}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* Roadmap */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-6 text-center">Roadmap</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-3">
            <li>🚀 Launched MVP – Jan 2024</li>
            <li>🎯 Profile System – Mar 2024</li>
            <li>🧠 AI-Powered Fraud Detection – Coming Soon</li>
            <li>📱 Mobile App – Q4 2025</li>
          </ul>
        </div>

        {/* Testimonials */}
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">What People Are Saying</h2>
          <blockquote className="italic text-gray-400 mb-8">"NFTShieldX made it super easy to mint my first NFT without worrying about scammers. Love it!" — Alex R.</blockquote>
          <blockquote className="italic text-gray-400">"Super smooth interface and great security. I’m sticking with it!" — Dana W.</blockquote>
        </div>

        {/* Newsletter */}
        <div className="max-w-4xl mx-auto bg-[#111132] p-8 rounded-xl border border-violet-700 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-gray-400 mb-6">Get the latest on drops, updates, and exclusive offers.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <input
              type="email"
              placeholder="Your email"
              className="p-3 rounded-full w-full sm:w-2/3 text-black"
            />
            <Button
              btnText="Subscribe"
              bg="bg-gradient-to-l from-blue-400 via-purple-600 to-pink-500"
              textColor="text-white"
              className="px-6 py-3 rounded-full font-bold"
            />
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-6 text-center">FAQs</h2>
          {[
            { q: "How do I mint an NFT?", a: "You can mint NFTs by uploading your image and metadata, then confirming the transaction with MetaMask." },
            { q: "Can I list NFTs for sale?", a: "Soon! Marketplace features are under development." },
            { q: "What if my image was already minted?", a: "We use image hashing to prevent duplicates — you’ll get a warning before minting." },
          ].map((item, i) => (
            <div key={i} className="mb-4 border border-gray-700 rounded-xl p-4 cursor-pointer" onClick={() => toggleFAQ(i)}>
              <h3 className="text-lg font-semibold text-white">{item.q}</h3>
              {faqOpen === i && <p className="text-gray-300 mt-2">{item.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default AboutUs;
