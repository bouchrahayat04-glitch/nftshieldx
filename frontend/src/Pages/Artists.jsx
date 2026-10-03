import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../Component/layout/Layout";
import { Link } from "react-router-dom";

const Artists = () => {
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/artists/all");
        setArtists(response.data);
      } catch (error) {
        console.error("Failed to fetch artists:", error);
      }
    };

    fetchArtists();
  }, []);

  return (
    <Layout>
      <div className="min-h-screen px-6 py-10 bg-[#0a0a23] text-white">
        <h1 className="text-6xl font-bold mb-10 text-left">All Artists</h1>
        <br /><br />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {artists.map((artist, index) => (
            <Link to={`/artist/${artist.walletAddress}`} key={index}>
                <div className="bg-[#121229] rounded-xl p-6 shadow-md shadow-purple-700 flex flex-col items-center hover:scale-105 transition-transform">
                <img
                    src={artist.avatar || "/profile-pictures/pp.jpg"}
                    alt="Artist"
                    className="w-32 h-32 rounded-full object-cover border-2 border-white mb-4"
                />
                <h2 className="text-xl font-semibold mb-1">{artist.username}</h2>
                <p className="text-sm text-gray-400">
                    Joined: {new Date(artist.createdAt).toLocaleDateString()}
                </p>
                </div>
            </Link>
            ))}

        </div>
      </div>
    </Layout>
  );
};

export default Artists;
