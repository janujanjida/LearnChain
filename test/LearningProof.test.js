const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("LearningProof", function () {
  let taskManager, learningProof;
  let owner, creator, learner, verifier;

  beforeEach(async function () {
    [owner, creator, learner, verifier] = await ethers.getSigners();

    const TaskManager = await ethers.getContractFactory("TaskManager");
    taskManager = await TaskManager.deploy();
    await taskManager.waitForDeployment();

    const LearningProof = await ethers.getContractFactory("LearningProof");
    learningProof = await LearningProof.deploy(await taskManager.getAddress());
    await learningProof.waitForDeployment();

    await taskManager.grantTaskCreatorRole(creator.address);
    await taskManager.grantVerifierRole(await learningProof.getAddress());
    await learningProof.grantVerifierRole(verifier.address);
  });

  describe("Proof Submission", function () {
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

    it("Should allow learner to submit proof with valid signature", async function () {
      const proofHash = ethers.keccak256(ethers.toUtf8Bytes("proof_data"));
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
        taskId: taskId,
        learner: learner.address,
        proofHash: proofHash,
        nonce: nonce,
        deadline: deadline,
      };

      const signature = await learner.signTypedData(domain, types, value);

      await expect(
        learningProof.connect(learner).submitProof(taskId, proofHash, signature)
      )
        .to.emit(learningProof, "ProofSubmitted")
        .withArgs(taskId, learner.address, proofHash, await time.latest());
    });

    it("Should prevent duplicate proof submission", async function () {
      const proofHash = ethers.keccak256(ethers.toUtf8Bytes("proof_data"));
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
        taskId: taskId,
        learner: learner.address,
        proofHash: proofHash,
        nonce: nonce,
        deadline: deadline,
      };

      const signature = await learner.signTypedData(domain, types, value);
      await learningProof.connect(learner).submitProof(taskId, proofHash, signature);

      const nonce2 = await learningProof.getNonce(learner.address);
      const value2 = { ...value, nonce: nonce2 };
      const signature2 = await learner.signTypedData(domain, types, value2);

      await expect(
        learningProof.connect(learner).submitProof(taskId, proofHash, signature2)
      ).to.be.revertedWith("Proof already submitted");
    });
  });

  describe("Proof Verification", function () {
    let taskId;
    const proofHash = ethers.keccak256(ethers.toUtf8Bytes("proof_data"));

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
        taskId: taskId,
        learner: learner.address,
        proofHash: proofHash,
        nonce: nonce,
        deadline: deadline,
      };

      const signature = await learner.signTypedData(domain, types, value);
      await learningProof.connect(learner).submitProof(taskId, proofHash, signature);
    });

    it("Should allow verifier to approve proof", async function () {
      await expect(
        learningProof.connect(verifier).verifyProof(taskId, learner.address, true, "")
      )
        .to.emit(learningProof, "ProofVerified")
        .withArgs(taskId, learner.address, verifier.address, await time.latest());

      expect(await learningProof.isProofVerified(taskId, learner.address)).to.be.true;
    });

    it("Should allow verifier to reject proof", async function () {
      const reason = "Invalid proof data";

      await expect(
        learningProof.connect(verifier).verifyProof(taskId, learner.address, false, reason)
      )
        .to.emit(learningProof, "ProofRejected")
        .withArgs(taskId, learner.address, verifier.address, reason);

      expect(await learningProof.isProofVerified(taskId, learner.address)).to.be.false;
    });

    it("Should prevent non-verifier from verifying", async function () {
      await expect(
        learningProof.connect(learner).verifyProof(taskId, learner.address, true, "")
      ).to.be.reverted;
    });
  });

  describe("View Functions", function () {
    it("Should return domain separator", async function () {
      const domainSeparator = await learningProof.getDomainSeparator();
      expect(domainSeparator).to.not.equal(ethers.ZeroHash);
    });

    it("Should track nonce correctly", async function () {
      const initialNonce = await learningProof.getNonce(learner.address);
      expect(initialNonce).to.equal(0);
    });
  });
});

