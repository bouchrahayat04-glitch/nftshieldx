import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Layout from "../Component/layout/Layout";

const ArtistProfile = () => {
  const { walletAddress } = useParams();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/artist-profile/${walletAddress}`);
        setArtist(res.data);
      } catch (error) {
        console.error("Error fetching artist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtist();
  }, [walletAddress]);

  if (loading) return <Layout><p className="text-white p-10">Loading artist...</p></Layout>;

  if (!artist) return <Layout><p className="text-white p-10">Artist not found.</p></Layout>;

  return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center px-4 py-10 bg-[#050d1c] text-white">
        <img
          src={artist.avatar || "/profile-pictures/pp.jpg"}
          alt="Artist Avatar"
          className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg mb-6"
        />
        <h1 className="text-4xl font-bold mb-2">{artist.username}</h1>
        <p className="text-lg text-gray-400 mb-4">{artist.bio || "No bio yet."}</p>
        <p className="text-sm text-blue-400 font-mono">Wallet: {walletAddress}</p>
      </div>
    </Layout>
  );
};

export default ArtistProfile;
