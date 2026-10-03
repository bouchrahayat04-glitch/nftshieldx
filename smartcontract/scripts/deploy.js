// scripts/deploy.js
const hre = require("hardhat");

async function main() {
  const NFTFactory = await hre.ethers.getContractFactory("NFTShieldXMinting");
  const nftContract = await NFTFactory.deploy();
  await nftContract.waitForDeployment();
  console.log("✅ NFTShieldXMinting deployed to:", nftContract.target);

  const MarketFactory = await hre.ethers.getContractFactory("NFTMarketplace");
  const marketContract = await MarketFactory.deploy();
  await marketContract.waitForDeployment();
  console.log("✅ NFTMarketplace deployed to:", marketContract.target);
}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
