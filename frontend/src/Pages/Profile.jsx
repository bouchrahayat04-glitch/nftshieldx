/* global BigInt */

/* Profile.jsx */

import React, { useState, useEffect } from 'react';
import Layout from '../Component/layout/Layout';
import axios from 'axios';
import { ethers } from 'ethers';

// ====== REPLACE with your actual environment variables ======
const CONTRACT_ADDRESS = process.env.REACT_APP_NFT_CONTRACT;
const MARKETPLACE_ADDRESS = process.env.REACT_APP_MARKETPLACE_CONTRACT;
const ALCHEMY_API_KEY = process.env.REACT_APP_ALCHEMY_API_KEY;

// ====== ABI for your NFT contract (Profiles.jsx) ======
const ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
    "name": "tokensOfOwner",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "tokenURI",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "ownerOf",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "address", "name": "operator", "type": "address" }
    ],
    "name": "isApprovedForAll",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "operator", "type": "address" },
      { "internalType": "bool", "name": "approved", "type": "bool" }
    ],
    "name": "setApprovalForAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// ====== ABI for your Marketplace (Profiles.jsx) ======
const MARKETPLACE_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "nft", "type": "address" },
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "internalType": "uint256", "name": "price", "type": "uint256" }
    ],
    "name": "listItem",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "nft", "type": "address" },
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "getListing",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "price", "type": "uint256" },
          { "internalType": "address", "name": "seller", "type": "address" }
        ],
        "internalType": "struct NFTMarketplace.Listing",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const defaultAvatar = "/profile-pictures/pp.jpg";

// Helper to normalize token IDs (convert hex to decimal strings)
function normalizeTokenId(tokenId) {
  if (typeof tokenId === "string" && tokenId.startsWith("0x")) {
    return parseInt(tokenId, 16).toString();
  }
  return tokenId.toString();
}

