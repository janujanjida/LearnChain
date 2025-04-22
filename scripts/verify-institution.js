const hre = require("hardhat");

async function main() {
  const registryAddress = process.env.INSTITUTION_REGISTRY_ADDRESS;
  const institutionAddress = process.argv[2];
  
  if (!registryAddress || !institutionAddress) {
    console.error("Usage: INSTITUTION_REGISTRY_ADDRESS=0x... node verify-institution.js <institution_address>");
    process.exit(1);
  }

  const [verifier] = await hre.ethers.getSigners();
  const registry = await hre.ethers.getContractAt("InstitutionRegistry", registryAddress);

  console.log(`Verifying institution: ${institutionAddress}`);
  console.log(`With verifier: ${verifier.address}\n`);

  const tx = await registry.verifyInstitution(institutionAddress);
  await tx.wait();

  console.log("✓ Institution verified successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

