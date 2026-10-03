import React from 'react'

const NFTSore = ({ nft , onBuy }) => {
  
    return (
        <div className="rounded-lg  bg-gray-800 p-4 mb-6">
          {/* Image with rounded corners and fixed size */}
          <img 
            src={nft.image} 
            alt={nft.name} 
            className="w-80 h-90 rounded-xl object-cover mx-auto hover:scale-105"
          />
          
          {/* NFT Details */}
          <h2 className="text-white text-xl mt-3 font-bold ">{nft.name}</h2>
          <p className="text-gray-400 text-lg">Price: {nft.price} ETH</p>
          
          {/* Description */}
          <p className="text-gray-300 text-sm mt-2">{nft.description}</p>
          
          {/* Creator and Date Created */}
          <p className="text-gray-500 text-sm mt-1">Creator: {nft.creator}</p>
          <p className="text-gray-500 text-sm">Created on: {nft.dateCreated}</p>
          
          {/* Owner */}
          <p className="text-gray-500 text-sm">Owner: {nft.owner}</p>
    
          
          

      <div className="flex justify-center space-x-2 mt-2">
        {/* Buy Button */}
      <button 
        onClick={() => onBuy(nft)} 
        className=" mt-4 bg-gradient-to-l from-blue-400 via-purple-600 to-pink-500 hover:bg-gradient-to-r text-white font-bold py-2 px-5 rounded-lg mr-6"
      >
        Buy Now
      </button>
      <button 
        onClick={() => onBuy(nft)} 
        className="mt-6 bg-transparent hover:text-blue-700 text-white font-bold py-1 px-5 rounded-lg  "
      >
        View History
      </button>

      </div>
         
        </div>
      );
}

export default NFTSore