const hre = require("hardhat");

async function main() {
  const taskManagerAddress = process.env.TASK_MANAGER_ADDRESS;
  
  if (!taskManagerAddress) {
    console.error("Please set TASK_MANAGER_ADDRESS environment variable");
    process.exit(1);
  }

  const [creator] = await hre.ethers.getSigners();
  console.log("Creating task with account:", creator.address);

  const taskManager = await hre.ethers.getContractAt("TaskManager", taskManagerAddress);

  const metadataURI = "ipfs://QmExampleTaskMetadata";
  const rewardType = 0; // TOKEN
  const difficulty = 1; // INTERMEDIATE
  const verifierAddress = creator.address;
  const baseReward = hre.ethers.parseEther("100");
  const maxCompletions = 100;
  const expiresAt = Math.floor(Date.now() / 1000) + (86400 * 30); // 30 days

  console.log("\nTask Parameters:");
  console.log("- Metadata URI:", metadataURI);
  console.log("- Reward Type: TOKEN");
  console.log("- Difficulty: INTERMEDIATE");
  console.log("- Base Reward:", hre.ethers.formatEther(baseReward), "tokens");
  console.log("- Max Completions:", maxCompletions);
  console.log("- Expires:", new Date(expiresAt * 1000).toLocaleString());

  console.log("\nCreating task...");
  const tx = await taskManager.createTask(
    metadataURI,
    rewardType,
    difficulty,
    verifierAddress,
    baseReward,
    maxCompletions,
    expiresAt
  );

  console.log("Transaction hash:", tx.hash);
  const receipt = await tx.wait();

  const taskId = receipt.logs[0].args[0];
  console.log("\n✓ Task created successfully!");
  console.log("Task ID:", taskId.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

