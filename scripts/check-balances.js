const hre = require("hardhat");

async function main() {
  const learnTokenAddress = process.env.LEARN_TOKEN_ADDRESS;
  const addresses = process.argv.slice(2);
  
  if (!learnTokenAddress) {
    console.error("Please set LEARN_TOKEN_ADDRESS");
    process.exit(1);
  }

  if (addresses.length === 0) {
    console.error("Usage: node check-balances.js <address1> [address2] ...");
    process.exit(1);
  }

  const learnToken = await hre.ethers.getContractAt("LearnToken", learnTokenAddress);

  console.log("\nLEARN Token Balances:\n");

  for (const address of addresses) {
    const balance = await learnToken.balanceOf(address);
    console.log(`${address}: ${hre.ethers.formatEther(balance)} LEARN`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

