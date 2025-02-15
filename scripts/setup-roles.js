const hre = require("hardhat");

async function main() {
  console.log("Setting up roles and permissions...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Using deployer account:", deployer.address);

  // Get contract addresses from environment or deployment
  const taskManagerAddress = process.env.TASK_MANAGER_ADDRESS;
  const learningProofAddress = process.env.LEARNING_PROOF_ADDRESS;
  const credentialSBTAddress = process.env.CREDENTIAL_SBT_ADDRESS;
  const rewardManagerAddress = process.env.REWARD_MANAGER_ADDRESS;
  const institutionRegistryAddress = process.env.INSTITUTION_REGISTRY_ADDRESS;

  if (!taskManagerAddress || !learningProofAddress || !credentialSBTAddress || 
      !rewardManagerAddress || !institutionRegistryAddress) {
    console.error("Please set all contract addresses in environment variables");
    process.exit(1);
  }

  // Connect to contracts
  const taskManager = await hre.ethers.getContractAt("TaskManager", taskManagerAddress);
  const learningProof = await hre.ethers.getContractAt("LearningProof", learningProofAddress);
  const credentialSBT = await hre.ethers.getContractAt("CredentialSBT", credentialSBTAddress);
  const rewardManager = await hre.ethers.getContractAt("RewardManager", rewardManagerAddress);
  const institutionRegistry = await hre.ethers.getContractAt("InstitutionRegistry", institutionRegistryAddress);

  console.log("\n1. Granting verifier role to LearningProof in TaskManager...");
  let tx = await taskManager.grantVerifierRole(learningProofAddress);
  await tx.wait();
  console.log("✓ Done");

  console.log("\n2. Granting verifier role in LearningProof...");
  tx = await learningProof.grantVerifierRole(deployer.address);
  await tx.wait();
  console.log("✓ Done");

  console.log("\n3. Granting minter role to RewardManager in CredentialSBT...");
  tx = await credentialSBT.grantMinterRole(rewardManagerAddress);
  await tx.wait();
  console.log("✓ Done");

  console.log("\n4. Granting distributor role to LearningProof in RewardManager...");
  tx = await rewardManager.grantDistributorRole(learningProofAddress);
  await tx.wait();
  console.log("✓ Done");

  console.log("\n5. Granting verifier role in InstitutionRegistry...");
  tx = await institutionRegistry.grantVerifierRole(deployer.address);
  await tx.wait();
  console.log("✓ Done");

  console.log("\nRole setup completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

