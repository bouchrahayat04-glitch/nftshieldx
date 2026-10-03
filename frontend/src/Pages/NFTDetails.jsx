import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../Component/layout/Layout';
import { FaEye, FaHeart, FaThumbsDown, FaShoppingCart } from 'react-icons/fa';
import axios from "axios";
import { ethers } from 'ethers';

const NFT_ABI = [
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'tokenURI',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    name: 'creatorOf',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  }
];

const MARKETPLACE_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'nft', type: 'address' },
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' }
    ],
    name: 'getListing',
    outputs: [
      {
        components: [
          { internalType: 'uint256', name: 'price', type: 'uint256' },
          { internalType: 'address', name: 'seller', type: 'address' }
        ],
        internalType: 'struct NFTMarketplace.Listing',
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'nft', type: 'address' },
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' }
    ],
    name: 'buyItem',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  // ─── Events for history ───────────────────────────────────────────
  {
    anonymous: false,
    inputs: [
      { indexed: true,  internalType: 'address', name: 'seller', type: 'address' },
      { indexed: true,  internalType: 'address', name: 'nft',    type: 'address' },
      { indexed: true,  internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'price',   type: 'uint256' }
    ],
    name: 'ItemListed',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true,  internalType: 'address', name: 'buyer',   type: 'address' },
      { indexed: true,  internalType: 'address', name: 'nft',     type: 'address' },
      { indexed: true,  internalType: 'uint256', name: 'tokenId', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'price',   type: 'uint256' }
    ],
    name: 'ItemBought',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'seller',  type: 'address' },
      { indexed: true, internalType: 'address', name: 'nft',     type: 'address' },
      { indexed: true, internalType: 'uint256', name: 'tokenId', type: 'uint256' }
    ],
    name: 'ItemCanceled',
    type: 'event'
  }
];

