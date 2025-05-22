const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("LearnChainCoordinator", function () {
  let coordinator, taskManager, learningProof, credentialSBT, rewardManager, institutionRegistry, learnToken;
  let owner, learner, verifier;

  beforeEach(async function () {
    [owner, learner, verifier] = await ethers.getSigners();

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

    const InstitutionRegistry = await ethers.getContractFactory("InstitutionRegistry");
    institutionRegistry = await InstitutionRegistry.deploy();
    await institutionRegistry.waitForDeployment();

    const LearnChainCoordinator = await ethers.getContractFactory("LearnChainCoordinator");
    coordinator = await LearnChainCoordinator.deploy(
      await taskManager.getAddress(),
      await learningProof.getAddress(),
      await credentialSBT.getAddress(),
      await rewardManager.getAddress(),
      await institutionRegistry.getAddress()
    );
    await coordinator.waitForDeployment();

    await credentialSBT.grantMinterRole(await coordinator.getAddress());
    await rewardManager.grantDistributorRole(await coordinator.getAddress());
    await learnToken.transfer(await rewardManager.getAddress(), ethers.parseEther("100000"));
  });

  describe("Deployment", function () {
    it("Should set correct contract addresses", async function () {
      expect(await coordinator.taskManager()).to.equal(await taskManager.getAddress());
      expect(await coordinator.learningProof()).to.equal(await learningProof.getAddress());
      expect(await coordinator.credentialSBT()).to.equal(await credentialSBT.getAddress());
      expect(await coordinator.rewardManager()).to.equal(await rewardManager.getAddress());
      expect(await coordinator.institutionRegistry()).to.equal(await institutionRegistry.getAddress());
    });
  });

  describe("Statistics", function () {
    it("Should return learner statistics", async function () {
      const stats = await coordinator.getLearnerStats(learner.address);
      expect(stats.completedTasks).to.equal(0);
      expect(stats.credentialsEarned).to.equal(0);
      expect(stats.pendingRewards).to.equal(0);
    });

    it("Should return institution statistics", async function () {
      await institutionRegistry.connect(owner).registerInstitution("Test Uni", "ipfs://test");
      
      const stats = await coordinator.getInstitutionStats(owner.address);
      expect(stats.isVerified).to.be.false;
      expect(stats.tasksCreated).to.equal(0);
      expect(stats.credentialsIssued).to.equal(0);
    });
  });

  describe("Contract Updates", function () {
    it("Should allow owner to update contracts", async function () {
      const newTaskManager = await (await ethers.getContractFactory("TaskManager")).deploy();
      await newTaskManager.waitForDeployment();

      await expect(
        coordinator.updateContracts(
          await newTaskManager.getAddress(),
          ethers.ZeroAddress,
          ethers.ZeroAddress,
          ethers.ZeroAddress,
          ethers.ZeroAddress
        )
      ).to.emit(coordinator, "ContractsUpdated");

      expect(await coordinator.taskManager()).to.equal(await newTaskManager.getAddress());
    });

    it("Should fail when non-owner tries to update", async function () {
      await expect(
        coordinator.connect(learner).updateContracts(
          ethers.ZeroAddress,
          ethers.ZeroAddress,
          ethers.ZeroAddress,
          ethers.ZeroAddress,
          ethers.ZeroAddress
        )
      ).to.be.reverted;
    });
  });
});

