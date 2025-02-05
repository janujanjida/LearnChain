const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("InstitutionRegistry", function () {
  let institutionRegistry;
  let owner, verifier, institution1, institution2;

  beforeEach(async function () {
    [owner, verifier, institution1, institution2] = await ethers.getSigners();

    const InstitutionRegistry = await ethers.getContractFactory("InstitutionRegistry");
    institutionRegistry = await InstitutionRegistry.deploy();
    await institutionRegistry.waitForDeployment();

    await institutionRegistry.grantVerifierRole(verifier.address);
  });

  describe("Institution Registration", function () {
    it("Should register institution with valid parameters", async function () {
      const name = "MIT OpenCourseWare";
      const metadataURI = "ipfs://QmInstitution123";

      await expect(
        institutionRegistry.connect(institution1).registerInstitution(name, metadataURI)
      )
        .to.emit(institutionRegistry, "InstitutionRegistered")
        .withArgs(institution1.address, name, await ethers.provider.getBlock('latest').then(b => b.timestamp));

      const inst = await institutionRegistry.getInstitution(institution1.address);
      expect(inst.name).to.equal(name);
      expect(inst.metadataURI).to.equal(metadataURI);
      expect(inst.status).to.equal(0); // PENDING
    });

    it("Should prevent duplicate registration", async function () {
      await institutionRegistry.connect(institution1).registerInstitution("MIT", "ipfs://test");

      await expect(
        institutionRegistry.connect(institution1).registerInstitution("MIT", "ipfs://test")
      ).to.be.revertedWith("Already registered");
    });

    it("Should fail with empty name", async function () {
      await expect(
        institutionRegistry.connect(institution1).registerInstitution("", "ipfs://test")
      ).to.be.revertedWith("Name required");
    });
  });

  describe("Institution Verification", function () {
    beforeEach(async function () {
      await institutionRegistry.connect(institution1).registerInstitution("MIT", "ipfs://test");
    });

    it("Should verify institution by verifier", async function () {
      await expect(
        institutionRegistry.connect(verifier).verifyInstitution(institution1.address)
      )
        .to.emit(institutionRegistry, "InstitutionVerified");

      expect(await institutionRegistry.isVerified(institution1.address)).to.be.true;
    });

    it("Should add to verified list", async function () {
      await institutionRegistry.connect(verifier).verifyInstitution(institution1.address);

      const verified = await institutionRegistry.getVerifiedInstitutions();
      expect(verified).to.include(institution1.address);
    });

    it("Should fail without verifier role", async function () {
      await expect(
        institutionRegistry.connect(institution2).verifyInstitution(institution1.address)
      ).to.be.reverted;
    });

    it("Should fail for non-registered institution", async function () {
      await expect(
        institutionRegistry.connect(verifier).verifyInstitution(institution2.address)
      ).to.be.revertedWith("Institution not registered");
    });
  });

  describe("Status Management", function () {
    beforeEach(async function () {
      await institutionRegistry.connect(institution1).registerInstitution("MIT", "ipfs://test");
      await institutionRegistry.connect(verifier).verifyInstitution(institution1.address);
    });

    it("Should update institution status", async function () {
      await expect(
        institutionRegistry.updateInstitutionStatus(institution1.address, 2) // SUSPENDED
      )
        .to.emit(institutionRegistry, "InstitutionStatusChanged")
        .withArgs(institution1.address, 1, 2);

      const inst = await institutionRegistry.getInstitution(institution1.address);
      expect(inst.status).to.equal(2);
    });

    it("Should remove from verified list when suspended", async function () {
      await institutionRegistry.updateInstitutionStatus(institution1.address, 2); // SUSPENDED

      expect(await institutionRegistry.isVerified(institution1.address)).to.be.false;
    });

    it("Should fail without admin role", async function () {
      await expect(
        institutionRegistry.connect(institution2).updateInstitutionStatus(institution1.address, 2)
      ).to.be.reverted;
    });
  });

  describe("Counters", function () {
    beforeEach(async function () {
      await institutionRegistry.connect(institution1).registerInstitution("MIT", "ipfs://test");
    });

    it("Should increment task count", async function () {
      await institutionRegistry.connect(verifier).incrementTaskCount(institution1.address);
      await institutionRegistry.connect(verifier).incrementTaskCount(institution1.address);

      const inst = await institutionRegistry.getInstitution(institution1.address);
      expect(inst.tasksCreated).to.equal(2);
    });

    it("Should increment credential count", async function () {
      await institutionRegistry.connect(verifier).incrementCredentialCount(institution1.address);
      await institutionRegistry.connect(verifier).incrementCredentialCount(institution1.address);
      await institutionRegistry.connect(verifier).incrementCredentialCount(institution1.address);

      const inst = await institutionRegistry.getInstitution(institution1.address);
      expect(inst.credentialsIssued).to.equal(3);
    });
  });

  describe("Metadata Update", function () {
    beforeEach(async function () {
      await institutionRegistry.connect(institution1).registerInstitution("MIT", "ipfs://test");
    });

    it("Should allow institution to update metadata", async function () {
      const newURI = "ipfs://QmNewMetadata";

      await institutionRegistry.connect(institution1).updateMetadataURI(newURI);

      const inst = await institutionRegistry.getInstitution(institution1.address);
      expect(inst.metadataURI).to.equal(newURI);
    });

    it("Should fail for non-registered institution", async function () {
      await expect(
        institutionRegistry.connect(institution2).updateMetadataURI("ipfs://test")
      ).to.be.revertedWith("Institution not registered");
    });
  });

  describe("View Functions", function () {
    it("Should return total institutions count", async function () {
      await institutionRegistry.connect(institution1).registerInstitution("MIT", "ipfs://test1");
      await institutionRegistry.connect(institution2).registerInstitution("Stanford", "ipfs://test2");

      expect(await institutionRegistry.getTotalInstitutions()).to.be.greaterThan(0);
    });

    it("Should return only verified institutions", async function () {
      await institutionRegistry.connect(institution1).registerInstitution("MIT", "ipfs://test1");
      await institutionRegistry.connect(institution2).registerInstitution("Stanford", "ipfs://test2");

      await institutionRegistry.connect(verifier).verifyInstitution(institution1.address);

      const verified = await institutionRegistry.getVerifiedInstitutions();
      expect(verified).to.include(institution1.address);
      expect(verified).to.not.include(institution2.address);
    });
  });
});

