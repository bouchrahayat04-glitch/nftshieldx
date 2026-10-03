import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PrivateRoute from './utils/privateRoutes';
import LandingPage from './Pages/LandingPage';
import DiscoverNFTs from './Pages/DiscoverNFTs';
import MintNFTs from './Pages/MintNFTs';
import ListNFTs from './Pages/ListNFTs';
import Profile from './Pages/Profile';
import NFTDetails from './Pages/NFTDetails';
import Artists from './Pages/Artists';
import ArtistProfile from "./Pages/ArtistProfile";
import AboutUs from './Pages/AboutUs';
import ContactUs from './Pages/ContactUs';
import ProtectedAdminRoute from "./Component/ProtectedAdminRoute"; 
import AdminPage from './Pages/AdminPage'; 
import Unauthorized from './Pages/Unauthorized';




function App() {
  const [walletAddress, setWalletAddress] = useState("");
  useEffect(() => {
    async function connectWallet() {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setWalletAddress(accounts[0]);
      }
    }

    connectWallet();
  }, []);
  return (
    <Router>
      <Routes>
       
        <Route path="/" element={<LandingPage/>} />
        <Route path="/discovery" element={<DiscoverNFTs />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/artist" element={<Artists/>} />
        <Route path="/contact" element={<ContactUs/>} />
        <Route path="/mint" element={<PrivateRoute><MintNFTs /></PrivateRoute>} />
        <Route path="/list" element={<PrivateRoute><ListNFTs /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/nft/:id" element={<NFTDetails />} />
        <Route path="/artist/:walletAddress" element={<ArtistProfile />} />
        <Route path="/admin" element={
        <ProtectedAdminRoute walletAddress={walletAddress}>
            <AdminPage />
          </ProtectedAdminRoute>
        } />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
      </Routes>
    </Router>
    
  );
}

export default App;
