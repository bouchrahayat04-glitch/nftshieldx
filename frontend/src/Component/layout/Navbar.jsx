import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import { BrowserProvider } from "ethers";
import { FaShoppingCart, FaUserCircle } from "react-icons/fa";
import { FaSearch } from "react-icons/fa"; 
import { ADMIN_ADDRESS } from "../../adminConfig";




const Navbar = () => {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [token, setToken] = useState(null); // Store JWT token
  const navigate = useNavigate(); // ✅ for redirecting
  const [showMenu, setShowMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  
  useEffect(() => {
      const delayDebounce = setTimeout(() => {
        if (searchTerm.trim()) {
          axios.get(`http://localhost:5000/api/artists/search?q=${searchTerm}`)
            .then(res => setSuggestions(res.data))
            .catch(err => console.error("Search error:", err));
        } else {
          setSuggestions([]);
        }
      }, 300); // Debounce: 300ms
    
      return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    const manuallyDisconnected = localStorage.getItem("walletDisconnected");

    if (window.ethereum && !manuallyDisconnected) {
      try {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();

        if (address) {
          setAccount(address);
          setIsConnected(true);
          localStorage.setItem("walletAddress", address);
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    }
  };
  
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install it to continue.");
      return;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const account = await signer.getAddress();
      setAccount(account);
      setIsConnected(true);
      localStorage.removeItem("walletDisconnected");

      // Step 1: Request nonce from backend
      const { data } = await axios.post("http://localhost:5000/api/auth/nonce", {
        walletAddress: account,
      });

      const nonce = data.nonce;

      // Step 2: Sign nonce with MetaMask
      const message = `Sign this message to confirm wallet ownership: ${nonce}`;
      const signature = await signer.signMessage(message);

      // Step 3: Send signature to backend for authentication
      const response = await axios.post("http://localhost:5000/api/auth/connect-wallet", {
        walletAddress: account,
        signature,
      });

      setToken(response.data.token);
      localStorage.setItem("jwtToken", response.data.token); // Store token in localStorage
      localStorage.setItem("walletAddress", account);

      alert("Wallet Connected Successfully!");

      navigate('/profile'); // ✅ Redirect to profile after connect
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet. Please try again.");
    }
  };


  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setToken(null);
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("walletAddress");
  
    //Save a disconnect flag
    localStorage.setItem("walletDisconnected", "true");
    navigate("/");
  };
  

  return (
    <nav className="fixed flex justify-between items-center w-full bg-[#050d1c] border-b p-4 px-6 lg:px-12 z-50">
      {/* Left: Logo + Menu */}
      <div className="flex items-center space-x-6">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/">
            <h1 className="text-lg font-bold text-white flex items-center">
              <span
                className="bg-gradient-to-l from-blue-400 via-purple-600 to-pink-500 
                  bg-clip-text text-transparent inline-block"
                style={{ fontSize: "30px", fontWeight: "bold", backgroundColor: "white" }}
              >
                NFT
              </span>
              <span className="ml-1 logo" style={{ fontSize: "30px", fontWeight: "bold" }}>ShieldX</span>
            </h1>
          </Link>
        </div>
    
        {/* Vertical separator */}
        <div className="border-l h-8 border-gray-400"></div>
    
        {/* Menu Items */}
        <div className="flex items-center space-x-6 text-white font-medium pl-6">
          <Link to="/" className="hover:text-blue-500 transition">Home</Link>
          <Link to="/discovery" className="hover:text-blue-500 transition">Explore</Link>
          <Link to="/artist" className="hover:text-blue-500 transition">Artists</Link>     
          <Link to="/mint" className="hover:text-blue-500 transition">Mint</Link>
          <Link to="/list" className="hover:text-blue-500 transition">List</Link>
          {/* Dropdown Menu */}
          <div className="relative inline-block text-left">
          <div>
            <button
              type="button"
              className="inline-flex justify-center w-full rounded-md py-2 bg-transparent text-sm font-medium text-white hover:text-blue-500"
              onClick={() => setShowMenu(!showMenu)}
            >
              More
            </button>
          </div>

          {showMenu && (
            <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-violet-700 ring-1 ring-black ring-opacity-5">
              <div className="py-1">
                <Link to="/about" className="block px-4 py-2 text-sm text-white hover:bg-blue-600">About Us</Link>
                <Link to="/contact" className="block px-4 py-2 text-sm text-white hover:bg-blue-600">Contact Us</Link>
                {account?.toLowerCase() === ADMIN_ADDRESS && localStorage.getItem("jwtToken") && (
                <Link to="/admin" className="block px-4 py-2 text-sm text-white hover:bg-blue-600">
                    Admin Dashboard
                </Link>
)}

              </div>
            </div>
          )}
        </div>

          

          
        </div>
      </div>
    
      {/* Right: Search bar + Icons + Wallet button */}
      <div className="flex items-center space-x-4">


        {/* Search Bar */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="pl-10 pr-3 py-1.5 rounded-lg bg-[#876ecc8b] text-white "
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
  <ul className="absolute bg-purple-100 text-black mt-2 rounded-md shadow-md z-50 w-full max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-purple-100">
    {suggestions.length > 0 ? (
      suggestions.map((artist) => (
        <li
          key={artist.walletAddress}
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          onClick={() => {
            navigate(`/artist/${artist.walletAddress}`);
            setSearchTerm("");
            setSuggestions([]);
          }}
        >
          <div className="flex items-center space-x-3">
            <img src={artist.avatar} alt="avatar" className="w-6 h-6 rounded-full" />
            <span>{artist.username}</span>
          </div>
        </li>
      ))
    ) : (
      <li className="px-4 py-2 text-gray-600 italic text-center">No results found</li>
    )}
  </ul>
)}


        </div>
        
    
    
        {/* Profile Icon */}
        <Link to="/profile" >
        <FaUserCircle className="text-white text-2xl cursor-pointer hover:text-blue-400" /> 
        </Link>
        
    
        {/* Connect/Disconnect Button */}
        {isConnected ? (
              <div className="flex flex-col items-center">
    
                <button
                  onClick={disconnectWallet}
                  className="bg-purple-700 hover:bg-violet-900 text-white font-bold py-2 px-6 rounded-lg"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-gradient-to-l from-blue-400 via-purple-600 to-pink-500 hover:bg-gradient-to-r text-white font-bold py-2 px-6 rounded-lg"
              >
                Connect Wallet
              </button>
            )}
      </div>
    </nav>
  );
};

export default Navbar;
