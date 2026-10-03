import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Layout from '../Component/layout/Layout';
import TypingHeader from '../Component/LandingPage/TypingHeader';
import { Link } from 'react-router-dom';
import NFTCard from '../Component/reuseableComponent/NFTCard';

const MARKETPLACE_ADDRESS = process.env.REACT_APP_MARKETPLACE_CONTRACT;


const NFT_ABI = [
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  }
];

const MARKETPLACE_ABI = [
  {
    inputs: [],
    name: 'getAllListings',
    outputs: [
      { internalType: 'address[]', name: 'nftAddrs', type: 'address[]' },
      { internalType: 'uint256[]', name: 'tokenIds', type: 'uint256[]' },
      { internalType: 'uint256[]', name: 'prices', type: 'uint256[]' },
      { internalType: 'address[]', name: 'sellers', type: 'address[]' }
    ],
    stateMutability: 'view',
    type: 'function'
  }
];

const resolveIPFS = (uri) => {
  if (uri.startsWith('ipfs://')) {
    return uri.replace('ipfs://', 'https://ipfs.io/ipfs/');
  }
  return uri;
};

const DiscoverNFTs = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // or 'oldest'


  useEffect(() => {
    const fetchListings = async () => {
      try {
        if (!MARKETPLACE_ADDRESS) {
          console.error('Marketplace contract address not defined');
          return;
        }

        if (!window.ethereum) return alert('Please install MetaMask');

        const provider = new ethers.BrowserProvider(window.ethereum);
        const marketplace = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider);
        const [nftAddrs, tokenIds, prices, sellers] = await marketplace.getAllListings();

        const listingMap = new Map();

        tokenIds.forEach((tokenId, i) => {
          const key = `${nftAddrs[i].toLowerCase()}-${tokenId}`;
          if (!listingMap.has(key)) {
            listingMap.set(key, {
              tokenId: tokenId.toString(),
              contract: nftAddrs[i],
              price: ethers.formatEther(prices[i]),
              seller: sellers[i]
            });
          }
        });

        const uniqueListings = Array.from(listingMap.values());

        const listedNFTs = await Promise.all(
          uniqueListings.map(async (listing) => {
            try {
              const nftContract = new ethers.Contract(listing.contract, NFT_ABI, provider);
              const uri = await nftContract.tokenURI(listing.tokenId);
              const owner = await nftContract.ownerOf(listing.tokenId);

              const res = await fetch(resolveIPFS(uri));
              if (!res.ok) throw new Error(`Failed to fetch metadata: ${res.statusText}`);

              const metadata = await res.json();

              return {
                id: `${listing.contract}-${listing.tokenId}`,
                tokenId: listing.tokenId,
                contract: listing.contract,
                price: listing.price,
                seller: listing.seller,
                owner,
                ...metadata
              };
            } catch (err) {
              console.warn('Error loading NFT metadata:', err);
              return null;
            }
          })
        );

        setNfts(listedNFTs.filter(Boolean));
      } catch (error) {
        console.error('Error fetching NFTs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const filteredAndSortedNFTs = nfts
    .filter(nft => {
      const price = parseFloat(nft.price);
      const min = parseFloat(minPrice) || 0;
      const max = parseFloat(maxPrice) || Infinity;
      return price >= min && price <= max;
    })
    .sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row justify-between items-center">
        <aside className="lg:w-1/2 text-white space-y-4 lg:space-y-8">
          <TypingHeader />
          <br /><br />
        </aside>
        
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 px-4">
        {loading && (
          <p className="text-center text-white col-span-full">Loading NFTs...</p>
        )}
        {!loading && nfts.length === 0 && (
          <p className="text-center text-white col-span-full">No NFTs listed yet.</p>
        )}
        {nfts.map((nft) => (
          <Link to={`/nft/${nft.id}`} key={nft.id}>
            <NFTCard nft={nft} />
          </Link>
        ))}
      </div>
    </Layout>
  );
};

export default DiscoverNFTs;
