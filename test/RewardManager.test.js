const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("RewardManager", function () {
  let rewardManager, taskManager, learnToken;
  let owner, distributor, learner;

  beforeEach(async function () {
    [owner, distributor, learner] = await ethers.getSigners();

    const LearnToken = await ethers.getContractFactory("LearnToken");
    learnToken = await LearnToken.deploy(ethers.parseEther("1000000"));
    await learnToken.waitForDeployment();

    const TaskManager = await ethers.getContractFactory("TaskManager");
    taskManager = await TaskManager.deploy();
    await taskManager.waitForDeployment();

    const RewardManager = await ethers.getContractFactory("RewardManager");
    rewardManager = await RewardManager.deploy(
      await learnToken.getAddress(),
      await taskManager.getAddress()
    );
    await rewardManager.waitForDeployment();

    await rewardManager.grantDistributorRole(distributor.address);
    await learnToken.transfer(await rewardManager.getAddress(), ethers.parseEther("100000"));

    await taskManager.grantTaskCreatorRole(owner.address);
    await taskManager.grantVerifierRole(distributor.address);
  });

  describe("Reward Distribution", function () {
    let taskId;

    beforeEach(async function () {
      const expiresAt = (await time.latest()) + 86400 * 30;
      await taskManager.createTask(
        "ipfs://test",
        0,
        1,
        distributor.address,
        ethers.parseEther("100"),
        50,
        expiresAt
      );
      taskId = 0;

      await taskManager.connect(distributor).markTaskCompleted(taskId, learner.address);
    });

    it("Should distribute rewards for completed tasks", async function () {
      await expect(
        rewardManager.connect(distributor).distributeReward(
          taskId,
          learner.address,
          1, // INTERMEDIATE
          0  // TOKEN
        )
      )
        .to.emit(rewardManager, "RewardDistributed")
        .withArgs(taskId, learner.address, ethers.parseEther("100"), 0);

      const pending = await rewardManager.getPendingRewards(learner.address);
      expect(pending).to.equal(ethers.parseEther("100"));
    });

    it("Should calculate rewards based on difficulty", async function () {
      const beginnerReward = await rewardManager.calculateReward(0);
      const intermediateReward = await rewardManager.calculateReward(1);
      const advancedReward = await rewardManager.calculateReward(2);
      const expertReward = await rewardManager.calculateReward(3);

      expect(intermediateReward).to.be.greaterThan(beginnerReward);
      expect(advancedReward).to.be.greaterThan(intermediateReward);
      expect(expertReward).to.be.greaterThan(advancedReward);
    });

    it("Should prevent duplicate reward distribution", async function () {
      await rewardManager.connect(distributor).distributeReward(
        taskId,
        learner.address,
        1,
        0
      );

      await expect(
        rewardManager.connect(distributor).distributeReward(
          taskId,
          learner.address,
          1,
          0
        )
      ).to.be.revertedWith("Reward already distributed");
    });

    it("Should fail without distributor role", async function () {
      await expect(
        rewardManager.connect(learner).distributeReward(
          taskId,
          learner.address,
          1,
          0
        )
      ).to.be.reverted;
    });
  });

  describe("Reward Claiming", function () {
    let taskId;

    beforeEach(async function () {
      const expiresAt = (await time.latest()) + 86400 * 30;
      await taskManager.createTask(
        "ipfs://test",
        0,
        1,
        distributor.address,
        ethers.parseEther("100"),
        50,
        expiresAt
      );
      taskId = 0;

      await taskManager.connect(distributor).markTaskCompleted(taskId, learner.address);
      await rewardManager.connect(distributor).distributeReward(
        taskId,
        learner.address,
        1,
        0
      );
    });

    it("Should allow learners to claim rewards", async function () {
      const initialBalance = await learnToken.balanceOf(learner.address);
      const pending = await rewardManager.getPendingRewards(learner.address);

      await expect(rewardManager.connect(learner).claimRewards())
        .to.emit(rewardManager, "RewardClaimed")
        .withArgs(learner.address, pending, await time.latest());

      const finalBalance = await learnToken.balanceOf(learner.address);
      expect(finalBalance - initialBalance).to.equal(pending);

      expect(await rewardManager.getPendingRewards(learner.address)).to.equal(0);
    });

    it("Should fail when no rewards pending", async function () {
      await rewardManager.connect(learner).claimRewards();

      await expect(
        rewardManager.connect(learner).claimRewards()
      ).to.be.revertedWith("No pending rewards");
    });

    it("Should track reward history", async function () {
      await rewardManager.connect(learner).claimRewards();

      const history = await rewardManager.getRewardHistory(learner.address);
      expect(history.length).to.equal(1);
      expect(history[0].claimed).to.be.true;
    });
  });

  describe("Reward Configuration", function () {
    it("Should update reward configuration", async function () {
      const newBaseAmount = ethers.parseEther("200");

      await expect(
        rewardManager.updateRewardConfig(
          newBaseAmount,
          5000,
          10000,
          15000,
          25000
        )
      )
        .to.emit(rewardManager, "RewardConfigUpdated")
        .withArgs(newBaseAmount, 5000, 10000, 15000, 25000);

      const config = await rewardManager.getRewardConfig();
      expect(config.baseAmount).to.equal(newBaseAmount);
    });

    it("Should fail with invalid multipliers", async function () {
      await expect(
        rewardManager.updateRewardConfig(
          ethers.parseEther("100"),
          0,
          10000,
          15000,
          25000
        )
      ).to.be.revertedWith("Invalid multipliers");
    });

    it("Should fail without admin role", async function () {
      await expect(
        rewardManager.connect(learner).updateRewardConfig(
          ethers.parseEther("200"),
          5000,
          10000,
          15000,
          25000
        )
      ).to.be.reverted;
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow emergency withdrawal", async function () {
      const withdrawAmount = ethers.parseEther("1000");
      const initialBalance = await learnToken.balanceOf(owner.address);

      await rewardManager.emergencyWithdraw(withdrawAmount);

      const finalBalance = await learnToken.balanceOf(owner.address);
      expect(finalBalance - initialBalance).to.equal(withdrawAmount);
    });

    it("Should enable/disable rewards", async function () {
      await rewardManager.setRewardsEnabled(false);

      const config = await rewardManager.getRewardConfig();
      expect(config.enabled).to.be.false;
    });
  });
});

