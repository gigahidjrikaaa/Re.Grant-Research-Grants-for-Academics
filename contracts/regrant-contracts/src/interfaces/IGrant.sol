// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReGrantStructs} from "../lib/ReGrantStructs.sol";

interface IGrant {
    event GrantFunded(address indexed funder, uint256 amountDeposited);
    event MilestoneAdded(
        uint256 indexed milestoneIndex,
        uint256 amountAllocated,
        string descriptionIpfsHash,
        address verifier
    );
    event MilestoneProofSubmitted(uint256 indexed milestoneIndex, string proofOfCompletionIpfsHash, address indexed submitter);
    event MilestoneStatusUpdated(uint256 indexed milestoneIndex, ReGrantStructs.MilestoneStatus newStatus, address indexed actor);
    event MilestonePaymentReleased(uint256 indexed milestoneIndex, uint256 amountPaid, address indexed beneficiary);
    event GrantStatusUpdated(ReGrantStructs.GrantStatus newStatus, address indexed actor);
    event FundsWithdrawn(address indexed recipient, uint256 amount);

    function fundGrant(uint256 amount) external;
    function addMilestone(string calldata descriptionIpfsHash, uint256 amountAllocated, address verifier) external returns (uint256 milestoneIndex);
    function submitMilestoneProof(uint256 milestoneIndex, string calldata proofOfCompletionIpfsHash) external;
    function approveMilestone(uint256 milestoneIndex) external;
    function rejectMilestone(uint256 milestoneIndex, string calldata feedbackIpfsHash) external;
    function releaseMilestonePayment(uint256 milestoneIndex) external;
    function updateGrantStatus(ReGrantStructs.GrantStatus newStatus) external;
    function withdrawGrantorFunds(address payable recipient, uint256 amount) external;

    function getGrantor() external view returns (address);
    function getBeneficiary() external view returns (address);
    function getIdrxToken() external view returns (address);
    function getTotalFundingRequested() external view returns (uint256);
    function getTotalFundingDeposited() external view returns (uint256);
    function getTotalFundingPaidOut() external view returns (uint256);
    function getProposalIpfsHash() external view returns (string memory);
    function getCurrentStatus() external view returns (ReGrantStructs.GrantStatus);
    function getMilestoneCount() external view returns (uint256);
    function getMilestone(uint256 milestoneIndex) external view returns (ReGrantStructs.Milestone memory);
    function getAllMilestones() external view returns (ReGrantStructs.Milestone[] memory);
}