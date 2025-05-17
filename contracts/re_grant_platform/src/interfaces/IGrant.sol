// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {StructsAndEnums} from "../lib/StructsAndEnums.sol";

interface IGrant {
    event GrantFunded(address indexed funder, uint256 amount);
    event MilestoneAdded(
        uint256 indexed milestoneIndex,
        uint256 amountAllocated,
        string descriptionIpfsHash,
        address verifier
    );
    event MilestoneSubmittedForApproval(uint256 indexed milestoneIndex, string proofOfCompletionIpfsHash);
    event MilestoneStatusUpdated(uint256 indexed milestoneIndex, StructsAndEnums.MilestoneStatus newStatus, address indexed actor);
    event MilestonePaymentReleased(uint256 indexed milestoneIndex, uint256 amountPaid, address indexed beneficiary);
    event GrantStatusChanged(StructsAndEnums.GrantStatus newStatus, address indexed actor);
    event FundsWithdrawn(address indexed recipient, uint256 amount);

    function fundGrant(uint256 amount) external;

    function addMilestone(
        string calldata descriptionIpfsHash,
        uint256 amountAllocated,
        address verifier // Address responsible for verifying this milestone
    ) external;

    function submitMilestoneProof(uint256 milestoneIndex, string calldata proofOfCompletionIpfsHash) external;

    function approveMilestone(uint256 milestoneIndex) external;

    function rejectMilestone(uint256 milestoneIndex, string calldata feedbackIpfsHash) external;

    function releaseMilestonePayment(uint256 milestoneIndex) external;

    function updateGrantStatusByGrantor(StructsAndEnums.GrantStatus newStatus) external;

    function withdrawFunds(address payable recipient, uint256 amount) external; // For grantor to withdraw unspent/cancelled funds

    function getGrantDetails()
        external
        view
        returns (
            address grantor,
            address beneficiary,
            address idrxTokenAddress,
            uint256 totalFundingRequested,
            uint256 totalFundingDeposited,
            uint256 totalFundingPaid,
            string memory proposalIpfsHash,
            StructsAndEnums.GrantStatus status,
            uint256 milestoneCount
        );

    function getMilestone(uint256 milestoneIndex)
        external
        view
        returns (StructsAndEnums.Milestone memory milestone);
    
    function getMilestones() external view returns (StructsAndEnums.Milestone[] memory);
}