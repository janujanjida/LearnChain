const hre = require("hardhat");

async function main() {
  const taskManagerAddress = process.env.TASK_MANAGER_ADDRESS;
  
  if (!taskManagerAddress) {
    console.error("Please set TASK_MANAGER_ADDRESS");
    process.exit(1);
  }

  const [admin] = await hre.ethers.getSigners();
  console.log("Pausing contracts with admin:", admin.address);

  const taskManager = await hre.ethers.getContractAt("TaskManager", taskManagerAddress);

  const tx = await taskManager.pause();
  await tx.wait();

  console.log("✓ TaskManager paused");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

