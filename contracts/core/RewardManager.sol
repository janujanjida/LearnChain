// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/IRewardManager.sol";
import "../interfaces/ITaskManager.sol";
import "../libraries/RewardCalculator.sol";

/**
 * @title RewardManager
 * @notice Manages reward distribution for completed learning tasks
 * @dev Handles both ERC20 token and NFT rewards with configurable multipliers
 */
contract RewardManager is IRewardManager, AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using RewardCalculator for uint256;

    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");

    IERC20 public rewardToken;
    ITaskManager public taskManager;

    RewardConfig private _rewardConfig;

    mapping(address => uint256) private _pendingRewards;
    mapping(address => RewardRecord[]) private _rewardHistory;
    mapping(uint256 => mapping(address => bool)) private _rewardDistributed;

    /**
     * @dev Constructor initializes reward system
     * @param rewardTokenAddress Address of the ERC20 reward token
     * @param taskManagerAddress Address of the TaskManager contract
     */
    constructor(address rewardTokenAddress, address taskManagerAddress) {
        require(rewardTokenAddress != address(0), "Invalid reward token address");
        require(taskManagerAddress != address(0), "Invalid TaskManager address");

        rewardToken = IERC20(rewardTokenAddress);
        taskManager = ITaskManager(taskManagerAddress);

        _rewardConfig = RewardConfig({
            baseAmount: 100 * 10 ** 18, // 100 tokens
            beginnerMultiplier: RewardCalculator.DEFAULT_BEGINNER_MULTIPLIER,
            intermediateMultiplier: RewardCalculator.DEFAULT_INTERMEDIATE_MULTIPLIER,
            advancedMultiplier: RewardCalculator.DEFAULT_ADVANCED_MULTIPLIER,
            expertMultiplier: RewardCalculator.DEFAULT_EXPERT_MULTIPLIER,
            enabled: true
        });

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(DISTRIBUTOR_ROLE, msg.sender);
    }

    /**
     * @inheritdoc IRewardManager
     */
    function distributeReward(
        uint256 taskId,
        address learner,
        ITaskManager.Difficulty difficulty,
        ITaskManager.RewardType rewardType
    ) external override onlyRole(DISTRIBUTOR_ROLE) nonReentrant {
        require(_rewardConfig.enabled, "Rewards disabled");
        require(learner != address(0), "Invalid learner address");
        require(!_rewardDistributed[taskId][learner], "Reward already distributed");

        ITaskManager.Task memory task = taskManager.getTask(taskId);
        require(taskManager.hasCompleted(taskId, learner), "Task not completed");

        uint256 rewardAmount = calculateReward(difficulty);

        _rewardDistributed[taskId][learner] = true;
        _pendingRewards[learner] += rewardAmount;

        _rewardHistory[learner].push(
            RewardRecord({
                taskId: taskId,
                learner: learner,
                amount: rewardAmount,
                rewardType: rewardType,
                claimedAt: 0,
                claimed: false
            })
        );

        emit RewardDistributed(taskId, learner, rewardAmount, rewardType);
    }

    /**
     * @inheritdoc IRewardManager
     */
    function claimRewards() external override nonReentrant {
        uint256 pending = _pendingRewards[msg.sender];
        require(pending > 0, "No pending rewards");
        require(rewardToken.balanceOf(address(this)) >= pending, "Insufficient reward balance");

        _pendingRewards[msg.sender] = 0;

        for (uint256 i = 0; i < _rewardHistory[msg.sender].length; i++) {
            if (!_rewardHistory[msg.sender][i].claimed) {
                _rewardHistory[msg.sender][i].claimed = true;
                _rewardHistory[msg.sender][i].claimedAt = block.timestamp;
            }
        }

        rewardToken.safeTransfer(msg.sender, pending);

        emit RewardClaimed(msg.sender, pending, block.timestamp);
    }

    /**
     * @inheritdoc IRewardManager
     */
    function calculateReward(
        ITaskManager.Difficulty difficulty
    ) public view override returns (uint256) {
        uint256[4] memory multipliers = [
            _rewardConfig.beginnerMultiplier,
            _rewardConfig.intermediateMultiplier,
            _rewardConfig.advancedMultiplier,
            _rewardConfig.expertMultiplier
        ];

        return RewardCalculator.calculateReward(
            _rewardConfig.baseAmount,
            difficulty,
            multipliers
        );
    }

    /**
     * @inheritdoc IRewardManager
     */
    function getPendingRewards(address learner) external view override returns (uint256) {
        return _pendingRewards[learner];
    }

    /**
     * @inheritdoc IRewardManager
     */
    function getRewardHistory(
        address learner
    ) external view override returns (RewardRecord[] memory) {
        return _rewardHistory[learner];
    }

    /**
     * @inheritdoc IRewardManager
     */
    function updateRewardConfig(
        uint256 baseAmount,
        uint256 beginnerMultiplier,
        uint256 intermediateMultiplier,
        uint256 advancedMultiplier,
        uint256 expertMultiplier
    ) external override onlyRole(DEFAULT_ADMIN_ROLE) {
        require(baseAmount > 0, "Base amount must be positive");

        uint256[4] memory multipliers = [
            beginnerMultiplier,
            intermediateMultiplier,
            advancedMultiplier,
            expertMultiplier
        ];

        require(RewardCalculator.validateMultipliers(multipliers), "Invalid multipliers");

        _rewardConfig.baseAmount = baseAmount;
        _rewardConfig.beginnerMultiplier = beginnerMultiplier;
        _rewardConfig.intermediateMultiplier = intermediateMultiplier;
        _rewardConfig.advancedMultiplier = advancedMultiplier;
        _rewardConfig.expertMultiplier = expertMultiplier;

        emit RewardConfigUpdated(
            baseAmount,
            beginnerMultiplier,
            intermediateMultiplier,
            advancedMultiplier,
            expertMultiplier
        );
    }

    /**
     * @inheritdoc IRewardManager
     */
    function getRewardConfig() external view override returns (RewardConfig memory) {
        return _rewardConfig;
    }

    /**
     * @dev Enables or disables reward distribution
     * @param enabled Whether rewards are enabled
     */
    function setRewardsEnabled(bool enabled) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _rewardConfig.enabled = enabled;
    }

    /**
     * @dev Withdraws tokens from the contract (emergency only)
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(rewardToken.balanceOf(address(this)) >= amount, "Insufficient balance");
        rewardToken.safeTransfer(msg.sender, amount);
    }

    /**
     * @dev Grants distributor role to an address
     * @param account The address to grant the role
     */
    function grantDistributorRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(DISTRIBUTOR_ROLE, account);
    }
}

