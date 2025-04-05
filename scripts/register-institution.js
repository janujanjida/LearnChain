const hre = require("hardhat");

async function main() {
  const institutionRegistryAddress = process.env.INSTITUTION_REGISTRY_ADDRESS;
  
  if (!institutionRegistryAddress) {
    console.error("Please set INSTITUTION_REGISTRY_ADDRESS environment variable");
    process.exit(1);
  }

  const [registrant] = await hre.ethers.getSigners();
  console.log("Registering institution with account:", registrant.address);

  const institutionRegistry = await hre.ethers.getContractAt(
    "InstitutionRegistry",
    institutionRegistryAddress
  );

  const name = process.argv[2] || "Example University";
  const metadataURI = process.argv[3] || "ipfs://QmExampleInstitution";

  console.log("\nRegistration Parameters:");
  console.log("- Name:", name);
  console.log("- Metadata URI:", metadataURI);

  const tx = await institutionRegistry.registerInstitution(name, metadataURI);

  console.log("\nTransaction hash:", tx.hash);
  await tx.wait();

  console.log("✓ Institution registered successfully!");
  console.log("Address:", registrant.address);
  console.log("\nNote: Institution requires verification by admin before it can create tasks.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

