const fs = require("fs");
const path = require("path");

async function main() {
  const contracts = [
    "LearnToken",
    "TaskManager",
    "LearningProof",
    "CredentialSBT",
    "RewardManager",
    "InstitutionRegistry",
    "LearnChainCoordinator"
  ];

  const outputDir = path.join(__dirname, "..", "abi");
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log("Exporting ABIs...\n");

  for (const contractName of contracts) {
    try {
      const artifact = require(`../artifacts/contracts/${getContractPath(contractName)}.sol/${contractName}.json`);
      
      const abiPath = path.join(outputDir, `${contractName}.json`);
      fs.writeFileSync(abiPath, JSON.stringify(artifact.abi, null, 2));
      
      console.log(`✓ Exported ${contractName} ABI`);
    } catch (error) {
      console.log(`✗ Failed to export ${contractName}:`, error.message);
    }
  }

  console.log("\n✓ ABI export completed!");
}

function getContractPath(contractName) {
  if (contractName === "LearnToken") return contractName;
  if (contractName === "LearnChainCoordinator") return "core/LearnChainCoordinator";
  return `core/${contractName}`;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

