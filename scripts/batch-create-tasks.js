const hre = require("hardhat");

async function main() {
  const taskManagerAddress = process.env.TASK_MANAGER_ADDRESS;
  const count = parseInt(process.argv[2]) || 5;
  
  if (!taskManagerAddress) {
    console.error("Please set TASK_MANAGER_ADDRESS");
    process.exit(1);
  }

  const [creator] = await hre.ethers.getSigners();
  const taskManager = await hre.ethers.getContractAt("TaskManager", taskManagerAddress);

  console.log(`Creating ${count} tasks...`);

  const difficulties = [0, 1, 2, 3]; // BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
  const baseRewards = ["50", "100", "150", "250"];

  for (let i = 0; i < count; i++) {
    const difficulty = difficulties[i % 4];
    const baseReward = hre.ethers.parseEther(baseRewards[i % 4]);
    const metadataURI = `ipfs://QmTaskBatch${i}`;
    const expiresAt = Math.floor(Date.now() / 1000) + (86400 * 30);

    const tx = await taskManager.createTask(
      metadataURI,
      0, // TOKEN
      difficulty,
      creator.address,
      baseReward,
      100,
      expiresAt
    );

    await tx.wait();
    console.log(`✓ Task ${i + 1}/${count} created`);
  }

  console.log("\n✓ All tasks created successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

