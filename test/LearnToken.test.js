const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LearnToken", function () {
  let learnToken;
  let owner, minter, user;

  beforeEach(async function () {
    [owner, minter, user] = await ethers.getSigners();

    const LearnToken = await ethers.getContractFactory("LearnToken");
    learnToken = await LearnToken.deploy(ethers.parseEther("100000000"));
    await learnToken.waitForDeployment();

    await learnToken.grantRole(await learnToken.MINTER_ROLE(), minter.address);
  });

  describe("Deployment", function () {
    it("Should set the right initial supply", async function () {
      const totalSupply = await learnToken.totalSupply();
      expect(totalSupply).to.equal(ethers.parseEther("100000000"));
    });

    it("Should assign initial supply to owner", async function () {
      const ownerBalance = await learnToken.balanceOf(owner.address);
      expect(ownerBalance).to.equal(ethers.parseEther("100000000"));
    });

    it("Should have correct name and symbol", async function () {
      expect(await learnToken.name()).to.equal("LearnChain Token");
      expect(await learnToken.symbol()).to.equal("LEARN");
    });

    it("Should have 18 decimals", async function () {
      expect(await learnToken.decimals()).to.equal(18);
    });
  });

  describe("Minting", function () {
    it("Should allow minter to mint tokens", async function () {
      const mintAmount = ethers.parseEther("1000");

      await learnToken.connect(minter).mint(user.address, mintAmount);

      expect(await learnToken.balanceOf(user.address)).to.equal(mintAmount);
    });

    it("Should fail when non-minter tries to mint", async function () {
      const mintAmount = ethers.parseEther("1000");

      await expect(
        learnToken.connect(user).mint(user.address, mintAmount)
      ).to.be.reverted;
    });

    it("Should not exceed max supply", async function () {
      const maxSupply = await learnToken.MAX_SUPPLY();
      const currentSupply = await learnToken.totalSupply();
      const remainingSupply = maxSupply - currentSupply;

      await expect(
        learnToken.connect(minter).mint(user.address, remainingSupply + 1n)
      ).to.be.revertedWith("Exceeds max supply");
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      await learnToken.transfer(user.address, ethers.parseEther("1000"));
    });

    it("Should allow users to burn their own tokens", async function () {
      const burnAmount = ethers.parseEther("100");
      const initialBalance = await learnToken.balanceOf(user.address);

      await learnToken.connect(user).burn(burnAmount);

      expect(await learnToken.balanceOf(user.address)).to.equal(
        initialBalance - burnAmount
      );
    });

    it("Should decrease total supply when burning", async function () {
      const burnAmount = ethers.parseEther("100");
      const initialSupply = await learnToken.totalSupply();

      await learnToken.connect(user).burn(burnAmount);

      expect(await learnToken.totalSupply()).to.equal(initialSupply - burnAmount);
    });
  });

  describe("Transfers", function () {
    it("Should transfer tokens between accounts", async function () {
      const transferAmount = ethers.parseEther("100");

      await learnToken.transfer(user.address, transferAmount);

      expect(await learnToken.balanceOf(user.address)).to.equal(transferAmount);
    });

    it("Should fail when transferring more than balance", async function () {
      const userBalance = await learnToken.balanceOf(user.address);

      await expect(
        learnToken.connect(user).transfer(owner.address, userBalance + 1n)
      ).to.be.reverted;
    });
  });

  describe("Allowances", function () {
    it("Should approve and transferFrom", async function () {
      const approveAmount = ethers.parseEther("100");

      await learnToken.approve(user.address, approveAmount);

      expect(await learnToken.allowance(owner.address, user.address)).to.equal(
        approveAmount
      );

      await learnToken.connect(user).transferFrom(
        owner.address,
        user.address,
        approveAmount
      );

      expect(await learnToken.balanceOf(user.address)).to.equal(approveAmount);
    });
  });
});