const Profile = () => {
  // =======================
  // 1) PROFILE STATE
  // =======================
  const [profile, setProfile] = useState({
    username: 'Anonymous',
    bio: 'NFT Collector & Blockchain Enthusiast',
    avatar: defaultAvatar,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  // =======================
  // 2) NFT STATES
  // =======================
  const [nfts, setNfts] = useState([]);         // minted NFTs from your contract
  const [walletNfts, setWalletNfts] = useState([]); // other NFTs from Alchemy
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [filter, setFilter] = useState('shieldx');

  // =======================
  // 3) USE EFFECTS
  // =======================
  useEffect(() => {
    // Load wallet from localStorage if present
    const wallet = localStorage.getItem("walletAddress");
    if (wallet && wallet !== "null") {
      setWalletAddress(wallet);
    }
  }, []);

  useEffect(() => {
    if (walletAddress) {
      fetchProfile(walletAddress);
      loadUserNFTs(walletAddress);
      loadWalletNFTs(walletAddress);
    }
  }, [walletAddress]);

  // =======================
  // 4) FETCH USER PROFILE
  // =======================
  const fetchProfile = async (wallet) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/profile/${wallet}`);
      setProfile(response.data);
    } catch (error) {
      console.error("❌ Error fetching profile:", error);
    }
  };

  // =======================
  // 5) LOAD NFTs (from old Profiles.jsx)
  // =======================
  const loadUserNFTs = async (wallet) => {
    try {
      if (!window.ethereum) throw new Error('MetaMask not detected');
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

      const tokenIds = await contract.tokensOfOwner(wallet);
      const nftData = await Promise.all(
        tokenIds.map(async (tokenId) => {
          const normalizedId = normalizeTokenId(tokenId.toString());
          const uri = await contract.tokenURI(tokenId);
          const response = await fetch(uri.replace("ipfs://", "https://ipfs.io/ipfs/"));
          const metadata = await response.json();
          return {
            tokenId: normalizedId,
            contract: CONTRACT_ADDRESS.toLowerCase(),
            ...metadata,
          };
        })
      );
      setNfts(nftData);
    } catch (error) {
      console.error("Error loading NFTs from your contract:", error);
    }
  };

  const loadWalletNFTs = async (wallet) => {
    try {
      const response = await fetch(
        `https://eth-sepolia.g.alchemy.com/nft/v2/${ALCHEMY_API_KEY}/getNFTs?owner=${wallet}`
      );
      const data = await response.json();
      const parsed = (data.ownedNfts || [])
        .filter(nft => nft.media && nft.media[0]?.gateway)
        .map((nft) => {
          const normalizedId = normalizeTokenId(nft.id.tokenId);
          return {
            contract: nft.contract.address.toLowerCase(),
            tokenId: normalizedId,
            image: nft.media[0].gateway,
            name: nft.title || `NFT #${normalizedId}`,
            description: nft.description || ''
          };
        });
      setWalletNfts(parsed);
    } catch (error) {
      console.error("Error loading NFTs from Alchemy:", error);
    }
  };

  // =======================
  // 6) LIST NFT (from old Profiles.jsx)
  // =======================
  const handleListNFT = async (nft) => {
    try {
      if (!window.ethereum) return alert("MetaMask not detected");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      const nftContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      const marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);

      // 1) Ownership Check
      const actualOwner = await nftContract.ownerOf(BigInt(nft.tokenId));
      if (actualOwner.toLowerCase() !== userAddress.toLowerCase()) {
        return alert("❌ You are not the owner of this NFT.");
      }

      // 2) Check if already listed
      let listing = { price: 0n, seller: ethers.ZeroAddress };
      try {
        listing = await marketplace.getListing(CONTRACT_ADDRESS, BigInt(nft.tokenId));
      } catch (e) {
        console.warn("⚠️ Couldn't fetch listing. Assuming not listed.", e);
      }
      if (listing.price > 0n) {
        return alert("⚠️ This NFT is already listed.");
      }

      // 3) Check Approval
      const isApproved = await nftContract.isApprovedForAll(userAddress, MARKETPLACE_ADDRESS);
      if (!isApproved) {
        const approvalTx = await nftContract.setApprovalForAll(MARKETPLACE_ADDRESS, true);
        await approvalTx.wait();
        alert("✅ Marketplace approved to manage your NFTs.");
      }

      // 4) Ask for price & list
      const priceInEth = prompt("Enter listing price in ETH for " + nft.name);
      if (!priceInEth || isNaN(priceInEth)) return alert("❌ Invalid price.");
      const priceWei = ethers.parseEther(priceInEth);

      const tx = await marketplace.listItem(CONTRACT_ADDRESS, BigInt(nft.tokenId), priceWei);
      await tx.wait();
      alert("✅ NFT listed successfully!");
    } catch (error) {
      console.error("❌ Listing failed:", error);
      if (error.code === "CALL_EXCEPTION") {
        alert("❌ Listing failed: Call exception. Check ownership or contract.");
      } else if (error.code === "UNPREDICTABLE_GAS_LIMIT") {
        alert("❌ Listing failed: Cannot estimate gas. Check approval, ownership, or price.");
      } else {
        alert("❌ Failed to list NFT: " + error.message);
      }
    }
  };

  // =======================
  // 7) PROFILE EDIT / SAVE
  // =======================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "nftSheildX");

    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/dkkljikqa/image/upload",
      formData
    );
    return response.data.secure_url;
  };

  const handleSave = async () => {
    if (!walletAddress) {
      alert("⚠️ Wallet not connected.");
      return;
    }
    try {
      let avatarUrl = profile.avatar;
      if (selectedFile) {
        avatarUrl = await uploadImageToCloudinary(selectedFile);
      }
      const response = await axios.put("http://localhost:5000/api/profile/edit", {
        walletAddress,
        username: profile.username,
        avatar: avatarUrl,
        bio: profile.bio,
      });
      if (response.data.message === "✅ Profile updated") {
        alert("✅ Profile saved!");
        setProfile((prev) => ({ ...prev, avatar: avatarUrl }));
        setEditMode(false);
      } else {
        alert("❌ Failed to save profile.");
      }
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      alert("⚠️ Server error.");
    }
  };

  // =======================
  // 8) NFT FILTER & MODAL LOGIC
  // =======================
  const openNFTModal = (nft) => setSelectedNFT(nft);
  const closeNFTModal = () => setSelectedNFT(null);

  const isDuplicate = (nft, index, self) =>
    index === self.findIndex(t => t.tokenId === nft.tokenId && t.contract === nft.contract);

  const isNotShieldX = (nft) => nft.contract !== CONTRACT_ADDRESS?.toLowerCase();
  const isNotInShieldX = (walletNft) =>
    !nfts.some(shieldxNft =>
      shieldxNft.tokenId === walletNft.tokenId && shieldxNft.contract === walletNft.contract
    );

  const filteredNFTs =
    filter === 'shieldx'
      ? nfts
      : filter === 'wallet'
        ? walletNfts.filter(isNotShieldX).filter(isNotInShieldX)
        : [...nfts, ...walletNfts.filter(isNotInShieldX)].filter(isDuplicate);

  // =======================
  // 9) RENDER
  // =======================
  return (
    <Layout>
      <div className="min-h-screen px-6 py-10 lg:px-20 lg:py-1 bg-[#050d1c] text-white">
        {/* ========= TOP SECTION (Profile info) ========= */}
        <div className="flex flex-col lg:flex-row items-start gap-10">
          <div className="flex flex-col items-center">
            <img
              src={selectedFile ? URL.createObjectURL(selectedFile) : profile.avatar}
              alt="Profile"
              className="w-80 h-80 rounded-full object-cover shadow-lg border-4 border-white"
            />
            {editMode && (
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) setSelectedFile(file);
                }}
                className="mt-4"
              />
            )}
          </div>
          <aside className="flex-1 max-w-xl">
            {editMode ? (
              <>
                <input
                  type="text"
                  name="username"
                  value={profile.username}
                  onChange={handleChange}
                  className="border border-gray-300 text-black p-2 mb-2 w-full rounded"
                  placeholder="Your Name"
                />
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  className="border border-gray-300 text-black p-2 mb-2 w-full rounded"
                  placeholder="Your Bio"
                />
                <button
                  onClick={handleSave}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-2"
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <h2 className="text-6xl font-bold mb-6">{profile.username}</h2>
                <p className="text-gray-300 mb-6">{profile.bio}</p>
                {walletAddress && (
                  <p className="text-sm text-blue-400 mb-6">
                    Connected Wallet: <span className="font-mono">{walletAddress}</span>
                  </p>
                )}
                <button
                  onClick={() => setEditMode(true)}
                  className="mt-6 bg-gradient-to-l from-blue-400 via-purple-600 to-pink-500 hover:bg-gradient-to-r text-white font-bold py-2 px-4 rounded"
                >
                  Edit Profile
                </button>
              </>
            )}
          </aside>
        </div>

      
        {/* ========= TITLE + FILTER TABS ========= */}
        <div className="mt-20 w-full flex justify-between items-center flex-wrap gap-4">
          <h2 className="text-6xl font-bold text-white">My NFT Collections</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('shieldx')}
              className={`px-4 py-2 rounded-full border ${filter === 'shieldx' ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              NFTShieldX
            </button>
            <button
              onClick={() => setFilter('wallet')}
              className={`px-4 py-2 rounded-full border ${filter === 'wallet' ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              Wallet NFTs
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full border ${filter === 'all' ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              All
            </button>
          </div>
        </div>

        {/* ========= NFT GALLERY ========= */}
        <div className="mt-20 w-full">
          {filteredNFTs.length > 0 ? (
            <div className="mt-14 flex flex-wrap gap-6 justify-center">
              {filteredNFTs.map((nft, index) => (
                <div
                  key={index}
                  onClick={() => openNFTModal(nft)}
                  className="w-60 p-4 rounded-lg cursor-pointer 
                             hover:shadow-lg hover:shadow-blue-500/50 transition-shadow"
                >
                  <img
                    src={
                      nft.image?.startsWith("ipfs://")
                        ? nft.image.replace("ipfs://", "https://ipfs.io/ipfs/")
                        : nft.image
                    }
                    alt={nft.name}
                    className="w-full h-72 object-cover rounded"
                  />
                  <h3 className="text-white mt-4 text-center text-xl font-bold">
                    {nft.name}
                  </h3>
                  {nft.description && (
                    <p className="text-gray-400 text-center mt-1 text-sm">
                      {nft.description.substring(0, 60)}
                      {nft.description.length > 60 ? '...' : ''}
                    </p>
                  )}
                  {nft.contract === CONTRACT_ADDRESS?.toLowerCase() && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleListNFT(nft);
                      }}
                      className="block mx-auto mt-4 bg-blue-600 hover:bg-blue-700 
                                 text-white font-bold py-1 px-3 rounded"
                    >
                      List
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400">No NFTs found.</p>
          )}
        </div>

        {/* ========= MODAL ========= */}
        {selectedNFT && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={closeNFTModal}
          >
            <div
              className="bg-gray-800 p-6 rounded max-w-md w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeNFTModal}
                className="absolute top-2 right-2 text-gray-300 hover:text-white"
              >
                ✕
              </button>
              <img
                src={
                  selectedNFT.image?.startsWith("ipfs://")
                    ? selectedNFT.image.replace("ipfs://", "https://ipfs.io/ipfs/")
                    : selectedNFT.image
                }
                alt={selectedNFT.name}
                className="w-full h-64 object-cover rounded"
              />
              <h3 className="text-xl font-bold mt-4">{selectedNFT.name}</h3>
              <p className="text-gray-400 mt-2">{selectedNFT.description}</p>
              <p className="text-gray-400 mt-2">
                <strong>Token ID:</strong> {selectedNFT.tokenId}
              </p>
              {selectedNFT.contract && (
                <p className="text-gray-400 mt-1">
                  <strong>Contract:</strong> {selectedNFT.contract.slice(0, 6)}...
                  {selectedNFT.contract.slice(-4)}{' '}
                  <button
                    onClick={() => navigator.clipboard.writeText(selectedNFT.contract)}
                    className="text-blue-400 underline ml-1"
                  >
                    Copy
                  </button>
                </p>
              )}
              {selectedNFT.contract && selectedNFT.tokenId && (
                <p className="mt-2">
                  <a
                    href={`https://sepolia.etherscan.io/token/${selectedNFT.contract}?a=${
                      selectedNFT.tokenId.startsWith("0x")
                        ? parseInt(selectedNFT.tokenId, 16)
                        : selectedNFT.tokenId
                    }`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline"
                  >
                    View on Etherscan
                  </a>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
