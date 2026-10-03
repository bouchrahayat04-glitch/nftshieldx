import React, { useState, useEffect } from 'react';
import Layout from '../Component/layout/Layout';
import Header from '../Component/reuseableComponent/Header';
import NFTCard from '../Component/reuseableComponent/NFTCard';
import { BrowserProvider, InfuraProvider, Contract, formatEther } from 'ethers';

const MARKETPLACE_ADDRESS = process.env.REACT_APP_MARKETPLACE_CONTRACT;
const NFT_CONTRACT = process.env.REACT_APP_NFT_CONTRACT;

const MARKETPLACE_ABI = [
  // Minimal ABI for checking listing and cancelling
  "function getListing(address nft, uint256 tokenId) view returns (uint256 price, address seller)",
  "function cancelListing(address nft, uint256 tokenId) external"
];

const NFT_CONTRACT_ABI = [
  "function tokensOfOwner(address) view returns (uint256[])",
  "function tokenURI(uint256) view returns (string)"
];

const ListNFTs = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // removeListing: after a successful cancellation, remove the token from state
  const removeListing = (nftAddress, tokenId) => {
    setListings(prev =>
      prev.filter(l => !(l.nftAddress === nftAddress && l.tokenId === tokenId))
    );
  };

  useEffect(() => {
    const fetchListings = async () => {
      try {
        let provider;
        if (window.ethereum) {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          provider = new BrowserProvider(window.ethereum);
        } else {
          provider = new InfuraProvider("sepolia", process.env.REACT_APP_INFURA_PROJECT_ID);
        }

        // Get connected user address from signer
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();

        // Instantiate the NFT contract and marketplace contract
        const nftContract = new Contract(NFT_CONTRACT, NFT_CONTRACT_ABI, provider);
        const marketplace = new Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider);

        // Get all tokens owned by the user
        const tokenIds = await nftContract.tokensOfOwner(userAddress);

        const listingsData = [];
        // For each token, check if it's listed in the marketplace
        for (let i = 0; i < tokenIds.length; i++) {
          const tokenId = tokenIds[i];
          try {
            const listing = await marketplace.getListing(NFT_CONTRACT, tokenId);
            // Only consider tokens that are actively listed (price > 0)
            if (listing.price > 0) {
              const tokenIdStr = tokenId.toString();
              let uri = await nftContract.tokenURI(tokenId);
              // Convert IPFS URIs to HTTP URLs
              if (uri.startsWith("ipfs://")) {
                uri = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
              }
              const response = await fetch(uri);
              const metadata = await response.json();

              listingsData.push({
                tokenId: tokenIdStr,
                price: formatEther(listing.price),
                seller: listing.seller,
                nftAddress: NFT_CONTRACT,
                ...metadata
              });
            }
          } catch (err) {
            console.error(`Error fetching listing for token ${tokenId.toString()}:`, err);
          }
        }

        setListings(listingsData);
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  return (
    <Layout>
      <Header>My Listed NFTs</Header>
      {loading ? (
        <p className="text-center text-white">Loading listings...</p>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 mx-auto lg:gap-4">
          {listings.map((listing, index) => (
            <div key={index}>
              <NFTCard nft={listing} onCancelSuccess={removeListing} />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400">No NFTs listed.</p>
      )}
    </Layout>
  );
};

export default ListNFTs;
