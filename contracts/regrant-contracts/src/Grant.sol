// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24; // Ensure this matches your foundry.toml

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AccessControlEnumerable} from "@openzeppelin/contracts/access/extensions/AccessControlEnumerable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {ReGrantStructs} from "./lib/ReGrantStructs.sol";
import {IGrant} from "./interfaces/IGrant.sol";
import {ReGrantAddresses} from "./lib/ReGrantAddresses.sol"; // For IDRX address

/**
 * @title Grant
 * @author Re.Grant Team
 * @notice Manages the lifecycle of a single research grant, including funding,
 * milestone tracking, and IDRX disbursements.
 * Implements IGrant for external interaction and AccessControlEnumerable for role-based permissions.
 * This contract is intended to be deployed by the GrantFactory.
 */
contract Grant is IGrant, AccessControlEnumerable, ReentrancyGuard {
    using SafeERC20 for IERC20; // Use SafeERC20 for all IERC20 operations

    // --- Roles ---
    // DEFAULT_ADMIN_ROLE is inherited from AccessControl and can manage other roles.
    bytes32 public constant GRANTOR_ROLE = keccak256("GRANTOR_ROLE");
    bytes32 public constant BENEFICIARY_ROLE = keccak256("BENEFICIARY_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant PLATFORM_ADMIN_ROLE = keccak256("PLATFORM_ADMIN_ROLE");

    // --- State Variables ---
    address private immutable _grantor;
    address private immutable _beneficiary;
    IERC20 private immutable _idrxToken;

    string private _proposalIpfsHash;
    uint256 private _totalFundingRequested;
    uint256 private _totalFundingDeposited;
    uint256 private _totalFundingPaidOut;

    ReGrantStructs.GrantStatus private _status;
    ReGrantStructs.Milestone[] private _milestones;

    // --- Modifiers ---

    /**
     * @dev Throws if called by any account other than an account with the given role.
     * Overridden from AccessControl to use _msgSender() for broader compatibility (e.g. meta-transactions).
     */
    // modifier onlyRole(bytes32 role) override {
    //     _checkRole(role, _msgSender());
    //     _;
    // }

    modifier onlyBeneficiary() {
        _checkRole(BENEFICIARY_ROLE, _msgSender());
        _;
    }

    modifier onlyMilestoneVerifier(uint256 milestoneIndex) {
        require(milestoneIndex < _milestones.length, "Grant: Milestone index out of bounds");
        address verifier = _milestones[milestoneIndex].verifier;
        require(verifier != address(0), "Grant: Milestone verifier not set");
        require(hasRole(VERIFIER_ROLE, _msgSender()) && _msgSender() == verifier,
            "Grant: Caller is not the designated verifier for this milestone");
        _;
    }
    
    modifier onlyGrantorOrPlatformAdmin() {
        require(
            hasRole(GRANTOR_ROLE, _msgSender()) || hasRole(PLATFORM_ADMIN_ROLE, _msgSender()),
            "Grant: Caller is not grantor or platform admin"
        );
        _;
    }


    // --- Constructor ---
    /**
     * @notice Initializes the Grant contract.
     * @param initialGrantor The address of the entity proposing/funding the grant.
     * @param initialBeneficiary The address of the researcher/entity receiving the funds.
     * @param idrxTokenAddress The address of the IDRX ERC20 token contract.
     * @param totalFundingRequested_ The total amount of IDRX requested for the grant.
     * @param proposalIpfsHash_ A CID (string) pointing to the detailed grant proposal on IPFS.
     * @param initialAdmin The address that will receive DEFAULT_ADMIN_ROLE and PLATFORM_ADMIN_ROLE for this grant.
     * Typically, this would be the GrantFactory contract or a designated platform admin wallet.
     */
    constructor(
        address initialGrantor,
        address initialBeneficiary,
        address idrxTokenAddress,
        uint256 totalFundingRequested_,
        string memory proposalIpfsHash_,
        address initialAdmin
    ) {
        require(initialGrantor != address(0), "Grant: Grantor cannot be zero address");
        require(initialBeneficiary != address(0), "Grant: Beneficiary cannot be zero address");
        require(idrxTokenAddress != address(0), "Grant: IDRX token cannot be zero address");
        require(totalFundingRequested_ > 0, "Grant: Total funding must be greater than zero");
        require(initialAdmin != address(0), "Grant: Initial admin cannot be zero address");

        _grantor = initialGrantor;
        _beneficiary = initialBeneficiary;
        _idrxToken = IERC20(idrxTokenAddress);
        _totalFundingRequested = totalFundingRequested_;
        _proposalIpfsHash = proposalIpfsHash_;
        _status = ReGrantStructs.GrantStatus.PendingApproval; // Initial status, awaiting off-chain logic / factory signal

        // Setup roles. The 'initialAdmin' (e.g., GrantFactory) gets DEFAULT_ADMIN_ROLE and PLATFORM_ADMIN_ROLE.
        _grantRole(DEFAULT_ADMIN_ROLE, initialAdmin);
        _grantRole(PLATFORM_ADMIN_ROLE, initialAdmin);

        // Grant specific roles. These can also be managed/granted by an account with DEFAULT_ADMIN_ROLE.
        _grantRole(GRANTOR_ROLE, initialGrantor);
        _grantRole(BENEFICIARY_ROLE, initialBeneficiary);
        // VERIFIER_ROLE is assigned per milestone.

        // Set admin roles for more fine-grained control if needed (optional)
        // Example: PLATFORM_ADMIN_ROLE can manage GRANTOR_ROLE
        // _setRoleAdmin(GRANTOR_ROLE, PLATFORM_ADMIN_ROLE);
        // _setRoleAdmin(BENEFICIARY_ROLE, PLATFORM_ADMIN_ROLE);
        // _setRoleAdmin(VERIFIER_ROLE, PLATFORM_ADMIN_ROLE);

        emit GrantStatusUpdated(_status, msg.sender); // msg.sender here is the factory or deployer
    }

    // --- External Functions: Grant Lifecycle & Funding ---

    /**
     * @notice Allows an approved funder (typically the grantor) to deposit IDRX into the grant contract.
     * The caller must have approved the Grant contract to spend `amount` of their IDRX tokens beforehand.
     * @param amount The amount of IDRX tokens to deposit.
     */
    function fundGrant(uint256 amount) external override nonReentrant onlyRole(GRANTOR_ROLE) {
        require(_status == ReGrantStructs.GrantStatus.Fundraising, "Grant: Not in fundraising state");
        require(amount > 0, "Grant: Amount must be positive");
        require(_totalFundingDeposited + amount <= _totalFundingRequested, "Grant: Deposit exceeds requested amount");

        _totalFundingDeposited += amount;
        _idrxToken.safeTransferFrom(_msgSender(), address(this), amount);

        emit GrantFunded(_msgSender(), amount);

        if (_totalFundingDeposited >= _totalFundingRequested) {
            _status = ReGrantStructs.GrantStatus.Active;
            emit GrantStatusUpdated(_status, _msgSender());
        }
    }

    /**
     * @notice Updates the grant status. Restricted to Grantor or Platform Admin.
     * @param newStatus The new status to set for the grant.
     */
    function updateGrantStatus(ReGrantStructs.GrantStatus newStatus)
        external
        override
        onlyGrantorOrPlatformAdmin
    {
        // Add more sophisticated status transition logic here if needed.
        // For example, ensure grant is funded before moving to MilestonesInProgress.
        if (newStatus == ReGrantStructs.GrantStatus.Active && _totalFundingDeposited < _totalFundingRequested) {
            revert("Grant: Cannot set to Active, not fully funded");
        }
        if (newStatus == ReGrantStructs.GrantStatus.MilestonesInProgress && _status != ReGrantStructs.GrantStatus.Active) {
            // Typically this transition happens automatically upon first milestone payment.
            // Manual override might be for specific scenarios.
        }
        if (newStatus == ReGrantStructs.GrantStatus.Completed) {
            bool allMilestonesPaid = true;
            if (_milestones.length == 0) allMilestonesPaid = false; // Cannot be completed without milestones
            for (uint i = 0; i < _milestones.length; i++) {
                if (_milestones[i].status != ReGrantStructs.MilestoneStatus.Paid) {
                    allMilestonesPaid = false;
                    break;
                }
            }
            require(allMilestonesPaid, "Grant: Not all milestones are paid");
        }

        _status = newStatus;
        emit GrantStatusUpdated(newStatus, _msgSender());
    }

    /**
     * @notice Allows the grantor to withdraw unspent funds if the grant is Cancelled
     * or if it's Completed and there's a surplus (unlikely if milestones sum correctly).
     * @param recipient The address to send the withdrawn funds to.
     * @param amount The amount of IDRX to withdraw.
     */
    function withdrawGrantorFunds(address payable recipient, uint256 amount)
        external
        override
        onlyRole(GRANTOR_ROLE)
        nonReentrant
    {
        require(recipient == _grantor, "Grant: Can only withdraw to grantor");
        require(
            _status == ReGrantStructs.GrantStatus.Cancelled || _status == ReGrantStructs.GrantStatus.Completed,
            "Grant: Not in a withdrawable state"
        );
        require(amount > 0, "Grant: Amount must be positive");
        
        uint256 spendableBalance = _totalFundingDeposited - _totalFundingPaidOut;
        require(amount <= spendableBalance, "Grant: Amount exceeds unspent funds");

        _totalFundingDeposited -= amount; // Effectively reducing the escrowed amount
        
        _idrxToken.safeTransfer(recipient, amount);
        emit FundsWithdrawn(recipient, amount);
    }

    // --- External Functions: Milestone Management ---

    /**
     * @notice Adds a new milestone to the grant. Only callable by the grantor or platform admin.
     * @param descriptionIpfsHash CID of the milestone's detailed description and criteria.
     * @param amountAllocated Amount of IDRX for this milestone.
     * @param verifierAddress Address responsible for verifying this milestone. Can be the grantor.
     * @return milestoneIndex The index of the newly added milestone.
     */
    function addMilestone(
        string calldata descriptionIpfsHash,
        uint256 amountAllocated,
        address verifierAddress
    ) external override onlyGrantorOrPlatformAdmin returns (uint256) {
        require(
            _status == ReGrantStructs.GrantStatus.PendingApproval || _status == ReGrantStructs.GrantStatus.Fundraising || _status == ReGrantStructs.GrantStatus.Active,
            "Grant: Cannot add milestones in current state"
        );
        require(bytes(descriptionIpfsHash).length > 0, "Grant: Description IPFS hash is required");
        require(amountAllocated > 0, "Grant: Milestone amount must be positive");
        require(verifierAddress != address(0), "Grant: Verifier address cannot be zero");

        // Check if total allocated to milestones exceeds total grant funding
        uint256 currentMilestonesTotal = _totalFundingPaidOut; // Start with already paid out
        for (uint i = 0; i < _milestones.length; i++) {
            if (_milestones[i].status != ReGrantStructs.MilestoneStatus.Paid) {
                 currentMilestonesTotal += _milestones[i].amountAllocated;
            }
        }
        require(currentMilestonesTotal + amountAllocated <= _totalFundingRequested, "Grant: Milestone amounts exceed total funding");

        _milestones.push(
            ReGrantStructs.Milestone({
                descriptionIpfsHash: descriptionIpfsHash,
                amountAllocated: amountAllocated,
                verifier: verifierAddress,
                status: ReGrantStructs.MilestoneStatus.Pending,
                proofOfCompletionIpfsHash: "",
                approvalTimestamp: 0,
                paymentTimestamp: 0,
                rejectionFeedbackIpfsHash: ""
            })
        );
        
        // Grant VERIFIER_ROLE to the specified verifier if they don't have it already for this grant.
        if (!hasRole(VERIFIER_ROLE, verifierAddress)) {
            _grantRole(VERIFIER_ROLE, verifierAddress);
        }

        uint256 newMilestoneIndex = _milestones.length - 1;
        emit MilestoneAdded(newMilestoneIndex, amountAllocated, descriptionIpfsHash, verifierAddress);
        return newMilestoneIndex;
    }

    /**
     * @notice Allows the beneficiary to submit proof of completion for a milestone.
     * @param milestoneIndex The index of the milestone.
     * @param proofOfCompletionIpfsHash CID of the proof document/data.
     */
    function submitMilestoneProof(uint256 milestoneIndex, string calldata proofOfCompletionIpfsHash)
        external
        override
        onlyBeneficiary
    {
        require(milestoneIndex < _milestones.length, "Grant: Milestone index out of bounds");
        require(
            _status == ReGrantStructs.GrantStatus.Active || _status == ReGrantStructs.GrantStatus.MilestonesInProgress,
            "Grant: Not in active state to submit proof"
        );
        ReGrantStructs.Milestone storage milestone = _milestones[milestoneIndex];
        require(
            milestone.status == ReGrantStructs.MilestoneStatus.Pending || milestone.status == ReGrantStructs.MilestoneStatus.Rejected,
            "Grant: Milestone not pending or rejected"
        );
        require(bytes(proofOfCompletionIpfsHash).length > 0, "Grant: Proof IPFS hash required");

        milestone.proofOfCompletionIpfsHash = proofOfCompletionIpfsHash;
        milestone.status = ReGrantStructs.MilestoneStatus.SubmittedForApproval;
        
        emit MilestoneProofSubmitted(milestoneIndex, proofOfCompletionIpfsHash, _msgSender());
        emit MilestoneStatusUpdated(milestoneIndex, milestone.status, _msgSender());
    }

    /**
     * @notice Allows the designated verifier for the milestone to approve it.
     * @param milestoneIndex The index of the milestone.
     */
    function approveMilestone(uint256 milestoneIndex) external override onlyMilestoneVerifier(milestoneIndex) {
        ReGrantStructs.Milestone storage milestone = _milestones[milestoneIndex];
        require(milestone.status == ReGrantStructs.MilestoneStatus.SubmittedForApproval, "Grant: Milestone not submitted for approval");
        
        milestone.status = ReGrantStructs.MilestoneStatus.Approved;
        milestone.approvalTimestamp = block.timestamp;

        emit MilestoneStatusUpdated(milestoneIndex, milestone.status, _msgSender());
    }

    /**
     * @notice Allows the designated verifier for the milestone to reject it.
     * @param milestoneIndex The index of the milestone.
     * @param feedbackIpfsHash CID for feedback on why the milestone was rejected.
     */
    function rejectMilestone(uint256 milestoneIndex, string calldata feedbackIpfsHash)
        external
        override
        onlyMilestoneVerifier(milestoneIndex)
    {
        ReGrantStructs.Milestone storage milestone = _milestones[milestoneIndex];
        require(milestone.status == ReGrantStructs.MilestoneStatus.SubmittedForApproval, "Grant: Milestone not submitted for approval");
        require(bytes(feedbackIpfsHash).length > 0, "Grant: Rejection feedback IPFS hash required");

        milestone.status = ReGrantStructs.MilestoneStatus.Rejected;
        milestone.rejectionFeedbackIpfsHash = feedbackIpfsHash;
        
        emit MilestoneStatusUpdated(milestoneIndex, milestone.status, _msgSender());
    }

    /**
     * @notice Releases payment for an approved milestone to the beneficiary.
     * Can be called by anyone once a milestone is approved, promoting automation.
     * @param milestoneIndex The index of the milestone.
     */
    function releaseMilestonePayment(uint256 milestoneIndex)
        external
        override
        nonReentrant // Important for fund transfers
    {
        require(milestoneIndex < _milestones.length, "Grant: Milestone index out of bounds");
        require(
            _status == ReGrantStructs.GrantStatus.Active || _status == ReGrantStructs.GrantStatus.MilestonesInProgress,
            "Grant: Not active or in progress"
        );
        
        ReGrantStructs.Milestone storage milestone = _milestones[milestoneIndex];
        require(milestone.status == ReGrantStructs.MilestoneStatus.Approved, "Grant: Milestone not approved");
        // require(!milestone.isPaid, "Grant: Milestone already paid"); // Covered by status check

        uint256 amountToPay = milestone.amountAllocated;
        require(_idrxToken.balanceOf(address(this)) >= amountToPay, "Grant: Insufficient contract balance for payout");

        milestone.status = ReGrantStructs.MilestoneStatus.Paid;
        milestone.paymentTimestamp = block.timestamp;

        _idrxToken.safeTransfer(_beneficiary, amountToPay);

        emit MilestonePaymentReleased(milestoneIndex, amountToPay, _beneficiary);
        emit MilestoneStatusUpdated(milestoneIndex, milestone.status, _msgSender());

        // Update overall grant status
        if (_status == ReGrantStructs.GrantStatus.Active) {
            _status = ReGrantStructs.GrantStatus.MilestonesInProgress;
            emit GrantStatusUpdated(_status, address(this)); // Contract as actor
        }

        bool allMilestonesPaid = true;
        for (uint i = 0; i < _milestones.length; i++) {
            if (_milestones[i].status != ReGrantStructs.MilestoneStatus.Paid) {
                allMilestonesPaid = false;
                break;
            }
        }
        if (allMilestonesPaid) {
            _status = ReGrantStructs.GrantStatus.Completed;
            emit GrantStatusUpdated(_status, address(this)); // Contract as actor
        }
    }

    // --- View Functions (Implement IGrant interface) ---

    function getGrantor() external view override returns (address) { return _grantor; }
    function getBeneficiary() external view override returns (address) { return _beneficiary; }
    function getIdrxToken() external view override returns (address) { return address(_idrxToken); }
    function getTotalFundingRequested() external view override returns (uint256) { return _totalFundingRequested; }
    function getTotalFundingDeposited() external view override returns (uint256) { return _totalFundingDeposited; }
    function getTotalFundingPaidOut() external view override returns (uint256) { return _totalFundingPaidOut; }
    function getProposalIpfsHash() external view override returns (string memory) { return _proposalIpfsHash; }
    function getCurrentStatus() external view override returns (ReGrantStructs.GrantStatus) { return _status; }
    function getMilestoneCount() external view override returns (uint256) { return _milestones.length; }
    
    function getMilestone(uint256 milestoneIndex)
        external
        view
        override
        returns (ReGrantStructs.Milestone memory)
    {
        require(milestoneIndex < _milestones.length, "Grant: Milestone index out of bounds");
        return _milestones[milestoneIndex];
    }

    function getAllMilestones() external view override returns (ReGrantStructs.Milestone[] memory) {
        return _milestones;
    }
    
    // --- AccessControl Overrides (Required for Enumerable) ---
    function supportsInterface(bytes4 interfaceId) public view virtual override(AccessControlEnumerable) returns (bool) {
        return 
            AccessControlEnumerable.supportsInterface(interfaceId) || 
            super.supportsInterface(interfaceId); // For ERC165
    }
}