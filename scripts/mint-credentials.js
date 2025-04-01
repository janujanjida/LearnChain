const hre = require("hardhat");

async function main() {
  const credentialSBTAddress = process.env.CREDENTIAL_SBT_ADDRESS;
  
  if (!credentialSBTAddress) {
    console.error("Please set CREDENTIAL_SBT_ADDRESS environment variable");
    process.exit(1);
  }

  const [minter] = await hre.ethers.getSigners();
  console.log("Minting credentials with account:", minter.address);

  const credentialSBT = await hre.ethers.getContractAt("CredentialSBT", credentialSBTAddress);

  const learnerAddress = process.argv[2] || minter.address;
  const taskId = process.argv[3] || "1";
  const metadataURI = process.argv[4] || "ipfs://QmExampleCredential";

  console.log("\nMinting Parameters:");
  console.log("- Learner:", learnerAddress);
  console.log("- Task ID:", taskId);
  console.log("- Metadata URI:", metadataURI);

  const tx = await credentialSBT.mintCredential(
    learnerAddress,
    taskId,
    metadataURI
  );

  console.log("\nTransaction hash:", tx.hash);
  const receipt = await tx.wait();

  const tokenId = receipt.logs[0].args[0];
  console.log("✓ Credential minted successfully!");
  console.log("Token ID:", tokenId.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