const NFTDetails = () => {
  const { id } = useParams(); // Format: contract-tokenId
  const [nft, setNft] = useState(null);
  const [currentWallet, setCurrentWallet] = useState('');
  const [isZoomed, setIsZoomed] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentInput, setCommentInput] = useState("");
  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [nftHistory, setNftHistory] = useState([]);
  const shorten = (addr) => addr.slice(0, 6) + '…' + addr.slice(-4);

  const [contractAddress, tokenId] = id.split('-');

  /* ───────────── 1. Load NFT, listing, creator … ───────────── */
  useEffect(() => {
    const fetchNFT = async () => {
      try {
        if (!window.ethereum) return alert("Please install MetaMask");

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const wallet = await signer.getAddress();
        setCurrentWallet(wallet);

        const nftContract = new ethers.Contract(contractAddress, NFT_ABI, provider);
        const marketplace = new ethers.Contract(
          process.env.REACT_APP_MARKETPLACE_CONTRACT,
          MARKETPLACE_ABI,
          provider
        );

        /* metadata + owners */
        const [uri, owner] = await Promise.all([
          nftContract.tokenURI(tokenId),
          nftContract.ownerOf(tokenId)
        ]);

        let creator;
        try {
          creator = await nftContract.creatorOf(tokenId);
        } catch (_) {
          creator = "0x0000000000000000000000000000000000000000";
        }

        const res = await fetch(uri.replace("ipfs://", "https://ipfs.io/ipfs/"));
        const metadata = await res.json();

        let listing = { price: 0, seller: "0x0000000000000000000000000000000000000000" };
        try {
          listing = await marketplace.getListing(contractAddress, tokenId);
        } catch (_) {}

        let creatorName = creator;
        try {
          const r = await axios.get(`http://localhost:5000/api/users/${creator}`);
          creatorName = r.data.username || creator;
        } catch (_) {}

        const normalizedImage = metadata.image?.startsWith("ipfs://")
          ? metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")
          : metadata.image;

        setNft({
          id,
          contract: contractAddress,
          tokenId,
          owner,
          creator,
          creatorName,
          seller: listing.seller,
          price: ethers.formatEther(listing.price),
          ...metadata,
          image: normalizedImage
        });
      } catch (error) {
        console.error("❌ Error in fetchNFT:", error);
      }
    };

    fetchNFT();
  }, [id]);

  /* ───────────── 2. Track a “view” ───────────── */
  useEffect(() => {
    const postView = async () => {
      try {
        const wallet = localStorage.getItem("walletAddress");
        if (!wallet) return;
        await axios.post("http://localhost:5000/api/interactions/view", {
          cid: nft.image,
          walletAddress: wallet
        });
      } catch (_) {}
    };
    if (nft?.image) postView();
  }, [nft?.image]);

  /* ───────────── 3. Current like/dislike status ───────────── */
  useEffect(() => {
    const fetchInteractionStats = async () => {
      try {
        const wallet = localStorage.getItem("walletAddress");
        const res = await axios.get(`http://localhost:5000/api/interactions/${nft.image}?wallet=${wallet}`);
        setLikes(res.data.likes);
        setLiked(res.data.liked);
        setDisliked(res.data.disliked);
        setViews(res.data.views);
      } catch (err) {
        console.error("Failed to load interaction stats:", err);
      }
    };
    if (nft?.image) fetchInteractionStats();
  }, [nft?.image]);

  /* ───────────── 4. Fetch comments ───────────── */
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/comments/${nft.image}`);
        setComments(res.data);
      } catch (err) {
        console.error("Failed to load comments:", err);
      } finally {
        setLoadingComments(false);
      }
    };
    if (nft?.image) fetchComments();
  }, [nft?.image]);

  /* ───────────── 5. Fetch on-chain transaction history ───────────── */
  useEffect(() => {
    if (!nft) return;

    const fetchHistory = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(
          process.env.REACT_APP_MARKETPLACE_CONTRACT,
          MARKETPLACE_ABI,
          provider
        );

        const tokenIdBig = ethers.toBigInt(nft.tokenId);

        const listedFilter   = contract.filters.ItemListed( null, nft.contract, tokenIdBig );
        const boughtFilter   = contract.filters.ItemBought( null, nft.contract, tokenIdBig );
        const canceledFilter = contract.filters.ItemCanceled( null, nft.contract, tokenIdBig );

        const [listed, bought, canceled] = await Promise.all([
          contract.queryFilter(listedFilter),
          contract.queryFilter(boughtFilter),
          contract.queryFilter(canceledFilter)
        ]);

        const blockNums = [...new Set([...listed, ...bought, ...canceled].map(e => e.blockNumber))];
        const blocks    = await Promise.all(blockNums.map(bn => provider.getBlock(bn)));
        const tsMap     = Object.fromEntries(blocks.map(b => [b.number, new Date(b.timestamp * 1000)]));

        const history = [
          ...listed.map(e => ({
            action: 'LISTED',
            addr:   e.args.seller,
            price:  ethers.formatEther(e.args.price),
            date:   tsMap[e.blockNumber],
            tx:     e.transactionHash
          })),
          ...bought.map(e => ({
            action: 'BOUGHT',
            addr:   e.args.buyer,
            price:  ethers.formatEther(e.args.price),
            date:   tsMap[e.blockNumber],
            tx:     e.transactionHash
          })),
          ...canceled.map(e => ({
            action: 'CANCELED',
            addr:   e.args.seller,
            price:  null,
            date:   tsMap[e.blockNumber],
            tx:     e.transactionHash
          }))
        ].sort((a, b) => b.date - a.date);

        setNftHistory(history);
      } catch (err) {
        console.error("History fetch failed", err);
        setNftHistory([]);
      }
    };

    fetchHistory();
  }, [nft]);

  /* ───────────── 6. UI handlers (like, dislike, buy, comments) ───────────── */
  const handleLike = async () => {
    const wallet = localStorage.getItem("walletAddress");
    try {
      const res = await axios.post("http://localhost:5000/api/interactions/like", {
        cid: nft.image,
        walletAddress: wallet,
      });
      setLiked(res.data.liked);
      setLikes(res.data.likes);
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const handleDislike = async () => {
    const wallet = localStorage.getItem("walletAddress");
    try {
      const res = await axios.post("http://localhost:5000/api/interactions/dislike", {
        cid: nft.image,
        walletAddress: wallet,
      });
      setDisliked(res.data.disliked);
    } catch (err) {
      console.error("Dislike error:", err);
    }
  };

  const handlePostComment = async () => {
    if (!commentInput.trim()) return;
    try {
      const response = await axios.post("http://localhost:5000/api/comments", {
        cid: nft.image,
        author: localStorage.getItem("walletAddress"),
        text: commentInput,
      });
      setComments([response.data, ...comments]);
      setCommentInput("");
    } catch (err) {
      console.error("Comment post error:", err);
    }
  };

  const handleBuyNFT = async () => {
    try {
      if (!window.ethereum) return alert("Please install MetaMask");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const marketplace = new ethers.Contract(
        process.env.REACT_APP_MARKETPLACE_CONTRACT,
        MARKETPLACE_ABI,
        signer
      );

      const tx = await marketplace.buyItem(nft.contract, nft.tokenId, {
        value: ethers.parseEther(nft.price)
      });

      await tx.wait();
      alert("✅ NFT purchased successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Purchase failed:", error);
      alert("❌ Purchase failed. See console for details.");
    }
  };

  /* ───────────── 7. Render ───────────── */
  if (!nft) return <Layout>Loading…</Layout>;

  const isOwner = currentWallet.toLowerCase() === nft.owner.toLowerCase();

  return (
    <>
      <Layout>
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Left side: Artwork & details */}
          {/* …(existing markup unchanged)… */}
          {/* Replace this comment with the left-side JSX you already had */}

          {/* Right Side: Transaction History */}
          <div className="w-full lg:max-w-[900px] h-[850px] overflow-y-auto bg-[#0c1525] rounded-xl p-4 shadow-md">
            <h2 className="text-3xl font-bold text-white mb-6">Transaction History</h2>
            {nftHistory.length === 0 ? (
              <p className="text-gray-400">No activity yet.</p>
            ) : (
              nftHistory.map((ev, i) => (
                <div
                  key={i}
                  className="bg-[#1a2338] text-white p-5 rounded-lg mb-5 shadow-sm hover:shadow-lg transition"
                >
                  <p className="text-base mb-2">
                    <span className="text-gray-500">{ev.action} by:</span>{' '}
                    <span className="text-blue-500">{shorten(ev.addr)}</span>
                  </p>

                  {ev.price && (
                    <p className="text-base mb-2">
                      <span className="text-gray-500">Price:</span>{' '}
                      <span className="text-green-500">{ev.price} ETH</span>
                    </p>
                  )}

                  <p className="text-sm text-gray-600">{ev.date.toLocaleString()}</p>

                  <a
                    href={`https://sepolia.etherscan.io/tx/${ev.tx}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-400 underline"
                  >
                    view tx
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default NFTDetails;
