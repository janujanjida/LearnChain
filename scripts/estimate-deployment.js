const hre = require("hardhat");

async function main() {
  console.log("Estimating deployment costs...\n");

  const gasPrice = await hre.ethers.provider.getFeeData();
  const gwei = Number(gasPrice.gasPrice) / 1e9;

  console.log(`Current Gas Price: ${gwei.toFixed(2)} gwei\n`);

  const estimates = [
    { contract: "LearnToken", gas: 1500000 },
    { contract: "TaskManager", gas: 2000000 },
    { contract: "LearningProof", gas: 1800000 },
    { contract: "CredentialSBT", gas: 2200000 },
    { contract: "RewardManager", gas: 2000000 },
    { contract: "InstitutionRegistry", gas: 1500000 },
  ];

  let totalGas = 0;

  for (const est of estimates) {
    const costEth = (est.gas * Number(gasPrice.gasPrice)) / 1e18;
    totalGas += est.gas;
    console.log(`${est.contract}: ${est.gas.toLocaleString()} gas (${costEth.toFixed(6)} ETH)`);
  }

  const totalCost = (totalGas * Number(gasPrice.gasPrice)) / 1e18;
  console.log(`\nTotal: ${totalGas.toLocaleString()} gas (${totalCost.toFixed(6)} ETH)`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

