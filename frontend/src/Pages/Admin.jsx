import React, { useEffect, useState } from 'react';
import { BrowserProvider, Contract, formatEther } from 'ethers';

// Hardhat artifacts
import NFTShieldXMintingArtifact from '../NFTShieldXMinting.json';
import NFTMarketplaceArtifact from '../NFTMarketplace.json';

import Navbar from '../Component/layout/Navbar';
import '../Admin.css'; 
// .env addresses
const NFT_CONTRACT_ADDRESS = process.env.REACT_APP_NFT_CONTRACT;
const MARKETPLACE_CONTRACT_ADDRESS = process.env.REACT_APP_MARKETPLACE_CONTRACT;

// NEW: your block explorer base (e.g. Sepolia, mainnet, etc.)
const ETHERSCAN_BASE = 'https://sepolia.etherscan.io'; 
// If on mainnet: "https://etherscan.io"

function Admin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Existing stats
  const [totalMinted, setTotalMinted] = useState(0);
  const [uniqueMinters, setUniqueMinters] = useState(0);
  const [currentListings, setCurrentListings] = useState(0);
  const [totalSalesCount, setTotalSalesCount] = useState(0);
  const [totalSalesVolume, setTotalSalesVolume] = useState('0.0');
  const [averageSalePrice, setAverageSalePrice] = useState('0.0');

  // Over-time sales
  const [salesOverTime, setSalesOverTime] = useState([]); // { date, count, volume }
  // Top buyers, etc.
  const [topBuyers, setTopBuyers] = useState([]);         // { address, totalSpent }
  const [topCollections, setTopCollections] = useState([]);// { nftAddr, trades }
  const [topNfts, setTopNfts] = useState([]);             // { nftAddr, tokenId, trades }

  // Disconnect
  const handleDisconnect = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line
  }, []);

  /************************************
   * Utility: Truncate Address
   ************************************/
  const truncateAddress = (addr) => {
    if (!addr) return '';
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  };

  /************************************
   * Utility: Copy to Clipboard
   ************************************/
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

      /********** NFT Contract: Minting Stats **********/
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        NFTShieldXMintingArtifact.abi,
        provider
      );

      // totalMinted => totalSupply
      let supply = await nftContract.totalSupply();
      supply = Number(supply);
      setTotalMinted(supply);

      // uniqueMinters => loop from 0..(supply-1)
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

      /********** Marketplace Stats **********/
      const marketplace = new Contract(
        MARKETPLACE_CONTRACT_ADDRESS,
        NFTMarketplaceArtifact.abi,
        provider
      );

      // current listings
      const [nftAddrs, tokenIds, prices, sellers] = await marketplace.getAllListings();
      setCurrentListings(tokenIds.length);

      // parse "ItemBought" events
      const boughtFilter = marketplace.filters.ItemBought();
      const boughtEvents = await marketplace.queryFilter(boughtFilter, 0, 'latest');
      setTotalSalesCount(boughtEvents.length);

      let volume = 0;
      for (const evt of boughtEvents) {
        volume += parseFloat(formatEther(evt.args.price));
      }
      setTotalSalesVolume(volume.toFixed(3));
      if (boughtEvents.length > 0) {
        setAverageSalePrice((volume / boughtEvents.length).toFixed(3));
      } else {
        setAverageSalePrice('0.0');
      }

      analyzeSalesData(boughtEvents, provider);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error fetching admin stats.');
    } finally {
      setLoading(false);
    }
  };

  const analyzeSalesData = async (boughtEvents, provider) => {
    // Sales Over Time
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

    // Top Buyers
    const buyerMap = {};
    for (const evt of boughtEvents) {
      const buyer = evt.args.buyer.toLowerCase();
      const spent = parseFloat(formatEther(evt.args.price));
      buyerMap[buyer] = (buyerMap[buyer] || 0) + spent;
    }
    const sortedBuyers = Object.entries(buyerMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([addr, totalSpent]) => ({
        address: addr,
        totalSpent: totalSpent.toFixed(3),
      }));
    setTopBuyers(sortedBuyers);

    // Most Traded Collections
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

    // Most Traded NFTs
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
    <div className="admin-page">
      <Navbar onDisconnect={handleDisconnect} />
      <div className="admin-hero">
        <div className="admin-content">
          <h2 className="admin-title">Admin Dashboard (Global Stats)</h2>
          {loading && <p className="admin-loading">Loading...</p>}
          {error && <p className="admin-error">{error}</p>}

          {/* Minting Stats */}
          <section className="admin-section">
            <h3 className="admin-heading">Minting Stats</h3>
            <p>Total Minted: {totalMinted}</p>
            <p>Unique Minters: {uniqueMinters}</p>
          </section>

          {/* Marketplace Stats */}
          <section className="admin-section">
            <h3 className="admin-heading">Marketplace Stats</h3>
            <p>Current Listings: {currentListings}</p>
            <p>Total Sales Count: {totalSalesCount}</p>
            <p>Total Sales Volume (ETH): {totalSalesVolume}</p>
            <p>Average Sale Price (ETH): {averageSalePrice}</p>
          </section>

          {/* Sales Over Time */}
          <section className="admin-section">
            <h3 className="admin-heading">Sales Over Time</h3>
            {salesOverTime.length === 0 ? (
              <p>No sales found.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Sales Count</th>
                    <th>Volume (ETH)</th>
                  </tr>
                </thead>
                <tbody>
                  {salesOverTime.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.date}</td>
                      <td>{row.count}</td>
                      <td>{row.volume}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {/* Top 5 Buyers - NEW styling, truncation, copy, etherscan */}
          <section className="admin-section">
            <h3 className="admin-heading">Top 5 Buyers</h3>
            {topBuyers.length === 0 ? (
              <p>No buyers found.</p>
            ) : (
              <ol>
                {topBuyers.map((buyer, i) => (
                  <li key={i} style={{ margin: '0.5rem 0' }}>
                    {/* Truncated address */}
                    <span style={{ marginRight: '0.5rem' }}>
                      {truncateAddress(buyer.address)}
                    </span>

                    {/* Copy button */}
                    <button
                      className="copy-button"
                      onClick={() => copyText(buyer.address)}
                      style={{ marginRight: '0.5rem' }}
                    >
                      Copy
                    </button>

                    {/* Etherscan link */}
                    <a
                      href={`${ETHERSCAN_BASE}/address/${buyer.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="etherscan-link"
                      style={{ marginRight: '1rem' }}
                    >
                      Etherscan
                    </a>

                    {/* Show totalSpent */}
                    <span>- {buyer.totalSpent} ETH</span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* Most Traded Collections - NEW styling, truncation, copy, etherscan */}
          <section className="admin-section">
            <h3 className="admin-heading">Most Traded Collections</h3>
            {topCollections.length === 0 ? (
              <p>No trades found.</p>
            ) : (
              <ol>
                {topCollections.map((col, i) => (
                  <li key={i} style={{ margin: '0.5rem 0' }}>
                    <span style={{ marginRight: '0.5rem' }}>
                      {truncateAddress(col.nftAddr)}
                    </span>

                    <button
                      className="copy-button"
                      onClick={() => copyText(col.nftAddr)}
                      style={{ marginRight: '0.5rem' }}
                    >
                      Copy
                    </button>

                    <a
                      href={`${ETHERSCAN_BASE}/address/${col.nftAddr}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="etherscan-link"
                      style={{ marginRight: '1rem' }}
                    >
                      Etherscan
                    </a>

                    <span>- {col.trades} trades</span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* Most Traded NFTs - address + tokenId => link with ?a=tokenId */}
          <section className="admin-section">
            <h3 className="admin-heading">Most Traded NFTs</h3>
            {topNfts.length === 0 ? (
              <p>No trades found.</p>
            ) : (
              <ol>
                {topNfts.map((nft, i) => {
                  const shortAddr = truncateAddress(nft.nftAddr);
                  const etherscanLink = `${ETHERSCAN_BASE}/token/${nft.nftAddr}?a=${nft.tokenId}`;
                  return (
                    <li key={i} style={{ margin: '0.5rem 0' }}>
                      {/* truncated address */}
                      <span style={{ marginRight: '0.5rem' }}>{shortAddr}</span>
                      <button
                        className="copy-button"
                        onClick={() => copyText(nft.nftAddr)}
                        style={{ marginRight: '0.5rem' }}
                      >
                        Copy
                      </button>
                      {/* Etherscan link for the token */}
                      <a
                        href={etherscanLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="etherscan-link"
                        style={{ marginRight: '1rem' }}
                      >
                        Etherscan
                      </a>
                      <span>/ Token #{nft.tokenId} - {nft.trades} trades</span>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default Admin;
