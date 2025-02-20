const hre = require("hardhat");

async function main() {
  const taskManagerAddress = process.env.TASK_MANAGER_ADDRESS;
  
  if (!taskManagerAddress) {
    console.error("Please set TASK_MANAGER_ADDRESS environment variable");
    process.exit(1);
  }

  const taskManager = await hre.ethers.getContractAt("TaskManager", taskManagerAddress);

  const totalTasks = await taskManager.getTotalTasks();
  console.log("Total Tasks:", totalTasks.toString());

  if (totalTasks > 0) {
    console.log("\n=== Task Details ===\n");

    for (let i = 0; i < totalTasks && i < 10; i++) {
      try {
        const task = await taskManager.getTask(i);
        
        const statusNames = ["ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"];
        const difficultyNames = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"];
        const rewardTypeNames = ["TOKEN", "NFT", "BOTH"];

        console.log(`Task #${i}:`);
        console.log(`  Creator: ${task.creator}`);
        console.log(`  Metadata URI: ${task.metadataURI}`);
        console.log(`  Status: ${statusNames[task.status]}`);
        console.log(`  Difficulty: ${difficultyNames[task.difficulty]}`);
        console.log(`  Reward Type: ${rewardTypeNames[task.rewardType]}`);
        console.log(`  Base Reward: ${hre.ethers.formatEther(task.baseReward)} tokens`);
        console.log(`  Completions: ${task.currentCompletions}/${task.maxCompletions}`);
        console.log(`  Created: ${new Date(Number(task.createdAt) * 1000).toLocaleString()}`);
        console.log(`  Expires: ${new Date(Number(task.expiresAt) * 1000).toLocaleString()}`);
        console.log();
      } catch (error) {
        console.log(`Task #${i}: Error retrieving data`);
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

