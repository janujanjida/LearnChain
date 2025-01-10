const hre = require("hardhat");

async function main() {
  console.log("Starting LearnChain deployment...");

  // Deploy LearnToken
  console.log("\n1. Deploying LearnToken...");
  const LearnToken = await hre.ethers.getContractFactory("LearnToken");
  const initialSupply = hre.ethers.parseEther("100000000"); // 100 million tokens
  const learnToken = await LearnToken.deploy(initialSupply);
  await learnToken.waitForDeployment();
  const learnTokenAddress = await learnToken.getAddress();
  console.log("LearnToken deployed to:", learnTokenAddress);

  // Deploy TaskManager
  console.log("\n2. Deploying TaskManager...");
  const TaskManager = await hre.ethers.getContractFactory("TaskManager");
  const taskManager = await TaskManager.deploy();
  await taskManager.waitForDeployment();
  const taskManagerAddress = await taskManager.getAddress();
  console.log("TaskManager deployed to:", taskManagerAddress);

  // Deploy LearningProof
  console.log("\n3. Deploying LearningProof...");
  const LearningProof = await hre.ethers.getContractFactory("LearningProof");
  const learningProof = await LearningProof.deploy(taskManagerAddress);
  await learningProof.waitForDeployment();
  const learningProofAddress = await learningProof.getAddress();
  console.log("LearningProof deployed to:", learningProofAddress);

  // Deploy CredentialSBT
  console.log("\n4. Deploying CredentialSBT...");
  const CredentialSBT = await hre.ethers.getContractFactory("CredentialSBT");
  const credentialSBT = await CredentialSBT.deploy(
    "LearnChain Credentials",
    "LEARNCRED",
    "https://api.learnchain.io/credentials/"
  );
  await credentialSBT.waitForDeployment();
  const credentialSBTAddress = await credentialSBT.getAddress();
  console.log("CredentialSBT deployed to:", credentialSBTAddress);

  // Deploy RewardManager
  console.log("\n5. Deploying RewardManager...");
  const RewardManager = await hre.ethers.getContractFactory("RewardManager");
  const rewardManager = await RewardManager.deploy(
    learnTokenAddress,
    taskManagerAddress
  );
  await rewardManager.waitForDeployment();
  const rewardManagerAddress = await rewardManager.getAddress();
  console.log("RewardManager deployed to:", rewardManagerAddress);

  // Deploy InstitutionRegistry
  console.log("\n6. Deploying InstitutionRegistry...");
  const InstitutionRegistry = await hre.ethers.getContractFactory("InstitutionRegistry");
  const institutionRegistry = await InstitutionRegistry.deploy();
  await institutionRegistry.waitForDeployment();
  const institutionRegistryAddress = await institutionRegistry.getAddress();
  console.log("InstitutionRegistry deployed to:", institutionRegistryAddress);

  // Setup roles and permissions
  console.log("\n7. Setting up roles and permissions...");
  
  // Grant TaskManager verifier role to LearningProof
  await taskManager.grantVerifierRole(learningProofAddress);
  console.log("Granted verifier role to LearningProof in TaskManager");

  // Grant minter role to RewardManager for CredentialSBT
  await credentialSBT.grantMinterRole(rewardManagerAddress);
  console.log("Granted minter role to RewardManager in CredentialSBT");

  // Transfer some tokens to RewardManager
  const rewardAmount = hre.ethers.parseEther("10000000"); // 10 million tokens
  await learnToken.transfer(rewardManagerAddress, rewardAmount);
  console.log("Transferred tokens to RewardManager");

  // Grant distributor role to LearningProof
  await rewardManager.grantDistributorRole(learningProofAddress);
  console.log("Granted distributor role to LearningProof in RewardManager");

  console.log("\n=== Deployment Summary ===");
  console.log("LearnToken:", learnTokenAddress);
  console.log("TaskManager:", taskManagerAddress);
  console.log("LearningProof:", learningProofAddress);
  console.log("CredentialSBT:", credentialSBTAddress);
  console.log("RewardManager:", rewardManagerAddress);
  console.log("InstitutionRegistry:", institutionRegistryAddress);
  console.log("\nDeployment completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

