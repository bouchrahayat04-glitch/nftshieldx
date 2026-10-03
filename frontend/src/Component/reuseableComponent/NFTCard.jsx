import React, { useEffect, useState } from 'react';
import { BrowserProvider, Contract } from 'ethers';

const MARKETPLACE_ABI = [
  "function cancelListing(address nft, uint256 tokenId) external"
];

const MARKETPLACE_ADDRESS = process.env.REACT_APP_MARKETPLACE_CONTRACT;

const NFTCard = ({ nft, onCancelSuccess }) => {
  const {
    tokenId,
    price,
    seller,
    nftAddress,
    image,
    name,
    description,
  } = nft;

  const [userAddress, setUserAddress] = useState("");

  useEffect(() => {
    const storedAddress = localStorage.getItem("walletAddress");
    if (storedAddress) {
      setUserAddress(storedAddress);
    }
  }, []);

  const handleCancelListing = async () => {
    try {
      if (!window.ethereum) {
        alert("No wallet found");
        return;
      }
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const marketplace = new Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);
      const tx = await marketplace.cancelListing(nftAddress, tokenId);
      await tx.wait();

      alert("✅ Listing canceled successfully!");
      if (onCancelSuccess) onCancelSuccess(nftAddress, tokenId);
    } catch (err) {
      console.error("Error canceling listing:", err);
      alert("❌ Failed to cancel listing.");
    }
  };

  // Convert IPFS if needed
  let imageUrl = image;
  if (imageUrl?.startsWith("ipfs://")) {
    imageUrl = imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
  }

  // Determine if the cancel button should be shown
  const canCancel = userAddress && seller && userAddress.toLowerCase() === seller.toLowerCase();

  return (
    <div className="shadow-lg text-center">
      {/* Updated Image Style */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name || `Token #${tokenId}`}
          className="w-full h-[650px] rounded-xl object-cover mx-auto hover:scale-105 transition-transform duration-300"
        />
      ) : (
        <div className="w-80 h-90 flex items-center justify-center bg-gray-700 rounded-xl mx-auto">
          <p className="text-gray-300">No image available</p>
        </div>
      )}

      {/* NFT Details */}
      <h3 className="text-white mt-3 font-bold text-xl">{name || `Token #${tokenId}`}</h3>
      <p className="text-gray-400 text-sm mt-1">{description || 'No description'}</p>
      <p className="text-blue-300 mt-2 text-lg">Price: {price} ETH</p>
      <p className="text-gray-400 text-xs">Seller: {seller ? seller.slice(0,6) + "..." + seller.slice(-4) : "N/A"}</p>

      {/* Cancel Button */}
      {canCancel && (
        <button
          onClick={handleCancelListing}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded"
        >
          Cancel Listing
        </button>
      )}
    </div>
  );
};

export default NFTCard;
