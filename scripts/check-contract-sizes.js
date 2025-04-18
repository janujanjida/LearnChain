const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("Checking contract sizes...\n");

  const contracts = [
    "LearnToken",
    "TaskManager",
    "LearningProof",
    "CredentialSBT",
    "RewardManager",
    "InstitutionRegistry",
    "LearnChainCoordinator"
  ];

  const MAX_SIZE = 24576; // 24KB limit

  for (const name of contracts) {
    try {
      const artifact = await hre.artifacts.readArtifact(name);
      const bytecode = artifact.bytecode;
      const size = Buffer.byteLength(bytecode, 'utf8') / 2;
      const percentage = (size / MAX_SIZE * 100).toFixed(2);

      console.log(`${name}:`);
      console.log(`  Size: ${size} bytes (${percentage}% of limit)`);
      console.log(`  Status: ${size > MAX_SIZE ? '❌ EXCEEDS LIMIT' : '✓ OK'}`);
      console.log();
    } catch (error) {
      console.log(`${name}: ✗ Not found or not compiled\n`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

