// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24; // Match your foundry.toml

import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import {AccessControlEnumerable} from "openzeppelin-contracts/contracts/access/AccessControlEnumerable.sol";
import {ReentrancyGuard} from "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import {SafeERC20} from "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";

import {StructsAndEnums} from "./lib/StructsAndEnums.sol";
import {IGrant} from "./interfaces/IGrant.sol";

/**
 * @title Grant
 * @author Re.Grant Team
 * @notice Manages the lifecycle of a single research grant, including funding,
 * milestone tracking, and IDRX disbursements.
 * Implements IGrant for external interaction and AccessControlEnumerable for role-based permissions.
 */
contract Grant is IGrant, AccessControlEnumerable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // --- Roles ---
    bytes32 public constant GRANTOR_ROLE = keccak256("GRANTOR_ROLE");
    bytes32 public constant BENEFICIARY_ROLE = keccak256("BENEFICIARY_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant PLATFORM_ADMIN_ROLE = keccak256("PLATFORM_ADMIN_ROLE"); // For platform-level admin actions

    // --- State Variables ---
    address private immutable _grantor;
    address private immutable _beneficiary; // Researcher's wallet
    IERC20 private immutable _idrxToken;

    string private _proposalIpfsHash; // CID for off-chain detailed proposal
    uint256 private _totalFundingRequested;
    uint256 private _totalFundingDeposited;
    uint256 private _totalFundingPaidOut;

    StructsAndEnums.GrantStatus private _status;
    StructsAndEnums.Milestone[] private _milestones;

    // --- Modifiers ---
    modifier onlyGrantRole(bytes32 role) {
        _checkRole(role, _msgSender());
        _;
    }

    modifier onlyBeneficiary() {
        require(hasRole(BENEFICIARY_ROLE, _msgSender()), "Grant: Caller is not the beneficiary");
        _;
    }
    
    modifier onlyVerifierOrGrantor(uint256 milestoneIndex) {
        require(milestoneIndex < _milestones.length, "Grant: Milestone index out of bounds");
        address verifier = _milestones[milestoneIndex].verifier;
        require(
            hasRole(GRANTOR_ROLE, _msgSender()) || (verifier != address(0) && hasRole(VERIFIER_ROLE, _msgSender()) && _msgSender() == verifier), 
            "Grant: Caller is not authorized to verify/reject this milestone"
        );
        _;
    }

    // --- Constructor ---
    constructor(
        address initialGrantor,
        address initialBeneficiary,
        address idrxTokenAddress,
        uint256 totalFundingRequested_,
        string memory proposalIpfsHash_,
        address platformAdmin // Passed by GrantFactory
    ) {
        require(initialGrantor != address(0), "Grant: Grantor cannot be zero address");
        require(initialBeneficiary != address(0), "Grant: Beneficiary cannot be zero address");
        require(idrxTokenAddress != address(0), "Grant: IDRX token cannot be zero address");
        require(totalFundingRequested_ > 0, "Grant: Total funding must be greater than zero");
        
        _grantor = initialGrantor;
        _beneficiary = initialBeneficiary;
        _idrxToken = IERC20(idrxTokenAddress);
        _totalFundingRequested = totalFundingRequested_;
        _proposalIpfsHash = proposalIpfsHash_;
        _status = StructsAndEnums.GrantStatus.PendingApproval; // Initial status

        // Setup roles
        _grantRole(DEFAULT_ADMIN_ROLE, platformAdmin); // The factory (or a designated admin) sets up roles
        _grantRole(PLATFORM_ADMIN_ROLE, platformAdmin);
        _grantRole(GRANTOR_ROLE, initialGrantor);
        _grantRole(BENEFICIARY_ROLE, initialBeneficiary);
        // VERIFIER_ROLE can be assigned per milestone or to the grantor by default
        _setRoleAdmin(GRANTOR_ROLE, PLATFORM_ADMIN_ROLE);
        _setRoleAdmin(BENEFICIARY_ROLE, PLATFORM_ADMIN_ROLE);
        _setRoleAdmin(VERIFIER_ROLE, PLATFORM_ADMIN_ROLE);

        emit GrantStatusChanged(_status, msg.sender);
    }

    // --- External Functions: Grant Lifecycle & Funding ---

    /**
     * @notice Allows the grantor or any approved funder to deposit IDRX into the grant contract.
     * @param amount The amount of IDRX tokens to deposit.
     * Must be called after approving this contract to spend 'amount' of funder's IDRX tokens.
     */
    function fundGrant(uint256 amount) external override nonReentrant {
        require(_status == StructsAndEnums.GrantStatus.Fundraising, "Grant: Not in fundraising state");
        require(amount > 0, "Grant: Amount must be positive");

        uint256 currentBalance = _idrxToken.balanceOf(address(this));
        _idrxToken.safeTransferFrom(_msgSender(), address(this), amount);
        uint256 newBalance = _idrxToken.balanceOf(address(this));
        uint256 deposited = newBalance - currentBalance; // Actual amount transferred

        _totalFundingDeposited += deposited;

        emit GrantFunded(_msgSender(), deposited);

        if (_totalFundingDeposited >= _totalFundingRequested) {
            _status = StructsAndEnums.GrantStatus.Active;
            emit GrantStatusChanged(_status, _msgSender());
        }
    }
    
    /**
     * @notice Updates the grant status. Restricted to Grantor or Platform Admin.
     * @param newStatus The new status to set for the grant.
     */
    function updateGrantStatusByGrantor(StructsAndEnums.GrantStatus newStatus)
        external
        override
        onlyGrantRole(GRANTOR_ROLE)
    {
        _updateGrantStatus(newStatus, _msgSender());
    }

    function updateGrantStatusByAdmin(StructsAndEnums.GrantStatus newStatus)
        external
        onlyGrantRole(PLATFORM_ADMIN_ROLE)
    {
        _updateGrantStatus(newStatus, _msgSender());
    }

    /**
     * @notice Internal function to update grant status and emit event.
     */
    function _updateGrantStatus(StructsAndEnums.GrantStatus newStatus, address actor) internal {
        // Add logic here to validate status transitions if needed
        // e.g., cannot go from Completed to Active
        StructsAndEnums.GrantStatus oldStatus = _status;
        _status = newStatus;
        emit GrantStatusChanged(newStatus, actor);

        // Additional logic based on status change
        if (newStatus == StructsAndEnums.GrantStatus.Completed && oldStatus != StructsAndEnums.GrantStatus.Completed) {
            // Potentially handle any remaining funds, though withdrawal is separate
        }
    }

    /**
     * @notice Allows the grantor to withdraw unspent funds if the grant is cancelled or
     * if it's completed and there are surplus funds (though ideally milestones sum to total).
     * @param recipient The address to send the withdrawn funds to.
     * @param amount The amount of IDRX to withdraw.
     */
    function withdrawFunds(address payable recipient, uint256 amount)
        external
        override
        onlyGrantRole(GRANTOR_ROLE) // Or PLATFORM_ADMIN_ROLE for emergencies
        nonReentrant
    {
        require(
            _status == StructsAndEnums.GrantStatus.Cancelled || _status == StructsAndEnums.GrantStatus.Completed,
            "Grant: Not in withdrawable state"
        );
        require(amount > 0, "Grant: Amount must be positive");
        require(_idrxToken.balanceOf(address(this)) >= amount, "Grant: Insufficient contract balance");
        
        _idrxToken.safeTransfer(recipient, amount);
        _totalFundingDeposited -= amount; // Adjust deposited if it represents escrowed amount

        emit FundsWithdrawn(recipient, amount);
    }


    // --- External Functions: Milestone Management ---

    /**
     * @notice Adds a new milestone to the grant. Only callable by the grantor or platform admin.
     * @param descriptionIpfsHash CID of the milestone's detailed description and criteria.
     * @param amountAllocated Amount of IDRX for this milestone.
     * @param verifierAddress Address responsible for verifying this milestone. Can be grantor.
     */
    function addMilestone(
        string calldata descriptionIpfsHash,
        uint256 amountAllocated,
        address verifierAddress
    ) external override onlyGrantRole(GRANTOR_ROLE) { // Or PLATFORM_ADMIN_ROLE
        require(_status == StructsAndEnums.GrantStatus.Active || _status == StructsAndEnums.GrantStatus.Fundraising || _status == StructsAndEnums.GrantStatus.PendingApproval, "Grant: Not in modifiable state");
        require(bytes(descriptionIpfsHash).length > 0, "Grant: Description hash required");
        require(amountAllocated > 0, "Grant: Milestone amount must be positive");
        require(verifierAddress != address(0), "Grant: Verifier cannot be zero address");

        // Optional: Check if sum of milestone amounts exceeds totalFundingRequested
        // uint256 currentMilestoneTotal = 0;
        // for (uint i = 0; i < _milestones.length; i++) {
        //     currentMilestoneTotal += _milestones[i].amountAllocated;
        // }
        // require(currentMilestoneTotal + amountAllocated <= _totalFundingRequested, "Grant: Milestone amounts exceed total grant funding");

        _milestones.push(
            StructsAndEnums.Milestone({
                descriptionIpfsHash: descriptionIpfsHash,
                amountAllocated: amountAllocated,
                isApproved: false,
                isPaid: false,
                proofOfCompletionIpfsHash: "",
                verifier: verifierAddress,
                status: StructsAndEnums.MilestoneStatus.Pending,
                approvalTimestamp: 0,
                paymentTimestamp: 0
            })
        );
        // If verifierAddress is new and doesn't have VERIFIER_ROLE, grant it.
        // This assumes verifiers might be external to initial roles.
        if (!hasRole(VERIFIER_ROLE, verifierAddress)) {
            _grantRole(VERIFIER_ROLE, verifierAddress);
        }
        emit MilestoneAdded(_milestones.length - 1, amountAllocated, descriptionIpfsHash, verifierAddress);
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
        require(_status == StructsAndEnums.GrantStatus.Active || _status == StructsAndEnums.GrantStatus.MilestonesInProgress, "Grant: Not active");
        StructsAndEnums.Milestone storage milestone = _milestones[milestoneIndex];
        require(milestone.status == StructsAndEnums.MilestoneStatus.Pending || milestone.status == StructsAndEnums.MilestoneStatus.Rejected, "Grant: Milestone not pending/rejected");
        require(bytes(proofOfCompletionIpfsHash).length > 0, "Grant: Proof hash required");

        milestone.proofOfCompletionIpfsHash = proofOfCompletionIpfsHash;
        milestone.status = StructsAndEnums.MilestoneStatus.SubmittedForApproval;
        emit MilestoneSubmittedForApproval(milestoneIndex, proofOfCompletionIpfsHash);
        emit MilestoneStatusUpdated(milestoneIndex, milestone.status, _msgSender());
    }

    /**
     * @notice Allows the designated verifier or grantor to approve a milestone.
     * @param milestoneIndex The index of the milestone.
     */
    function approveMilestone(uint256 milestoneIndex) external override onlyVerifierOrGrantor(milestoneIndex) {
        StructsAndEnums.Milestone storage milestone = _milestones[milestoneIndex];
        require(milestone.status == StructsAndEnums.MilestoneStatus.SubmittedForApproval, "Grant: Milestone not submitted for approval");
        
        milestone.isApproved = true; // Kept for potential direct checks if status enum is too granular elsewhere
        milestone.status = StructsAndEnums.MilestoneStatus.Approved;
        milestone.approvalTimestamp = block.timestamp;

        emit MilestoneStatusUpdated(milestoneIndex, milestone.status, _msgSender());
        // emit MilestoneApproved(milestoneIndex, _msgSender()); // Covered by MilestoneStatusUpdated
    }

    /**
     * @notice Allows the designated verifier or grantor to reject a milestone.
     * @param milestoneIndex The index of the milestone.
     * @param feedbackIpfsHash Optional CID for feedback on rejection.
     */
    function rejectMilestone(uint256 milestoneIndex, string calldata feedbackIpfsHash) external override onlyVerifierOrGrantor(milestoneIndex) {
        StructsAndEnums.Milestone storage milestone = _milestones[milestoneIndex];
        require(milestone.status == StructsAndEnums.MilestoneStatus.SubmittedForApproval, "Grant: Milestone not submitted for approval");

        milestone.status = StructsAndEnums.MilestoneStatus.Rejected;
        // Optionally store feedbackIpfsHash if your Milestone struct has a field for it
        // milestone.rejectionFeedbackIpfsHash = feedbackIpfsHash; 

        emit MilestoneStatusUpdated(milestoneIndex, milestone.status, _msgSender());
        // emit MilestoneRejected(milestoneIndex, _msgSender()); // Covered by MilestoneStatusUpdated
    }

    /**
     * @notice Releases payment for an approved milestone to the beneficiary.
     * @param milestoneIndex The index of the milestone.
     * Can be called by anyone if milestone is approved, or restricted.
     * For simplicity, let's allow beneficiary or grantor to trigger this.
     */
    function releaseMilestonePayment(uint256 milestoneIndex)
        external
        override
        nonReentrant
    {
        require(milestoneIndex < _milestones.length, "Grant: Milestone index out of bounds");
        require(_status == StructsAndEnums.GrantStatus.Active || _status == StructsAndEnums.GrantStatus.MilestonesInProgress, "Grant: Not active or in progress");
        
        StructsAndEnums.Milestone storage milestone = _milestones[milestoneIndex];
        require(milestone.status == StructsAndEnums.MilestoneStatus.Approved, "Grant: Milestone not approved");
        require(!milestone.isPaid, "Grant: Milestone already paid");
        require(_idrxToken.balanceOf(address(this)) >= milestone.amountAllocated, "Grant: Insufficient contract balance for payout");

        milestone.isPaid = true;
        milestone.status = StructsAndEnums.MilestoneStatus.Paid;
        milestone.paymentTimestamp = block.timestamp;
        _totalFundingPaidOut += milestone.amountAllocated;

        _idrxToken.safeTransfer(_beneficiary, milestone.amountAllocated);

        emit MilestonePaymentReleased(milestoneIndex, milestone.amountAllocated, _beneficiary);
        emit MilestoneStatusUpdated(milestoneIndex, milestone.status, _msgSender());

        // Update overall grant status if all milestones are paid
        bool allPaid = true;
        for (uint i = 0; i < _milestones.length; i++) {
            if (!_milestones[i].isPaid) {
                allPaid = false;
                break;
            }
        }
        if (allPaid && _milestones.length > 0) {
             _updateGrantStatus(StructsAndEnums.GrantStatus.Completed, address(this)); // Grant contract is actor
        } else if (_status == StructsAndEnums.GrantStatus.Active) {
            // If it was just 'Active' and a milestone got paid, move to 'MilestonesInProgress'
             _updateGrantStatus(StructsAndEnums.GrantStatus.MilestonesInProgress, address(this));
        }
    }


    // --- View Functions ---

    function getGrantDetails()
        external
        view
        override
        returns (
            address grantor_,
            address beneficiary_,
            address idrxTokenAddress_,
            uint256 totalFundingRequested_,
            uint256 totalFundingDeposited_,
            uint256 totalFundingPaidOut_,
            string memory proposalIpfsHash_,
            StructsAndEnums.GrantStatus status_,
            uint256 milestoneCount_
        )
    {
        return (
            _grantor,
            _beneficiary,
            address(_idrxToken),
            _totalFundingRequested,
            _totalFundingDeposited,
            _totalFundingPaidOut,
            _proposalIpfsHash,
            _status,
            _milestones.length
        );
    }

    function getMilestone(uint256 milestoneIndex)
        external
        view
        override
        returns (StructsAndEnums.Milestone memory milestone)
    {
        require(milestoneIndex < _milestones.length, "Grant: Milestone index out of bounds");
        return _milestones[milestoneIndex];
    }
    
    function getMilestones() external view override returns (StructsAndEnums.Milestone[] memory) {
        return _milestones;
    }

    // --- AccessControl Overrides (Required for Enumerable) ---
    function supportsInterface(bytes4 interfaceId) public view virtual override(AccessControlEnumerable, IGrant) returns (bool) {
        return AccessControlEnumerable.supportsInterface(interfaceId) || IGrant.supportsInterface(interfaceId);
    }
}