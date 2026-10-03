\# 🛡️ NFTShieldX — Secure NFT Marketplace with Blockchain \& AI-Powered Fraud Detection



NFTShieldX is a decentralized NFT marketplace designed to provide a secure, transparent, and user-friendly environment for creating, buying, selling, and exploring Non-Fungible Tokens (NFTs).



The platform combines \*\*Blockchain, Web3, smart contracts, decentralized storage, and image similarity analysis\*\* to strengthen NFT authenticity, prevent duplicate or fraudulent content, and secure marketplace transactions.



Developed as a university project at the \*\*National School of Applied Sciences of El Jadida (ENSAJ)\*\*.



\---



\## 🚀 Project Overview



NFT marketplaces can face several challenges, including:



\- Counterfeit and duplicated digital artworks

\- Lack of strong authenticity verification

\- Security risks in smart contracts

\- High transaction costs

\- Dependence on centralized storage

\- Limited transparency and traceability



NFTShieldX addresses these challenges by combining \*\*Ethereum blockchain technology\*\*, \*\*MetaMask authentication\*\*, \*\*IPFS decentralized storage\*\*, and advanced image analysis techniques.



The project was developed using an iterative \*\*Scrum methodology\*\*, with eight development sprints covering authentication, NFT minting, marketplace functionality, transactions, fraud detection, social features, testing, and deployment. :contentReference\[oaicite:2]{index=2}



\---



\## ✨ Features



\### 🔐 Web3 Authentication



\- Secure authentication through \*\*MetaMask\*\*

\- Wallet-based user identification

\- No traditional username/password authentication

\- Cryptographic signing for sensitive interactions

\- Wallet-based access control for protected functionality



\### 🎨 NFT Creation \& Minting



Users can:



\- Upload digital artwork

\- Define NFT title and description

\- Set a price in Ethereum

\- Mint NFTs through a Solidity smart contract

\- Store NFT content and metadata using decentralized storage



The minting process includes image hashing and similarity verification before the NFT is created.



\### 🛒 NFT Marketplace



The platform allows users to:



\- Browse available NFTs

\- Search and filter NFTs

\- List NFTs for sale

\- Purchase NFTs using Ethereum

\- Cancel NFT listings

\- View NFT details

\- Track transaction history



The purchase process is handled through smart contracts to ensure that the NFT transfer and payment are executed atomically. :contentReference\[oaicite:3]{index=3}



\### 🛡️ Fraud \& Duplicate Detection



NFTShieldX includes several mechanisms designed to prevent fraudulent or duplicated artwork.



\#### SHA-256 Hashing



Uploaded images are converted into cryptographic hashes to detect identical content.



\#### Perceptual Hashing (pHash)



Perceptual hashing is used to identify visually similar images even when minor modifications have been made.



\#### SIFT + FAISS + OpenCV



The platform combines:



\- \*\*SIFT\*\* for image feature extraction

\- \*\*OpenCV\*\* for image processing

\- \*\*FAISS\*\* for fast similarity search



This allows the system to detect potentially duplicated or modified versions of existing NFT artwork before minting. :contentReference\[oaicite:4]{index=4}



\---



\## ⛓️ Blockchain Architecture



NFTShieldX is built around the \*\*Ethereum blockchain\*\*.



The project uses:



\- Ethereum

\- Sepolia Testnet

\- Solidity

\- ERC-721

\- Ethers.js

\- MetaMask

\- Smart Contracts



Two main smart contracts were developed:



\### `NFTShieldXMinting.sol`



Responsible for:



\- Secure NFT minting

\- Image hash verification

\- NFT uniqueness

\- ERC-721 NFT management



\### `NFTMarketplace.sol`



Responsible for:



\- NFT listings

\- NFT purchases

\- Listing cancellation

\- Payment management

\- Marketplace transactions



The smart contracts were initially deployed and tested on the \*\*Ethereum Sepolia testnet\*\*. :contentReference\[oaicite:5]{index=5}



\---



\## 💾 Decentralized Storage



NFTShieldX uses \*\*IPFS/Pinata\*\* for decentralized NFT storage.



Instead of relying exclusively on centralized servers, NFT assets and metadata can be stored through IPFS and identified using a unique \*\*Content Identifier (CID)\*\*.



This provides:



\- Decentralized storage

\- Content integrity

\- Improved resilience

\- Traceability of NFT resources

\- Reduced dependence on centralized storage



:contentReference\[oaicite:6]{index=6}



\---



