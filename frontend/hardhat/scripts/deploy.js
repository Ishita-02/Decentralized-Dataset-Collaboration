const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const dataToken = await ethers.deployContract("DATAToken");
  await dataToken.waitForDeployment();
  const dataTokenAddress = dataToken.target;
  console.log(`DATAToken deployed to: ${dataTokenAddress}`);

  const dataMarketplace = await ethers.deployContract("DataMarketplace", [dataTokenAddress]);
  await dataMarketplace.waitForDeployment();
  const dataMarketplaceAddress = dataMarketplace.target;
  console.log(`DataMarketplace deployed to: ${dataMarketplaceAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});