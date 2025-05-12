const hre = require("hardhat");

async function main() {
  const registryAddress = process.env.INSTITUTION_REGISTRY_ADDRESS;
  
  if (!registryAddress) {
    console.error("Please set INSTITUTION_REGISTRY_ADDRESS");
    process.exit(1);
  }

  const registry = await hre.ethers.getContractAt("InstitutionRegistry", registryAddress);

  const verified = await registry.getVerifiedInstitutions();
  
  console.log(`\nVerified Institutions (${verified.length}):\n`);

  for (const addr of verified) {
    const inst = await registry.getInstitution(addr);
    console.log(`${inst.name}`);
    console.log(`  Address: ${addr}`);
    console.log(`  Tasks Created: ${inst.tasksCreated}`);
    console.log(`  Credentials Issued: ${inst.credentialsIssued}`);
    console.log();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

