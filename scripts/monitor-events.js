const hre = require("hardhat");

async function main() {
  const taskManagerAddress = process.env.TASK_MANAGER_ADDRESS;
  
  if (!taskManagerAddress) {
    console.error("Please set TASK_MANAGER_ADDRESS");
    process.exit(1);
  }

  const taskManager = await hre.ethers.getContractAt("TaskManager", taskManagerAddress);

  console.log("Monitoring LearnChain events...\n");

  taskManager.on("TaskCreated", (taskId, creator, difficulty, baseReward) => {
    console.log(`[TaskCreated] Task #${taskId} by ${creator}`);
  });

  taskManager.on("TaskCompleted", (taskId, learner, timestamp) => {
    console.log(`[TaskCompleted] Task #${taskId} completed by ${learner}`);
  });

  console.log("Listening for events... (Press Ctrl+C to stop)");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

