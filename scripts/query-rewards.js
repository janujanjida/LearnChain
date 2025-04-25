const hre = require("hardhat");

async function main() {
  const rewardManagerAddress = process.env.REWARD_MANAGER_ADDRESS;
  const learnerAddress = process.argv[2];
  
  if (!rewardManagerAddress) {
    console.error("Please set REWARD_MANAGER_ADDRESS environment variable");
    process.exit(1);
  }

  if (!learnerAddress) {
    console.error("Usage: node query-rewards.js <learner_address>");
    process.exit(1);
  }

  const rewardManager = await hre.ethers.getContractAt("RewardManager", rewardManagerAddress);

  const pendingRewards = await rewardManager.getPendingRewards(learnerAddress);
  const rewardHistory = await rewardManager.getRewardHistory(learnerAddress);

  console.log(`\nReward Information for ${learnerAddress}:\n`);
  console.log(`Pending Rewards: ${hre.ethers.formatEther(pendingRewards)} LEARN\n`);

  if (rewardHistory.length > 0) {
    console.log("Reward History:");
    console.log("================\n");

    for (const record of rewardHistory) {
      console.log(`Task ID: ${record.taskId}`);
      console.log(`  Amount: ${hre.ethers.formatEther(record.amount)} LEARN`);
      console.log(`  Claimed: ${record.claimed ? "Yes" : "No"}`);
      if (record.claimed) {
        console.log(`  Claimed At: ${new Date(Number(record.claimedAt) * 1000).toLocaleString()}`);
      }
      console.log();
    }
  } else {
    console.log("No reward history found.\n");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

