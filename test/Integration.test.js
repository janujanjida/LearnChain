const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Integration Tests", function () {
  let learnToken, taskManager, learningProof, credentialSBT, rewardManager;
  let owner, institution, learner, verifier;

  beforeEach(async function () {
    [owner, institution, learner, verifier] = await ethers.getSigners();

    const LearnToken = await ethers.getContractFactory("LearnToken");
    learnToken = await LearnToken.deploy(ethers.parseEther("1000000"));
    await learnToken.waitForDeployment();

    const TaskManager = await ethers.getContractFactory("TaskManager");
    taskManager = await TaskManager.deploy();
    await taskManager.waitForDeployment();

    const LearningProof = await ethers.getContractFactory("LearningProof");
    learningProof = await LearningProof.deploy(await taskManager.getAddress());
    await learningProof.waitForDeployment();

    const CredentialSBT = await ethers.getContractFactory("CredentialSBT");
    credentialSBT = await CredentialSBT.deploy("LearnCred", "LCRED", "ipfs://");
    await credentialSBT.waitForDeployment();

    const RewardManager = await ethers.getContractFactory("RewardManager");
    rewardManager = await RewardManager.deploy(
      await learnToken.getAddress(),
      await taskManager.getAddress()
    );
    await rewardManager.waitForDeployment();

    await taskManager.grantTaskCreatorRole(institution.address);
    await taskManager.grantVerifierRole(await learningProof.getAddress());
    await learningProof.grantVerifierRole(verifier.address);
    await credentialSBT.grantMinterRole(owner.address);
    await rewardManager.grantDistributorRole(owner.address);
    await learnToken.transfer(await rewardManager.getAddress(), ethers.parseEther("100000"));
  });

  describe("Complete Learning Workflow", function () {
    it("Should complete full cycle: task creation -> proof -> credential -> reward", async function () {
      const expiresAt = (await time.latest()) + 86400 * 30;
      
      const createTx = await taskManager.connect(institution).createTask(
        "ipfs://task-metadata",
        0,
        1,
        verifier.address,
        ethers.parseEther("100"),
        50,
        expiresAt
      );
      await createTx.wait();
      const taskId = 0;

      const proofHash = ethers.keccak256(ethers.toUtf8Bytes("learning-proof-data"));
      const nonce = await learningProof.getNonce(learner.address);
      const deadline = (await time.latest()) + 3600;

      const domain = {
        name: "LearnChain",
        version: "1",
        chainId: (await ethers.provider.getNetwork()).chainId,
        verifyingContract: await learningProof.getAddress(),
      };

      const types = {
        LearningProof: [
          { name: "taskId", type: "uint256" },
          { name: "learner", type: "address" },
          { name: "proofHash", type: "bytes32" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      };

      const value = {
        taskId,
        learner: learner.address,
        proofHash,
        nonce,
        deadline,
      };

      const signature = await learner.signTypedData(domain, types, value);
      await learningProof.connect(learner).submitProof(taskId, proofHash, signature);

      await learningProof.connect(verifier).verifyProof(taskId, learner.address, true, "");

      await taskManager.connect(verifier).markTaskCompleted(taskId, learner.address);

      await credentialSBT.mintCredential(learner.address, taskId, "ipfs://credential");

      await rewardManager.distributeReward(taskId, learner.address, 1, 0);

      const credentials = await credentialSBT.getCredentialsByLearner(learner.address);
      expect(credentials.length).to.equal(1);

      const pendingRewards = await rewardManager.getPendingRewards(learner.address);
      expect(pendingRewards).to.be.greaterThan(0);

      const initialBalance = await learnToken.balanceOf(learner.address);
      await rewardManager.connect(learner).claimRewards();
      const finalBalance = await learnToken.balanceOf(learner.address);
      
      expect(finalBalance).to.be.greaterThan(initialBalance);
    });
  });
});

