// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {Grant} from "../src/Grant.sol";
import {MockIDRX} from "../src/mocks/MockIDRX.sol";
import {ReGrantStructs} from "../src/lib/ReGrantStructs.sol";
import {IGrant} from "../src/interfaces/IGrant.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {AccessControlEnumerable} from "@openzeppelin/contracts/access/extensions/AccessControlEnumerable.sol";
// ReGrantAddresses isn't strictly needed here if we pass the mock token address directly,
// but good to keep in mind for tests that might fork Lisk Sepolia.
// import {ReGrantAddresses} from "../src/lib/ReGrantAddresses.sol";

contract GrantTest is Test {
    // Grant contract instance
    Grant public grantContract;
    // Mock IDRX token instance (using IERC20 interface for interactions)
    IERC20 public idrxToken;

    // Test user addresses
    address public deployer = makeAddr("Deployer"); // For deploying MockIDRX
    address public grantor = makeAddr("Grantor");
    address payable public beneficiary = payable(makeAddr("Beneficiary"));
    address public platformAdmin = makeAddr("PlatformAdmin"); // Acts as initial admin for Grant contract
    address public verifier1 = makeAddr("Verifier1");
    address public verifier2 = makeAddr("Verifier2");
    address public otherUser = makeAddr("OtherUser");

    // Constants for testing
    uint256 public constant TOTAL_FUNDING_REQUESTED = 100_000 ether; // Using 'ether' for 10**18, assuming 18 decimals for mIDRX
    string public constant PROPOSAL_IPFS_HASH = "QmProposalHash123abcXYZ";
    
    string public constant MILESTONE1_DESC_IPFS = "QmMilestone1Description";
    uint256 public constant MILESTONE1_AMOUNT = 40_000 ether;
    string public constant MILESTONE1_PROOF_IPFS = "QmProofForMilestone1";
    string public constant MILESTONE1_REJECT_FEEDBACK_IPFS = "QmFeedbackForRejection1";

    string public constant MILESTONE2_DESC_IPFS = "QmMilestone2Description";
    uint256 public constant MILESTONE2_AMOUNT = 60_000 ether;


    function setUp() public {
        // Deploy Mock IDRX token. The deployer gets the initial supply.
        vm.startPrank(deployer);
        MockIDRX mockIdrxInstance = new MockIDRX(deployer);
        idrxToken = IERC20(address(mockIdrxInstance));
        vm.stopPrank();

        // Deploy the Grant contract.
        // The 'platformAdmin' is set as the initial admin (DEFAULT_ADMIN_ROLE) for this Grant instance.
        grantContract = new Grant(
            grantor,
            beneficiary,
            address(idrxToken), // Pass the deployed mock token address
            TOTAL_FUNDING_REQUESTED,
            PROPOSAL_IPFS_HASH,
            platformAdmin 
        );

        // For testing, give the grantor enough mock IDRX tokens to fund the grant.
        vm.prank(deployer); // Deployer of MockIDRX mints tokens
        MockIDRX(address(idrxToken)).mint(grantor, TOTAL_FUNDING_REQUESTED * 2); 
    }

    // --- Test Initial State ---
    function test_InitialState() public {
        assertEq(grantContract.getGrantor(), grantor, "Initial grantor incorrect");
        assertEq(grantContract.getBeneficiary(), beneficiary, "Initial beneficiary incorrect");
        assertEq(grantContract.getIdrxToken(), address(idrxToken), "IDRX token address incorrect");
        assertEq(grantContract.getTotalFundingRequested(), TOTAL_FUNDING_REQUESTED, "Total funding requested incorrect");
        assertEq(grantContract.getTotalFundingDeposited(), 0, "Initial deposited funding should be 0");
        assertEq(grantContract.getTotalFundingPaidOut(), 0, "Initial paid out funding should be 0");
        assertEq(grantContract.getProposalIpfsHash(), PROPOSAL_IPFS_HASH, "Proposal IPFS hash incorrect");
        assertEq(uint(grantContract.getCurrentStatus()), uint(ReGrantStructs.GrantStatus.PendingApproval), "Initial grant status incorrect");
        assertEq(grantContract.getMilestoneCount(), 0, "Initial milestone count should be 0");

        // Role checks
        assertTrue(grantContract.hasRole(grantContract.DEFAULT_ADMIN_ROLE(), platformAdmin), "PlatformAdmin should have DEFAULT_ADMIN_ROLE");
        assertTrue(grantContract.hasRole(grantContract.PLATFORM_ADMIN_ROLE(), platformAdmin), "PlatformAdmin should have PLATFORM_ADMIN_ROLE");
        assertTrue(grantContract.hasRole(grantContract.GRANTOR_ROLE(), grantor), "Grantor should have GRANTOR_ROLE");
        assertTrue(grantContract.hasRole(grantContract.BENEFICIARY_ROLE(), beneficiary), "Beneficiary should have BENEFICIARY_ROLE");
    }

    // --- Test Status Updates ---
    function test_UpdateStatus_ByPlatformAdmin() public {
        vm.prank(platformAdmin);
        grantContract.updateGrantStatus(ReGrantStructs.GrantStatus.Fundraising);
        assertEq(uint(grantContract.getCurrentStatus()), uint(ReGrantStructs.GrantStatus.Fundraising));
    }

    function test_UpdateStatus_ByGrantor() public {
        // To allow grantor to change status, platform admin might need to set it to a state like Fundraising first.
        // Or, ensure grantor role has permission for specific transitions.
        // Assuming PendingApproval -> Fundraising is an admin action here for example.
        vm.prank(platformAdmin);
        grantContract.updateGrantStatus(ReGrantStructs.GrantStatus.Fundraising); 
        vm.stopPrank();

        vm.prank(grantor);
        grantContract.updateGrantStatus(ReGrantStructs.GrantStatus.Cancelled); // Grantor cancels
        assertEq(uint(grantContract.getCurrentStatus()), uint(ReGrantStructs.GrantStatus.Cancelled));
    }

    function test_Fail_UpdateStatus_ByOtherUser() public {
        vm.prank(otherUser);
        vm.expectRevert("Grant: Caller is not grantor or platform admin");
        grantContract.updateGrantStatus(ReGrantStructs.GrantStatus.Fundraising);
    }
    
    function test_Fail_UpdateStatusToActive_IfNotFullyFunded() public {
        vm.prank(platformAdmin);
        grantContract.updateGrantStatus(ReGrantStructs.GrantStatus.Fundraising);
        vm.expectRevert("Grant: Cannot set to Active, not fully funded");
        grantContract.updateGrantStatus(ReGrantStructs.GrantStatus.Active);
    }

    // --- Test Funding ---
    function test_FundGrant_FullAmount_SetsStatusToActive() public {
        vm.prank(platformAdmin); // Admin moves to Fundraising
        grantContract.updateGrantStatus(ReGrantStructs.GrantStatus.Fundraising);
        vm.stopPrank();

        vm.startPrank(grantor);
        idrxToken.approve(address(grantContract), TOTAL_FUNDING_REQUESTED);
        grantContract.fundGrant(TOTAL_FUNDING_REQUESTED);
        vm.stopPrank();

        assertEq(grantContract.getTotalFundingDeposited(), TOTAL_FUNDING_REQUESTED);
        assertEq(idrxToken.balanceOf(address(grantContract)), TOTAL_FUNDING_REQUESTED);
        assertEq(uint(grantContract.getCurrentStatus()), uint(ReGrantStructs.GrantStatus.Active));
    }
    
    function test_Fail_FundGrant_ByNonGrantor() public {
        vm.prank(platformAdmin);
        grantContract.updateGrantStatus(ReGrantStructs.GrantStatus.Fundraising);
        vm.stopPrank();

        vm.startPrank(beneficiary); // Beneficiary tries to fund
        idrxToken.approve(address(grantContract), 100 ether); // Beneficiary needs tokens for this test
         vm.expectRevert(
            abi.encodeWithSelector(
                bytes4(keccak256("AccessControlUnauthorizedAccount(address,bytes32)")),
                beneficiary, // account
                grantContract.GRANTOR_ROLE() // role
            )
        );
        grantContract.fundGrant(100 ether);
        vm.stopPrank();
    }

    // --- Test Milestone Management ---
    function test_AddMilestone_ByGrantor_Success() public {
        vm.prank(platformAdmin); // Admin sets to a state allowing milestone addition
        grantContract.updateGrantStatus(ReGrantStructs.GrantStatus.Fundraising);
        vm.stopPrank();

        vm.startPrank(grantor);
        uint256 milestoneIdx = grantContract.addMilestone(MILESTONE1_DESC_IPFS, MILESTONE1_AMOUNT, verifier1);
        vm.stopPrank();

        assertEq(grantContract.getMilestoneCount(), 1);
        ReGrantStructs.Milestone memory m = grantContract.getMilestone(milestoneIdx);
        assertEq(m.descriptionIpfsHash, MILESTONE1_DESC_IPFS);
        assertEq(m.amountAllocated, MILESTONE1_AMOUNT);
        assertEq(m.verifier, verifier1);
        assertEq(uint(m.status), uint(ReGrantStructs.MilestoneStatus.Pending));
        assertTrue(grantContract.hasRole(grantContract.VERIFIER_ROLE(), verifier1), "Verifier1 role not granted by addMilestone");
    }

    function test_Fail_AddMilestone_AmountExceedsTotalFunding() public {
        vm.prank(platformAdmin);
        grantContract.updateGrantStatus(ReGrantStructs.GrantStatus.Fundraising);
        vm.stopPrank();

        vm.startPrank(grantor);
        vm.expectRevert("Grant: Milestone amounts exceed total funding");
        grantContract.addMilestone(MILESTONE1_DESC_IPFS, TOTAL_FUNDING_REQUESTED + 1 ether, verifier1);
        vm.stopPrank();
    }

    // --- Test Full Milestone Workflow ---
    function test_MilestoneWorkflow_Submit_Approve_Pay_Complete() public {
        // 1. Setup: Admin sets to Fundraising, Grantor adds milestones, Grantor funds
        vm.prank(platformAdmin);
        grantContract.updateGrantStatus(ReGrantStructs.GrantStatus.Fundraising);
        vm.stopPrank();

        vm.startPrank(grantor);
        grantContract.addMilestone(MILESTONE1_DESC_IPFS, MILESTONE1_AMOUNT, verifier1);
        grantContract.addMilestone(MILESTONE2_DESC_IPFS, MILESTONE2_AMOUNT, verifier1); // Total = 100k
        idrxToken.approve(address(grantContract), TOTAL_FUNDING_REQUESTED);
        grantContract.fundGrant(TOTAL_FUNDING_REQUESTED); // Status becomes Active
        vm.stopPrank();
        assertEq(uint(grantContract.getCurrentStatus()), uint(ReGrantStructs.GrantStatus.Active));

        // Milestone 1: Submit, Approve, Pay
        vm.prank(beneficiary);
        grantContract.submitMilestoneProof(0, MILESTONE1_PROOF_IPFS);
        vm.prank(verifier1);
        grantContract.approveMilestone(0);
        vm.prank(beneficiary); // Or anyone
        grantContract.releaseMilestonePayment(0);
        
        ReGrantStructs.Milestone memory m0 = grantContract.getMilestone(0);
        assertEq(uint(m0.status), uint(ReGrantStructs.MilestoneStatus.Paid));
        assertEq(grantContract.getTotalFundingPaidOut(), MILESTONE1_AMOUNT);
        assertEq(uint(grantContract.getCurrentStatus()), uint(ReGrantStructs.GrantStatus.MilestonesInProgress));

        // Milestone 2: Submit, Approve, Pay
        vm.prank(beneficiary);
        grantContract.submitMilestoneProof(1, "QmProofForMilestone2");
        vm.prank(verifier1);
        grantContract.approveMilestone(1);
        vm.prank(beneficiary);
        grantContract.releaseMilestonePayment(1);

        ReGrantStructs.Milestone memory m1 = grantContract.getMilestone(1);
        assertEq(uint(m1.status), uint(ReGrantStructs.MilestoneStatus.Paid));
        assertEq(grantContract.getTotalFundingPaidOut(), TOTAL_FUNDING_REQUESTED); // All paid
        assertEq(uint(grantContract.getCurrentStatus()), uint(ReGrantStructs.GrantStatus.Completed), "Grant should be completed");
    }

    function test_MilestoneWorkflow_RejectAndResubmit() public {
        // Setup
        vm.prank(platformAdmin);
        grantContract.updateGrantStatus(ReGrantStructs.GrantStatus.Fundraising);
        vm.prank(grantor);
        grantContract.addMilestone(MILESTONE1_DESC_IPFS, MILESTONE1_AMOUNT, verifier1);
        idrxToken.approve(address(grantContract), TOTAL_FUNDING_REQUESTED);
        grantContract.fundGrant(TOTAL_FUNDING_REQUESTED);
        vm.stopPrank(); // Grantor stops, platform admin actions done

        // Beneficiary submits
        vm.prank(beneficiary);
        grantContract.submitMilestoneProof(0, "QmInitialProof");
        
        // Verifier rejects
        vm.prank(verifier1);
        grantContract.rejectMilestone(0, MILESTONE1_REJECT_FEEDBACK_IPFS);
        ReGrantStructs.Milestone memory m0 = grantContract.getMilestone(0);
        assertEq(uint(m0.status), uint(ReGrantStructs.MilestoneStatus.Rejected));
        assertEq(m0.rejectionFeedbackIpfsHash, MILESTONE1_REJECT_FEEDBACK_IPFS);

        // Beneficiary resubmits
        vm.prank(beneficiary);
        grantContract.submitMilestoneProof(0, "QmRevisedProof");
        m0 = grantContract.getMilestone(0);
        assertEq(uint(m0.status), uint(ReGrantStructs.MilestoneStatus.SubmittedForApproval));
        
        // Verifier approves the resubmission
        vm.prank(verifier1);
        grantContract.approveMilestone(0);
        m0 = grantContract.getMilestone(0);
        assertEq(uint(m0.status), uint(ReGrantStructs.MilestoneStatus.Approved));
    }
    
    // --- Test Fund Withdrawal ---
    function test_WithdrawGrantorFunds_AfterCancellation() public {
        vm.prank(platformAdmin);
        grantContract.updateGrantStatus(ReGrantStructs.GrantStatus.Fundraising);
        vm.prank(grantor);
        idrxToken.approve(address(grantContract), TOTAL_FUNDING_REQUESTED);
        grantContract.fundGrant(TOTAL_FUNDING_REQUESTED); // Fully funded
        vm.stopPrank(); // Grantor

        uint256 grantorBalanceBeforeWithdraw = idrxToken.balanceOf(grantor);

        vm.prank(platformAdmin); // Admin cancels the grant
        grantContract.updateGrantStatus(ReGrantStructs.GrantStatus.Cancelled);
        vm.stopPrank();

        vm.prank(grantor);
        grantContract.withdrawGrantorFunds(payable(grantor), TOTAL_FUNDING_REQUESTED);
        vm.stopPrank();

        assertEq(grantContract.getTotalFundingDeposited(), 0, "Deposited amount should be 0 after withdrawal");
        assertEq(idrxToken.balanceOf(address(grantContract)), 0, "Contract balance should be 0");
        assertEq(idrxToken.balanceOf(grantor), grantorBalanceBeforeWithdraw + TOTAL_FUNDING_REQUESTED, "Grantor balance incorrect after withdrawal");
    }

    function test_Fail_WithdrawGrantorFunds_ToOtherAddress() public {
        // Similar setup as above until cancellation
        vm.prank(platformAdmin);
        grantContract.updateGrantStatus(ReGrantStructs.GrantStatus.Fundraising);
        vm.prank(grantor);
        idrxToken.approve(address(grantContract), TOTAL_FUNDING_REQUESTED);
        grantContract.fundGrant(TOTAL_FUNDING_REQUESTED);
        grantContract.updateGrantStatus(ReGrantStructs.GrantStatus.Cancelled); // Grantor cancels their own grant
        vm.stopPrank(); // Grantor

        vm.prank(grantor);
        vm.expectRevert("Grant: Can only withdraw to grantor");
        grantContract.withdrawGrantorFunds(beneficiary, TOTAL_FUNDING_REQUESTED); // Attempt to withdraw to beneficiary
        vm.stopPrank();
    }


    // --- Access Control Tests ---
    function test_Fail_AddMilestone_ByBeneficiary() public {
        vm.prank(platformAdmin);
        grantContract.updateGrantStatus(ReGrantStructs.GrantStatus.Fundraising);
        vm.stopPrank();

        vm.startPrank(beneficiary);
        vm.expectRevert(bytes("Grant: Caller is not grantor or platform admin"));
        grantContract.addMilestone(MILESTONE1_DESC_IPFS, MILESTONE1_AMOUNT, verifier1);
        vm.stopPrank();
    }

    function test_Fail_ApproveMilestone_ByNonVerifier() public {
        // Setup: Add milestone, submit proof
        vm.prank(platformAdmin); grantContract.updateGrantStatus(ReGrantStructs.GrantStatus.Fundraising);
        vm.prank(grantor);
        grantContract.addMilestone(MILESTONE1_DESC_IPFS, MILESTONE1_AMOUNT, verifier1);
        idrxToken.approve(address(grantContract), TOTAL_FUNDING_REQUESTED);
        grantContract.fundGrant(TOTAL_FUNDING_REQUESTED);
        vm.stopPrank(); //grantor
        vm.prank(beneficiary); grantContract.submitMilestoneProof(0, MILESTONE1_PROOF_IPFS ); vm.stopPrank();


        vm.startPrank(otherUser); // Not verifier1
        vm.expectRevert("Grant: Caller is not the designated verifier for this milestone");
        grantContract.approveMilestone(0);
        vm.stopPrank();
    }
    
    function test_GrantorAsVerifier_ApproveMilestone() public {
        // Setup: Add milestone with grantor as verifier, fund, submit proof
        vm.prank(platformAdmin); grantContract.updateGrantStatus(ReGrantStructs.GrantStatus.Fundraising);
        vm.prank(grantor);
        grantContract.addMilestone(MILESTONE1_DESC_IPFS, MILESTONE1_AMOUNT, grantor); // Grantor is verifier
        idrxToken.approve(address(grantContract), TOTAL_FUNDING_REQUESTED);
        grantContract.fundGrant(TOTAL_FUNDING_REQUESTED);
        // Grantor also needs VERIFIER_ROLE if onlyMilestoneVerifier checks for it
        grantContract.grantRole(grantContract.VERIFIER_ROLE(), grantor); 
        vm.stopPrank(); //grantor

        vm.prank(beneficiary); grantContract.submitMilestoneProof(0, MILESTONE1_PROOF_IPFS ); vm.stopPrank();

        // Grantor (who is also the verifier) approves
        vm.prank(grantor);
        grantContract.approveMilestone(0);
        vm.stopPrank();
        
        ReGrantStructs.Milestone memory m0 = grantContract.getMilestone(0);
        assertEq(uint(m0.status), uint(ReGrantStructs.MilestoneStatus.Approved));
    }

    // Remember to add more tests for events, edge cases, and all role interactions.
}