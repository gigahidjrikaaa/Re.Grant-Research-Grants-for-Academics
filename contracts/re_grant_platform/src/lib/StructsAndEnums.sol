// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20; // Match your foundry.toml solc_version

/**
 * @title StructsAndEnums
 * @dev Defines shared enumerations and structures for the Re.Grant platform.
 */
library StructsAndEnums {
    enum GrantStatus {
        PendingApproval,    // Initial state after creation, awaiting review/funding decision
        Fundraising,        // Approved, awaiting grantor to deposit funds
        Active,             // Fully funded and milestones can be worked on
        MilestonesInProgress, // At least one milestone payment released, work ongoing
        Completed,          // All milestones paid out
        Cancelled           // Grant cancelled before completion
    }

    enum MilestoneStatus {
        Pending,              // Milestone defined, not yet submitted for approval
        SubmittedForApproval, // Researcher has submitted proof of completion
        Approved,             // Verifier has approved the proof
        Paid,                 // Funds for this milestone released
        Rejected              // Verifier has rejected the proof
    }

    struct Milestone {
        string descriptionIpfsHash; // CID pointing to detailed milestone description, deliverables, criteria
        uint256 amountAllocated;    // Amount of IDRX allocated for this milestone
        bool isApproved;            // Has this milestone been approved by the verifier/grantor?
        bool isPaid;                // Has the payment for this milestone been released?
        string proofOfCompletionIpfsHash; // CID for proof submitted by researcher (optional, can be empty initially)
        address verifier;           // Address responsible for verifying this milestone (can be grantor)
        uint256 approvalTimestamp;  // Timestamp of when the milestone was approved
        uint256 paymentTimestamp;   // Timestamp of when payment was released
        MilestoneStatus status;     // Current status of the milestone
    }
}