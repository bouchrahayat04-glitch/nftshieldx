import React, { useEffect, useState } from 'react';
import { BrowserProvider, Contract, formatEther } from 'ethers';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

import NFTShieldXMintingArtifact from '../NFTShieldXMinting.json';
import NFTMarketplaceArtifact from '../NFTMarketplace.json';
import Navbar from '../Component/layout/Navbar';

const NFT_CONTRACT_ADDRESS = process.env.REACT_APP_NFT_CONTRACT;
const MARKETPLACE_CONTRACT_ADDRESS = process.env.REACT_APP_MARKETPLACE_CONTRACT;
const ETHERSCAN_BASE = 'https://sepolia.etherscan.io';

function Admin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [totalMinted, setTotalMinted] = useState(0);
  const [uniqueMinters, setUniqueMinters] = useState(0);
  const [currentListings, setCurrentListings] = useState(0);
  const [totalSalesCount, setTotalSalesCount] = useState(0);
  const [totalSalesVolume, setTotalSalesVolume] = useState('0.0');
  const [averageSalePrice, setAverageSalePrice] = useState('0.0');

  const [salesOverTime, setSalesOverTime] = useState([]);
  const [topBuyers, setTopBuyers] = useState([]);
  const [topCollections, setTopCollections] = useState([]);
  const [topNfts, setTopNfts] = useState([]);

  const handleDisconnect = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line
  }, []);

  const truncateAddress = (addr) => {
    if (!addr) return '';
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard: ' + text);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Copy failed!');
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');

      if (!window.ethereum) {
        throw new Error('MetaMask not detected. Please install/enable it.');
      }

      const provider = new BrowserProvider(window.ethereum);

      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFTShieldXMintingArtifact.abi,
        provider
      );

      let supply = await nftContract.totalSupply();
      supply = Number(supply);
      setTotalMinted(supply);

      const minterSet = new Set();
      for (let i = 0; i < supply; i++) {
        const tokenIdBN = await nftContract.tokenByIndex(i);
        const tokenId = Number(tokenIdBN);
        try {
          const owner = await nftContract.ownerOf(tokenId);
          minterSet.add(owner.toLowerCase());
        } catch {}
      }
      setUniqueMinters(minterSet.size);

      const marketplace = new Contract(
        MARKETPLACE_CONTRACT_ADDRESS,
        NFTMarketplaceArtifact.abi,
        provider
      );

      const [nftAddrs, tokenIds, prices, sellers] = await marketplace.getAllListings();
      setCurrentListings(tokenIds.length);

      const boughtFilter = marketplace.filters.ItemBought();
      const boughtEvents = await marketplace.queryFilter(boughtFilter, 0, 'latest');
      setTotalSalesCount(boughtEvents.length);

      let volume = 0;
      for (const evt of boughtEvents) {
        volume += parseFloat(formatEther(evt.args.price));
      }
      setTotalSalesVolume(volume.toFixed(3));
      setAverageSalePrice(boughtEvents.length > 0 ? (volume / boughtEvents.length).toFixed(3) : '0.0');

      analyzeSalesData(boughtEvents, provider);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error fetching admin stats.');
    } finally {
      setLoading(false);
    }
  };

  const analyzeSalesData = async (boughtEvents, provider) => {
    const salesByDay = {};
    for (const evt of boughtEvents) {
      const block = await provider.getBlock(evt.blockNumber);
      const dayStr = new Date(block.timestamp * 1000).toISOString().slice(0, 10);

      const priceNum = parseFloat(formatEther(evt.args.price));
      if (!salesByDay[dayStr]) {
        salesByDay[dayStr] = { count: 0, volume: 0 };
      }
      salesByDay[dayStr].count += 1;
      salesByDay[dayStr].volume += priceNum;
    }
    const sortedDays = Object.keys(salesByDay).sort();
    const overTimeArr = sortedDays.map((day) => ({
      date: day,
      count: salesByDay[day].count,
      volume: salesByDay[day].volume.toFixed(3),
    }));
    setSalesOverTime(overTimeArr);

    const buyerMap = {};
    for (const evt of boughtEvents) {
      const buyer = evt.args.buyer.toLowerCase();
      const spent = parseFloat(formatEther(evt.args.price));
      buyerMap[buyer] = (buyerMap[buyer] || 0) + spent;
    }
    const sortedBuyers = Object.entries(buyerMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([addr, totalSpent]) => ({ address: addr, totalSpent: totalSpent.toFixed(3) }));
    setTopBuyers(sortedBuyers);

    const collectionMap = {};
    for (const evt of boughtEvents) {
      const nftAddr = evt.args.nft.toLowerCase();
      collectionMap[nftAddr] = (collectionMap[nftAddr] || 0) + 1;
    }
    const sortedCollections = Object.entries(collectionMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nftAddr, trades]) => ({ nftAddr, trades }));
    setTopCollections(sortedCollections);

    const nftMap = {};
    for (const evt of boughtEvents) {
      const nftAddr = evt.args.nft.toLowerCase();
      const tokenId = evt.args.tokenId.toString();
      const key = nftAddr + '|' + tokenId;
      nftMap[key] = (nftMap[key] || 0) + 1;
    }
    const sortedNfts = Object.entries(nftMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([key, trades]) => {
        const [addr, token] = key.split('|');
        return { nftAddr: addr, tokenId: token, trades };
      });
    setTopNfts(sortedNfts);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <Navbar onDisconnect={handleDisconnect} />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-8 text-center">Admin Dashboard</h1>

        {loading && <p className="text-indigo-500 text-center mb-6">Loading stats...</p>}
        {error && <p className="text-red-500 text-center mb-6">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">Minting Stats</h2>
            <p>Total Minted: <span className="font-bold">{totalMinted}</span></p>
            <p>Unique Minters: <span className="font-bold">{uniqueMinters}</span></p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">Marketplace Stats</h2>
            <p>Current Listings: <span className="font-bold">{currentListings}</span></p>
            <p>Total Sales Count: <span className="font-bold">{totalSalesCount}</span></p>
            <p>Total Sales Volume (ETH): <span className="font-bold">{totalSalesVolume}</span></p>
            <p>Average Sale Price (ETH): <span className="font-bold">{averageSalePrice}</span></p>
          </div>
        </div>

        {/* Sales Over Time Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mt-8">
          <h2 className="text-2xl font-semibold mb-4">Sales Over Time</h2>
          {salesOverTime.length === 0 ? (
            <p>No sales data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesOverTime}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#4F46E5" name="Sales Count" />
                <Line type="monotone" dataKey="volume" stroke="#22C55E" name="Volume (ETH)" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Buyers */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mt-8">
          <h2 className="text-2xl font-semibold mb-4">Top Buyers</h2>
          <ul className="space-y-2">
            {topBuyers.map((buyer, idx) => (
              <li key={idx} className="flex items-center justify-between">
                <span>{truncateAddress(buyer.address)}</span>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => copyText(buyer.address)}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg px-3 py-1 text-sm"
                  >
                    Copy
                  </button>
                  <a
                    href={`${ETHERSCAN_BASE}/address/${buyer.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-500 hover:underline text-sm"
                  >
                    View
                  </a>
                  <span className="text-sm">{buyer.totalSpent} ETH</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Top Collections */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mt-8">
          <h2 className="text-2xl font-semibold mb-4">Top Collections</h2>
          <ul className="space-y-2">
            {topCollections.map((col, idx) => (
              <li key={idx} className="flex items-center justify-between">
                <span>{truncateAddress(col.nftAddr)}</span>
                <span>{col.trades} trades</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Top NFTs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mt-8">
          <h2 className="text-2xl font-semibold mb-4">Top NFTs</h2>
          <ul className="space-y-2">
            {topNfts.map((nft, idx) => (
              <li key={idx} className="flex items-center justify-between">
                <span>{truncateAddress(nft.nftAddr)} #{nft.tokenId}</span>
                <span>{nft.trades} trades</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Admin;
