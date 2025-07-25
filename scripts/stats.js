const hre = require("hardhat");

async function main() {
  const addresses = {
    taskManager: process.env.TASK_MANAGER_ADDRESS,
    credentialSBT: process.env.CREDENTIAL_SBT_ADDRESS,
    rewardManager: process.env.REWARD_MANAGER_ADDRESS,
  };

  Object.entries(addresses).forEach(([key, val]) => {
    if (!val) {
      console.error(`Missing ${key.toUpperCase()}_ADDRESS`);
      process.exit(1);
    }
  });

  const taskManager = await hre.ethers.getContractAt("TaskManager", addresses.taskManager);
  const credentialSBT = await hre.ethers.getContractAt("CredentialSBT", addresses.credentialSBT);

  const totalTasks = await taskManager.getTotalTasks();
  const totalCredentials = await credentialSBT.totalSupply();

  console.log("\n=== LearnChain Statistics ===\n");
  console.log(`Total Tasks Created: ${totalTasks}`);
  console.log(`Total Credentials Issued: ${totalCredentials}`);
  console.log();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

