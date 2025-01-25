const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CredentialSBT", function () {
  let credentialSBT;
  let owner, minter, learner;

  beforeEach(async function () {
    [owner, minter, learner] = await ethers.getSigners();

    const CredentialSBT = await ethers.getContractFactory("CredentialSBT");
    credentialSBT = await CredentialSBT.deploy(
      "LearnChain Credentials",
      "LEARNCRED",
      "https://api.learnchain.io/credentials/"
    );
    await credentialSBT.waitForDeployment();

    await credentialSBT.grantMinterRole(minter.address);
  });

  describe("Credential Minting", function () {
    it("Should mint credential with valid parameters", async function () {
      const taskId = 1;
      const metadataURI = "ipfs://QmCredential123";

      await expect(
        credentialSBT.connect(minter).mintCredential(learner.address, taskId, metadataURI)
      )
        .to.emit(credentialSBT, "CredentialMinted")
        .withArgs(0, learner.address, taskId, metadataURI);

      const credential = await credentialSBT.getCredential(0);
      expect(credential.learner).to.equal(learner.address);
      expect(credential.taskId).to.equal(taskId);
      expect(credential.metadataURI).to.equal(metadataURI);
    });

    it("Should prevent minting duplicate credentials for same task", async function () {
      const taskId = 1;
      const metadataURI = "ipfs://QmCredential123";

      await credentialSBT.connect(minter).mintCredential(learner.address, taskId, metadataURI);

      await expect(
        credentialSBT.connect(minter).mintCredential(learner.address, taskId, metadataURI)
      ).to.be.revertedWith("Credential already minted for this task");
    });

    it("Should fail without minter role", async function () {
      await expect(
        credentialSBT.connect(learner).mintCredential(learner.address, 1, "ipfs://test")
      ).to.be.reverted;
    });

    it("Should track credentials by learner", async function () {
      await credentialSBT.connect(minter).mintCredential(learner.address, 1, "ipfs://test1");
      await credentialSBT.connect(minter).mintCredential(learner.address, 2, "ipfs://test2");
      await credentialSBT.connect(minter).mintCredential(learner.address, 3, "ipfs://test3");

      const credentials = await credentialSBT.getCredentialsByLearner(learner.address);
      expect(credentials.length).to.equal(3);
    });
  });

  describe("Credential Revocation", function () {
    let tokenId;

    beforeEach(async function () {
      await credentialSBT.connect(minter).mintCredential(learner.address, 1, "ipfs://test");
      tokenId = 0;
    });

    it("Should allow admin to revoke credential", async function () {
      const reason = "Fraudulent completion";

      await expect(credentialSBT.revokeCredential(tokenId, reason))
        .to.emit(credentialSBT, "CredentialRevoked")
        .withArgs(tokenId, learner.address, reason);

      const credential = await credentialSBT.getCredential(tokenId);
      expect(credential.revoked).to.be.true;
    });

    it("Should prevent double revocation", async function () {
      await credentialSBT.revokeCredential(tokenId, "Test");

      await expect(
        credentialSBT.revokeCredential(tokenId, "Test again")
      ).to.be.revertedWith("Credential already revoked");
    });

    it("Should fail without admin role", async function () {
      await expect(
        credentialSBT.connect(learner).revokeCredential(tokenId, "Test")
      ).to.be.reverted;
    });
  });

  describe("Soul-Bound Properties", function () {
    beforeEach(async function () {
      await credentialSBT.connect(minter).mintCredential(learner.address, 1, "ipfs://test");
    });

    it("Should prevent transfers", async function () {
      const [, , , newOwner] = await ethers.getSigners();

      await expect(
        credentialSBT.transferFrom(learner.address, newOwner.address, 0)
      ).to.be.revertedWith("Soul-Bound: Transfer not allowed");

      await expect(
        credentialSBT.safeTransferFrom(learner.address, newOwner.address, 0)
      ).to.be.revertedWith("Soul-Bound: Transfer not allowed");
    });
  });

  describe("View Functions", function () {
    it("Should return correct token URI", async function () {
      const metadataURI = "ipfs://QmCustomMetadata";
      await credentialSBT.connect(minter).mintCredential(learner.address, 1, metadataURI);

      const tokenURI = await credentialSBT.tokenURI(0);
      expect(tokenURI).to.equal(metadataURI);
    });

    it("Should validate credential existence", async function () {
      await credentialSBT.connect(minter).mintCredential(learner.address, 1, "ipfs://test");

      expect(await credentialSBT.isValidCredential(0)).to.be.true;
      expect(await credentialSBT.isValidCredential(999)).to.be.false;
    });

    it("Should return total supply", async function () {
      expect(await credentialSBT.totalSupply()).to.equal(0);

      await credentialSBT.connect(minter).mintCredential(learner.address, 1, "ipfs://test1");
      await credentialSBT.connect(minter).mintCredential(learner.address, 2, "ipfs://test2");

      expect(await credentialSBT.totalSupply()).to.equal(2);
    });

    it("Should check if credential exists for task", async function () {
      const taskId = 1;
      
      expect(await credentialSBT.hasCredential(taskId, learner.address)).to.be.false;

      await credentialSBT.connect(minter).mintCredential(learner.address, taskId, "ipfs://test");

      expect(await credentialSBT.hasCredential(taskId, learner.address)).to.be.true;
    });
  });
});

