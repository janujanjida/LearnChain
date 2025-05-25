const hre = require("hardhat");

async function main() {
  console.log("Generating gas usage report...\n");

  const operations = [
    { name: "Create Task", estimate: 150000 },
    { name: "Submit Proof", estimate: 120000 },
    { name: "Verify Proof", estimate: 80000 },
    { name: "Mint Credential", estimate: 200000 },
    { name: "Distribute Reward", estimate: 90000 },
    { name: "Claim Rewards", estimate: 70000 },
  ];

  const gasPrice = await hre.ethers.provider.getFeeData();
  const gwei = Number(gasPrice.gasPrice) / 1e9;

  console.log(`Current Gas Price: ${gwei.toFixed(2)} gwei\n`);
  console.log("Operation Gas Estimates:\n");

  for (const op of operations) {
    const cost = (op.estimate * Number(gasPrice.gasPrice)) / 1e18;
    console.log(`${op.name}:`);
    console.log(`  Gas: ${op.estimate.toLocaleString()}`);
    console.log(`  Cost: ${cost.toFixed(6)} ETH`);
    console.log();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

