const hre = require("hardhat");

async function main() {
  const rewardManagerAddress = process.env.REWARD_MANAGER_ADDRESS;
  
  if (!rewardManagerAddress) {
    console.error("Please set REWARD_MANAGER_ADDRESS");
    process.exit(1);
  }

  const [admin] = await hre.ethers.getSigners();
  const rewardManager = await hre.ethers.getContractAt("RewardManager", rewardManagerAddress);

  const baseAmount = hre.ethers.parseEther(process.argv[2] || "100");
  const beginnerMult = parseInt(process.argv[3] || "5000");
  const intermediateMult = parseInt(process.argv[4] || "10000");
  const advancedMult = parseInt(process.argv[5] || "15000");
  const expertMult = parseInt(process.argv[6] || "25000");

  console.log("Updating reward configuration...");
  console.log("Base Amount:", hre.ethers.formatEther(baseAmount), "LEARN");
  console.log("Multipliers:", {beginnerMult, intermediateMult, advancedMult, expertMult});

  const tx = await rewardManager.updateRewardConfig(
    baseAmount,
    beginnerMult,
    intermediateMult,
    advancedMult,
    expertMult
  );

  await tx.wait();
  console.log("✓ Reward configuration updated");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

