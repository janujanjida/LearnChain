const hre = require("hardhat");

async function main() {
  const credentialSBTAddress = process.env.CREDENTIAL_SBT_ADDRESS;
  const learnerAddress = process.argv[2];
  
  if (!credentialSBTAddress) {
    console.error("Please set CREDENTIAL_SBT_ADDRESS environment variable");
    process.exit(1);
  }

  if (!learnerAddress) {
    console.error("Usage: node query-credentials.js <learner_address>");
    process.exit(1);
  }

  const credentialSBT = await hre.ethers.getContractAt("CredentialSBT", credentialSBTAddress);

  const credentials = await credentialSBT.getCredentialsByLearner(learnerAddress);
  
  console.log(`\nCredentials for ${learnerAddress}:`);
  console.log(`Total: ${credentials.length}\n`);

  for (const tokenId of credentials) {
    const credential = await credentialSBT.getCredential(tokenId);
    const uri = await credentialSBT.tokenURI(tokenId);
    
    console.log(`Token ID: ${tokenId}`);
    console.log(`  Task ID: ${credential.taskId}`);
    console.log(`  Issued At: ${new Date(Number(credential.issuedAt) * 1000).toLocaleString()}`);
    console.log(`  Issuer: ${credential.issuer}`);
    console.log(`  Metadata URI: ${uri}`);
    console.log(`  Revoked: ${credential.revoked}`);
    console.log();
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

