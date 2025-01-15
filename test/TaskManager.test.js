const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("TaskManager", function () {
  let taskManager;
  let owner, creator, learner, verifier;

  beforeEach(async function () {
    [owner, creator, learner, verifier] = await ethers.getSigners();

    const TaskManager = await ethers.getContractFactory("TaskManager");
    taskManager = await TaskManager.deploy();
    await taskManager.waitForDeployment();

    // Grant roles
    await taskManager.grantTaskCreatorRole(creator.address);
    await taskManager.grantVerifierRole(verifier.address);
  });

  describe("Task Creation", function () {
    it("Should create a task with valid parameters", async function () {
      const metadataURI = "ipfs://QmTest123";
      const baseReward = ethers.parseEther("100");
      const maxCompletions = 50;
      const expiresAt = (await time.latest()) + 86400 * 30; // 30 days

      await expect(
        taskManager.connect(creator).createTask(
          metadataURI,
          0, // RewardType.TOKEN
          1, // Difficulty.INTERMEDIATE
          verifier.address,
          baseReward,
          maxCompletions,
          expiresAt
        )
      )
        .to.emit(taskManager, "TaskCreated")
        .withArgs(0, creator.address, 1, baseReward);

      const task = await taskManager.getTask(0);
      expect(task.creator).to.equal(creator.address);
      expect(task.metadataURI).to.equal(metadataURI);
      expect(task.baseReward).to.equal(baseReward);
    });

    it("Should fail to create task without creator role", async function () {
      const expiresAt = (await time.latest()) + 86400 * 30;

      await expect(
        taskManager.connect(learner).createTask(
          "ipfs://test",
          0,
          1,
          verifier.address,
          ethers.parseEther("100"),
          50,
          expiresAt
        )
      ).to.be.reverted;
    });

    it("Should fail with invalid parameters", async function () {
      const expiresAt = (await time.latest()) + 86400 * 30;

      await expect(
        taskManager.connect(creator).createTask(
          "",
          0,
          1,
          verifier.address,
          ethers.parseEther("100"),
          50,
          expiresAt
        )
      ).to.be.revertedWith("Metadata URI required");

      await expect(
        taskManager.connect(creator).createTask(
          "ipfs://test",
          0,
          1,
          ethers.ZeroAddress,
          ethers.parseEther("100"),
          50,
          expiresAt
        )
      ).to.be.revertedWith("Invalid verifier address");
    });
  });

  describe("Task Status Management", function () {
    let taskId;

    beforeEach(async function () {
      const expiresAt = (await time.latest()) + 86400 * 30;
      await taskManager.connect(creator).createTask(
        "ipfs://test",
        0,
        1,
        verifier.address,
        ethers.parseEther("100"),
        50,
        expiresAt
      );
      taskId = 0;
    });

    it("Should allow creator to update task status", async function () {
      await expect(taskManager.connect(creator).updateTaskStatus(taskId, 1))
        .to.emit(taskManager, "TaskUpdated")
        .withArgs(taskId, 1);

      const task = await taskManager.getTask(taskId);
      expect(task.status).to.equal(1);
    });

    it("Should prevent non-creator from updating status", async function () {
      await expect(
        taskManager.connect(learner).updateTaskStatus(taskId, 1)
      ).to.be.revertedWith("Unauthorized");
    });
  });

  describe("Task Completion", function () {
    let taskId;

    beforeEach(async function () {
      const expiresAt = (await time.latest()) + 86400 * 30;
      await taskManager.connect(creator).createTask(
        "ipfs://test",
        0,
        1,
        verifier.address,
        ethers.parseEther("100"),
        50,
        expiresAt
      );
      taskId = 0;
    });

    it("Should mark task as completed by verifier", async function () {
      await expect(
        taskManager.connect(verifier).markTaskCompleted(taskId, learner.address)
      )
        .to.emit(taskManager, "TaskCompleted")
        .withArgs(taskId, learner.address, await time.latest());

      expect(await taskManager.hasCompleted(taskId, learner.address)).to.be.true;
    });

    it("Should prevent double completion", async function () {
      await taskManager.connect(verifier).markTaskCompleted(taskId, learner.address);

      await expect(
        taskManager.connect(verifier).markTaskCompleted(taskId, learner.address)
      ).to.be.revertedWith("Task already completed");
    });

    it("Should track completion count", async function () {
      const [, , l1, l2, l3] = await ethers.getSigners();

      await taskManager.connect(verifier).markTaskCompleted(taskId, l1.address);
      await taskManager.connect(verifier).markTaskCompleted(taskId, l2.address);
      await taskManager.connect(verifier).markTaskCompleted(taskId, l3.address);

      const task = await taskManager.getTask(taskId);
      expect(task.currentCompletions).to.equal(3);
    });
  });

  describe("View Functions", function () {
    it("Should return total tasks", async function () {
      expect(await taskManager.getTotalTasks()).to.equal(0);

      const expiresAt = (await time.latest()) + 86400 * 30;
      await taskManager.connect(creator).createTask(
        "ipfs://test1",
        0,
        1,
        verifier.address,
        ethers.parseEther("100"),
        50,
        expiresAt
      );

      expect(await taskManager.getTotalTasks()).to.equal(1);
    });

    it("Should return tasks by creator", async function () {
      const expiresAt = (await time.latest()) + 86400 * 30;

      await taskManager.connect(creator).createTask(
        "ipfs://test1",
        0,
        1,
        verifier.address,
        ethers.parseEther("100"),
        50,
        expiresAt
      );

      await taskManager.connect(creator).createTask(
        "ipfs://test2",
        0,
        2,
        verifier.address,
        ethers.parseEther("200"),
        30,
        expiresAt
      );

      const tasks = await taskManager.getTasksByCreator(creator.address);
      expect(tasks.length).to.equal(2);
    });
  });
});

