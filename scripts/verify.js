const hre = require("hardhat");

async function main() {
  const contracts = {
    learnToken: process.env.LEARN_TOKEN_ADDRESS,
    taskManager: process.env.TASK_MANAGER_ADDRESS,
    learningProof: process.env.LEARNING_PROOF_ADDRESS,
    credentialSBT: process.env.CREDENTIAL_SBT_ADDRESS,
    rewardManager: process.env.REWARD_MANAGER_ADDRESS,
    institutionRegistry: process.env.INSTITUTION_REGISTRY_ADDRESS,
  };

  console.log("Starting contract verification...\n");

  // Verify LearnToken
  if (contracts.learnToken) {
    console.log("Verifying LearnToken...");
    try {
      await hre.run("verify:verify", {
        address: contracts.learnToken,
        constructorArguments: [hre.ethers.parseEther("100000000")],
      });
      console.log("✓ LearnToken verified\n");
    } catch (error) {
      console.log("✗ LearnToken verification failed:", error.message, "\n");
    }
  }

  // Verify TaskManager
  if (contracts.taskManager) {
    console.log("Verifying TaskManager...");
    try {
      await hre.run("verify:verify", {
        address: contracts.taskManager,
        constructorArguments: [],
      });
      console.log("✓ TaskManager verified\n");
    } catch (error) {
      console.log("✗ TaskManager verification failed:", error.message, "\n");
    }
  }

  // Verify LearningProof
  if (contracts.learningProof && contracts.taskManager) {
    console.log("Verifying LearningProof...");
    try {
      await hre.run("verify:verify", {
        address: contracts.learningProof,
        constructorArguments: [contracts.taskManager],
      });
      console.log("✓ LearningProof verified\n");
    } catch (error) {
      console.log("✗ LearningProof verification failed:", error.message, "\n");
    }
  }

  // Verify CredentialSBT
  if (contracts.credentialSBT) {
    console.log("Verifying CredentialSBT...");
    try {
      await hre.run("verify:verify", {
        address: contracts.credentialSBT,
        constructorArguments: [
          "LearnChain Credentials",
          "LEARNCRED",
          "https://api.learnchain.io/credentials/",
        ],
      });
      console.log("✓ CredentialSBT verified\n");
    } catch (error) {
      console.log("✗ CredentialSBT verification failed:", error.message, "\n");
    }
  }

  // Verify RewardManager
  if (contracts.rewardManager && contracts.learnToken && contracts.taskManager) {
    console.log("Verifying RewardManager...");
    try {
      await hre.run("verify:verify", {
        address: contracts.rewardManager,
        constructorArguments: [contracts.learnToken, contracts.taskManager],
      });
      console.log("✓ RewardManager verified\n");
    } catch (error) {
      console.log("✗ RewardManager verification failed:", error.message, "\n");
    }
  }

  // Verify InstitutionRegistry
  if (contracts.institutionRegistry) {
    console.log("Verifying InstitutionRegistry...");
    try {
      await hre.run("verify:verify", {
        address: contracts.institutionRegistry,
        constructorArguments: [],
      });
      console.log("✓ InstitutionRegistry verified\n");
    } catch (error) {
      console.log("✗ InstitutionRegistry verification failed:", error.message, "\n");
    }
  }

  console.log("Verification process completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