\## 👤 User Features



Users can:



\- Connect their Ethereum wallet

\- Create and customize their profile

\- Mint NFTs

\- List NFTs for sale

\- Purchase NFTs

\- View owned NFTs

\- View listed NFTs

\- Browse artists

\- Like NFTs

\- Comment on NFTs

\- Track NFT views

\- View transaction history



The application includes dedicated pages for the homepage, user profiles, NFT creation, minted NFTs, listed NFTs, marketplace browsing, NFT details, artists, administration, and contact information. :contentReference\[oaicite:7]{index=7}



\---



\## 👨‍💻 Admin Dashboard



NFTShieldX includes an administrative dashboard for managing and monitoring the platform.



Access to sensitive administrative functionality is controlled through authenticated wallet addresses.



The report also discusses \*\*Zero-Knowledge Proofs (ZKP)\*\* as an advanced security direction for strengthening privacy and confidential verification. :contentReference\[oaicite:8]{index=8}



\---



\## 🔒 Smart Contract Security



Security was an important part of the project.



An internal security audit was performed on:



\- `NFTMarketplace.sol`

\- `NFTShieldXMinting.sol`



The audit examined transaction management, data integrity, ownership verification, payment handling, and protection against common Ethereum vulnerabilities.



Security mechanisms include:



\- OpenZeppelin security standards

\- Reentrancy protection

\- Ownership verification

\- Explicit NFT approval before transfers

\- Secure fund withdrawal

\- Transaction validation

\- Smart contract events for transaction traceability



The audit identified the smart contracts as having a strong security foundation while also identifying areas for further improvement, particularly around image uniqueness controls, logging, and access control. :contentReference\[oaicite:9]{index=9}



\---



\## 🏗️ Technology Stack



\### Frontend



\- React

\- JavaScript

\- Tailwind CSS

\- Ethers.js



\### Backend



\- Node.js

\- Express.js

\- JavaScript



\### Database



\- MongoDB



\### Blockchain



\- Ethereum

\- Sepolia Testnet

\- Solidity

\- ERC-721

\- Hardhat



\### Web3



\- MetaMask

\- Ethers.js



\### Decentralized Storage



\- IPFS

\- Pinata



\### Fraud Detection \& Image Analysis



\- SHA-256

\- pHash

\- SIFT

\- FAISS

\- OpenCV



\### Development Tools



\- Visual Studio Code

\- StarUML

\- Hardhat



The report identifies React, Express.js, Tailwind CSS, Ethereum, Sepolia, Solidity, Ethers.js, MetaMask, MongoDB, IPFS, and the image-analysis/security technologies as the main technical components of the project. :contentReference\[oaicite:10]{index=10}



\---



\## 📐 Architecture



NFTShieldX follows a full-stack architecture composed of:



```text

&#x20;                   ┌──────────────────────┐

&#x20;                   │      User / Artist   │

&#x20;                   └──────────┬───────────┘

&#x20;                              │

&#x20;                              ▼

&#x20;                   ┌──────────────────────┐

&#x20;                   │   React Frontend     │

&#x20;                   │   Tailwind CSS       │

&#x20;                   └──────────┬───────────┘

&#x20;                              │

&#x20;                   ┌──────────┴───────────┐

&#x20;                   │                      │

&#x20;                   ▼                      ▼

&#x20;            ┌──────────────┐       ┌──────────────┐

&#x20;            │   MetaMask   │       │  Express.js  │

&#x20;            │    Wallet    │       │   Backend    │

&#x20;            └──────┬───────┘       └──────┬───────┘

&#x20;                   │                      │

&#x20;                   ▼                      ▼

&#x20;            ┌──────────────┐       ┌──────────────┐

&#x20;            │   Ethereum   │       │   MongoDB    │

&#x20;            │ Smart        │       │   Database   │

&#x20;            │ Contracts    │       └──────────────┘

&#x20;            └──────┬───────┘

&#x20;                   │

&#x20;                   ▼

&#x20;            ┌──────────────┐

&#x20;            │ IPFS / Pinata│

&#x20;            │ Decentralized│

&#x20;            │   Storage    │

&#x20;            └──────────────┘



&#x20;                   │

&#x20;                   ▼

&#x20;         ┌─────────────────────┐

&#x20;         │ Fraud Detection     │

&#x20;         │ SHA-256 / pHash     │

&#x20;         │ SIFT / FAISS /      │

&#x20;         │ OpenCV              │

&#x20;         └─────────────────────┘



