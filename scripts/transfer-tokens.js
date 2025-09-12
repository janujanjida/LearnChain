const hre = require("hardhat");

async function main() {
  const learnTokenAddress = process.env.LEARN_TOKEN_ADDRESS;
  const recipient = process.argv[2];
  const amount = process.argv[3];
  
  if (!learnTokenAddress || !recipient || !amount) {
    console.error("Usage: node transfer-tokens.js <recipient_address> <amount>");
    process.exit(1);
  }

  const [sender] = await hre.ethers.getSigners();
  const learnToken = await hre.ethers.getContractAt("LearnToken", learnTokenAddress);

  const transferAmount = hre.ethers.parseEther(amount);

  console.log(`Transferring ${amount} LEARN tokens...`);
  console.log(`From: ${sender.address}`);
  console.log(`To: ${recipient}`);

  const tx = await learnToken.transfer(recipient, transferAmount);
  await tx.wait();

  console.log("✓ Transfer completed");
  console.log(`Transaction: ${tx.hash}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

