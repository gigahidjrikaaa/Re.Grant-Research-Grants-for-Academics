// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

library ReGrantStructs {
    enum GrantStatus {
        PendingApproval,
        Fundraising,
        Active,
        MilestonesInProgress,
        Completed,
        Cancelled
    }

    enum MilestoneStatus {
        Pending,
        SubmittedForApproval,
        Approved,
        Paid,
        Rejected
    }

    struct Milestone {
        string descriptionIpfsHash;
        uint256 amountAllocated;
        address verifier;
        MilestoneStatus status;
        string proofOfCompletionIpfsHash;
        uint256 approvalTimestamp;
        uint256 paymentTimestamp;
        string rejectionFeedbackIpfsHash;
    }
}