const hre = require("hardhat");

async function main() {
  const contract = process.argv[2];
  const role = process.argv[3];
  const account = process.argv[4];

  if (!contract || !role || !account) {
    console.error("Usage: node grant-roles.js <contract_address> <role_name> <account_address>");
    console.error("Example: node grant-roles.js 0x123... MINTER_ROLE 0x456...");
    process.exit(1);
  }

  const [admin] = await hre.ethers.getSigners();
  console.log("Granting role with admin account:", admin.address);

  const roleBytes = hre.ethers.id(role);
  
  const contractInstance = await hre.ethers.getContractAt("TaskManager", contract);
  
  const tx = await contractInstance.grantRole(roleBytes, account);
  await tx.wait();

  console.log(`✓ Granted ${role} to ${account}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

