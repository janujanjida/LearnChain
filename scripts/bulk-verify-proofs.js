const hre = require("hardhat");

async function main() {
  const learningProofAddress = process.env.LEARNING_PROOF_ADDRESS;
  const taskId = parseInt(process.argv[2]);
  const learnersFile = process.argv[3];
  
  if (!learningProofAddress || isNaN(taskId) || !learnersFile) {
    console.error("Usage: node bulk-verify-proofs.js <task_id> <learners_file>");
    process.exit(1);
  }

  const fs = require("fs");
  const learners = JSON.parse(fs.readFileSync(learnersFile, 'utf8'));

  const [verifier] = await hre.ethers.getSigners();
  const learningProof = await hre.ethers.getContractAt("LearningProof", learningProofAddress);

  console.log(`Verifying ${learners.length} proofs for task #${taskId}...\n`);

  for (const learner of learners) {
    try {
      const tx = await learningProof.verifyProof(taskId, learner, true, "");
      await tx.wait();
      console.log(`✓ Verified: ${learner}`);
    } catch (error) {
      console.log(`✗ Failed: ${learner} - ${error.message}`);
    }
  }

  console.log("\n✓ Bulk verification completed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

