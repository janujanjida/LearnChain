const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const taskManagerAddress = process.env.TASK_MANAGER_ADDRESS;
  
  if (!taskManagerAddress) {
    console.error("Please set TASK_MANAGER_ADDRESS");
    process.exit(1);
  }

  const taskManager = await hre.ethers.getContractAt("TaskManager", taskManagerAddress);
  const totalTasks = await taskManager.getTotalTasks();

  const backup = {
    timestamp: new Date().toISOString(),
    network: (await hre.ethers.provider.getNetwork()).name,
    totalTasks: totalTasks.toString(),
    tasks: []
  };

  console.log(`Backing up ${totalTasks} tasks...`);

  for (let i = 0; i < totalTasks && i < 100; i++) {
    const task = await taskManager.getTask(i);
    backup.tasks.push({
      taskId: i,
      creator: task.creator,
      metadataURI: task.metadataURI,
      difficulty: task.difficulty,
      baseReward: task.baseReward.toString()
    });
  }

  fs.writeFileSync('backup.json', JSON.stringify(backup, null, 2));
  console.log("✓ Backup saved to backup.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

