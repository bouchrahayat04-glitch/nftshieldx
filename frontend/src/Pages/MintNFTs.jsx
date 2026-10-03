import React, { useState, useRef } from 'react';
import Layout from "../Component/layout/Layout";
import Header from "../Component/reuseableComponent/Header";
import Button from "../Component/reuseableComponent/Button";
import { BrowserProvider, Contract } from 'ethers';
import ReCAPTCHA from "react-google-recaptcha";


const MintsNFTs = () => {
  const [collectionName, setCollectionName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [captchaToken, setCaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);


  const CONTRACT_ADDRESS = process.env.REACT_APP_NFT_CONTRACT;


  const ABI = [
    {
      inputs: [
        { internalType: "address", name: "to", type: "address" },
        { internalType: "string", name: "uri", type: "string" },
        { internalType: "bytes32", name: "imageHash", type: "bytes32" }
      ],
      name: "safeMint",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [{ internalType: "bytes32", name: "imageHash", type: "bytes32" }],
      name: "isHashUsed",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function"
    }
  ];

  async function computeImageHash(file) {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    return '0x' + Array
      .from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  async function uploadImageToPinata(fileObj) {
    const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY;
    const PINATA_API_SECRET = process.env.REACT_APP_PINATA_API_SECRET;

    if (!PINATA_API_KEY || !PINATA_API_SECRET) {
      throw new Error('Pinata API credentials not set');
    }
    if (!fileObj) {
      throw new Error('No image file selected');
    }

    const formData = new FormData();
    formData.append('file', fileObj);

    const pinataMetadata = {
      name: collectionName
    };
    formData.append('pinataMetadata', JSON.stringify(pinataMetadata));

    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET
      },
      body: formData
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Failed to upload image to Pinata");
    }

    return `ipfs://${result.IpfsHash}`;
  }

  async function storeNFTMetadata(imageURI) {
    const PINATA_API_KEY = process.env.REACT_APP_PINATA_API_KEY;
    const PINATA_API_SECRET = process.env.REACT_APP_PINATA_API_SECRET;

    const metadata = {
      name: collectionName,
      description,
      image: imageURI
    };

    const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
    const metadataFile = new File([metadataBlob], 'metadata.json', { type: 'application/json' });

    const formData = new FormData();
    formData.append('file', metadataFile);

    const metaPinataMetadata = { name: `${collectionName} metadata` };
    formData.append('pinataMetadata', JSON.stringify(metaPinataMetadata));

    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET
      },
      body: formData
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Failed to upload metadata to Pinata");
    }

    return `ipfs://${result.IpfsHash}`;
  }

  async function handleMintNFT() {
    try {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');

      if (!window.ethereum) {
        throw new Error('MetaMask not detected!');
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, ABI, signer);

      const imageHash = await computeImageHash(selectedImage);
      const isDuplicate = await contract.isHashUsed(imageHash);
      if (isDuplicate) {
        throw new Error('This image has already been minted as an NFT.');
      }

      const imageURI = await uploadImageToPinata(selectedImage);
      const tokenURI = await storeNFTMetadata(imageURI);

      const tx = await contract.safeMint(await signer.getAddress(), tokenURI, imageHash);
      await tx.wait();

      setSuccessMsg(`✅ NFT Minted! Transaction: ${tx.hash}`);
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message || "Minting failed.");
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault();
  
    if (!collectionName || !description || !selectedImage) {
      setErrorMsg("Please fill out all fields and select an image.");
      return;
    }
  
    if (!captchaToken) {
      setErrorMsg("Please complete the reCAPTCHA to prove you're not a robot.");
      return;
    }
  
    handleMintNFT();
  };
  

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };
  

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  return (
    <Layout>
      <div className='flex flex-col items-center w-full mb-20'>
        <Header>Create NFT</Header>

        <form onSubmit={handleSubmit} className='w-full lg:w-2/5 border border-blue-800 shadow-blue-800 shadow-md p-5 lg:p-10 rounded-3xl'>
          <div className='flex justify-center mb-4'>
            {selectedImage && (
              <img
                src={URL.createObjectURL(selectedImage)}
                alt="Selected"
                className='w-20 h-20 lg:w-24 lg:h-24 rounded-lg object-cover shadow-blue-800 shadow-md'
              />
            )}
          </div>

          <label htmlFor="imageUpload" className='block text-white font-semibold text-lg mb-2'>
            Upload Image
          </label>
          <div className='flex gap-2 items-center bg-slate-100 w-full h-12 rounded-full mb-5 lg:mb-10'>
            <label
              htmlFor="imageUpload"
              className="bg-gradient-to-l from-blue-400 via-purple-600 to-pink-500 p-2 h-full rounded-full font-medium text-md flex items-center text-white cursor-pointer"
            >
              Choose File
            </label>
            <span>{selectedImage ? selectedImage.name : 'No file chosen'}</span>
            <input
              type="file"
              id="imageUpload"
              accept="image/*"
              onChange={handleImageChange}
              className='hidden'
            />
          </div>

          <label htmlFor="collectionName" className='text-white font-semibold text-lg'>Collection Name</label>
          <div className='bg-slate-100 w-full h-12 rounded-full p-3 mt-2 mb-4'>
            <input
              type="text"
              name="collectionName"
              id="collectionName"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              placeholder='e.g. CyberDuck'
              className='bg-transparent w-full focus:outline-none text-slate-800 placeholder:text-slate-800'
              required
            />
          </div>

          <label htmlFor="description" className='text-white font-semibold text-lg'>Description</label>
          <div className='bg-slate-100 w-full h-20 rounded-xl p-3 mt-2 mb-4'>
            <textarea
              name="description"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Describe your NFT...'
              className='bg-transparent w-full h-full resize-none focus:outline-none text-slate-800 placeholder:text-slate-800'
              required
            />
          </div>

          {errorMsg && <p className="text-red-500 font-semibold mb-4">{errorMsg}</p>}
          {successMsg && <p className="text-green-500 font-semibold mb-4">{successMsg}</p>}

          {/* Submit Button */}
          <div className='flex justify-center mt-6'>
            <Button
              type="submit"
              disabled={loading}
              btnText={loading ? "Minting..." : "Mint NFT"}
              className="py-2 px-4 rounded-full bg-gradient-to-l from-blue-400 via-purple-600 to-pink-500 text-white font-bold hover:bg-gradient-to-r"
            />
          </div>
          <br />
          <div>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
              onChange={handleCaptchaChange}
              className="flex justify-center mb-6"
            />
          </div>
          

        </form>
      </div>
    </Layout>
  );
};

export default MintsNFTs;
