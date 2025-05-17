// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {Grant} from "../src/Grant.sol";
import {MockIDRX} from "../src/mocks/MockIDRX.sol"; // Assuming you have this
import {StructsAndEnums} from "../src/lib/StructsAndEnums.sol";
import {IGrant} from "../src/interfaces/IGrant.sol";

contract GrantTest is Test {
    Grant public grantContract;
    MockIDRX public idrxToken;

    address payable public grantor = payable(address(0x1001)); // Test address
    address payable public beneficiary = payable(address(0x1002));
    address public platformAdmin = address(0xAD01); // Changed to a valid hex address
    address public verifier1 = address(0x2001);
    address public verifier2 = address(0x2002);
    address public maliciousActor = address(0xBAD);

    uint256 public constant TOTAL_FUNDING_REQUESTED = 10000 * 1e18; // Assuming 18 decimals for IDRX
    string public constant PROPOSAL_IPFS_HASH = "QmXYZ123abc";
    string public constant MILESTONE1_IPFS = "QmMilestone1";
    uint256 public constant MILESTONE1_AMOUNT = 4000 * 1e18;
    string public constant MILESTONE2_IPFS = "QmMilestone2";
    uint256 public constant MILESTONE2_AMOUNT = 6000 * 1e18;
    string public constant PROOF1_IPFS = "QmProof1";

    function setUp() public {
        vm.label(grantor, "Grantor");
        vm.label(beneficiary, "Beneficiary");
        vm.label(platformAdmin, "PlatformAdmin");
        vm.label(verifier1, "Verifier1");
        vm.label(verifier2, "Verifier2");
        vm.label(maliciousActor, "MaliciousActor");
        
        // Deploy Mock IDRX token
        vm.startPrank(grantor); // Grantor deploys and owns mock token initially
        idrxToken = new MockIDRX(grantor);
        vm.stopPrank();

        // Deploy Grant contract (GrantFactory would do this in production)
        // For unit testing Grant.sol, we deploy it directly.
        // The GrantFactory will be the one setting initial roles.
        // Here, platformAdmin will be the one initially setting up Grant roles.
        grantContract = new Grant(
            grantor,
            beneficiary,
            address(idrxToken),
            TOTAL_FUNDING_REQUESTED,
            PROPOSAL_IPFS_HASH,
            platformAdmin // This address gets DEFAULT_ADMIN_ROLE for this Grant instance
        );

        // Initial state checks
        assertEq(address(grantContract.grantor()), grantor, "Grantor not set correctly");
        assertEq(address(grantContract.beneficiary()), beneficiary, "Beneficiary not set correctly");
        assertEq(address(grantContract.idrxToken()), address(idrxToken), "IDRX token not set correctly");
        assertEq(grantContract.totalFundingRequested(), TOTAL_FUNDING_REQUESTED, "Total funding not set");
        assertEq(grantContract.proposalIpfsHash(), PROPOSAL_IPFS_HASH, "Proposal IPFS hash not set");
        assertEq(uint(grantContract.status()), uint(StructsAndEnums.GrantStatus.PendingApproval), "Initial status incorrect");

        // Check roles (AccessControlEnumerable specific)
        assertTrue(grantContract.hasRole(grantContract.DEFAULT_ADMIN_ROLE(), platformAdmin), "PlatformAdmin should have DEFAULT_ADMIN_ROLE");
        assertTrue(grantContract.hasRole(grantContract.PLATFORM_ADMIN_ROLE(), platformAdmin), "PlatformAdmin should have PLATFORM_ADMIN_ROLE");
        assertTrue(grantContract.hasRole(grantContract.GRANTOR_ROLE(), grantor), "Grantor role not set");
        assertTrue(grantContract.hasRole(grantContract.BENEFICIARY_ROLE(), beneficiary), "Beneficiary role not set");
    }

    // --- Test Scenarios ---

    function test_InitialState() public {
        // Already covered in setUp, but good to have an explicit test
        (address g, address b, address token, uint256 requested, uint256 deposited, uint256 paid, string memory ipfs, StructsAndEnums.GrantStatus s, uint256 mc) = grantContract.getGrantDetails();
        assertEq(g, grantor);
        assertEq(b, beneficiary);
        assertEq(token, address(idrxToken));
        assertEq(requested, TOTAL_FUNDING_REQUESTED);
        assertEq(deposited, 0);
        assertEq(paid, 0);
        assertEq(s, StructsAndEnums.GrantStatus.PendingApproval);
        assertEq(mc, 0);
    }

    function test_Fail_AddMilestone_WhenNotGrantorOrAdmin() public {
        vm.startPrank(maliciousActor);
        vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlEnumerable.AccessControlUnauthorizedAccount.selector,
                maliciousActor,
                grantContract.GRANTOR_ROLE()
            )
        );
        grantContract.addMilestone(MILESTONE1_IPFS, MILESTONE1_AMOUNT, verifier1);
        vm.stopPrank();
    }
    
    function test_PlatformAdminCanUpdateStatus() public {
        vm.startPrank(platformAdmin);
        grantContract.updateGrantStatusByAdmin(StructsAndEnums.GrantStatus.Fundraising);
        vm.stopPrank();
        assertEq(uint(grantContract.status()), uint(StructsAndEnums.GrantStatus.Fundraising));
    }
    
    function test_GrantorCanUpdateStatus() public {
        // First, platform admin moves to Fundraising to allow grantor action
        vm.startPrank(platformAdmin);
        grantContract.updateGrantStatusByAdmin(StructsAndEnums.GrantStatus.Fundraising);
        vm.stopPrank();
        
        vm.startPrank(grantor);
        grantContract.updateGrantStatusByGrantor(StructsAndEnums.GrantStatus.Cancelled); // Example
        vm.stopPrank();
        assertEq(uint(grantContract.status()), uint(StructsAndEnums.GrantStatus.Cancelled));
    }
    
    function test_AddMilestone_Success() public {
        // Grantor adds milestone. For this, status needs to be appropriate (e.g. Active or Fundraising)
        // Let's assume platform admin sets it to Fundraising first.
        vm.startPrank(platformAdmin);
        grantContract.updateGrantStatusByAdmin(StructsAndEnums.GrantStatus.Fundraising);
        vm.stopPrank();

        vm.startPrank(grantor);
        grantContract.addMilestone(MILESTONE1_IPFS, MILESTONE1_AMOUNT, verifier1);
        vm.stopPrank();

        StructsAndEnums.Milestone[] memory milestones = grantContract.getMilestones();
        assertEq(milestones.length, 1, "Milestone count should be 1");
        assertEq(milestones[0].descriptionIpfsHash, MILESTONE1_IPFS);
        assertEq(milestones[0].amountAllocated, MILESTONE1_AMOUNT);
        assertEq(milestones[0].verifier, verifier1);
        assertEq(uint(milestones[0].status), uint(StructsAndEnums.MilestoneStatus.Pending));
        assertTrue(grantContract.hasRole(grantContract.VERIFIER_ROLE(), verifier1), "Verifier1 role not granted");
    }

    function test_FundGrant_FullAmount_StatusActive() public {
        vm.startPrank(platformAdmin);
        grantContract.updateGrantStatusByAdmin(StructsAndEnums.GrantStatus.Fundraising);
        vm.stopPrank();
        
        vm.startPrank(grantor);
        idrxToken.approve(address(grantContract), TOTAL_FUNDING_REQUESTED);
        grantContract.fundGrant(TOTAL_FUNDING_REQUESTED);
        vm.stopPrank();

        assertEq(grantContract.totalFundingDeposited(), TOTAL_FUNDING_REQUESTED);
        assertEq(idrxToken.balanceOf(address(grantContract)), TOTAL_FUNDING_REQUESTED);
        assertEq(uint(grantContract.status()), uint(StructsAndEnums.GrantStatus.Active));
    }
    
    function test_MilestoneLifecycle_Submit_Approve_Pay() public {
        // 1. Setup: Admin sets to Fundraising, Grantor adds milestone, Grantor funds
        vm.startPrank(platformAdmin);
        grantContract.updateGrantStatusByAdmin(StructsAndEnums.GrantStatus.Fundraising);
        vm.stopPrank();

        vm.startPrank(grantor);
        grantContract.addMilestone(MILESTONE1_IPFS, MILESTONE1_AMOUNT, verifier1);
        idrxToken.approve(address(grantContract), TOTAL_FUNDING_REQUESTED); // Approve for full grant
        grantContract.fundGrant(TOTAL_FUNDING_REQUESTED); // Funds grant, status becomes Active
        vm.stopPrank();
        
        assertEq(uint(grantContract.status()), uint(StructsAndEnums.GrantStatus.Active));

        // 2. Beneficiary submits proof
        vm.startPrank(beneficiary);
        grantContract.submitMilestoneProof(0, PROOF1_IPFS);
        vm.stopPrank();
        StructsAndEnums.Milestone memory m0 = grantContract.getMilestone(0);
        assertEq(uint(m0.status), uint(StructsAndEnums.MilestoneStatus.SubmittedForApproval));
        assertEq(m0.proofOfCompletionIpfsHash, PROOF1_IPFS);

        // 3. Verifier1 approves
        vm.startPrank(verifier1);
        grantContract.approveMilestone(0);
        vm.stopPrank();
        m0 = grantContract.getMilestone(0);
        assertEq(uint(m0.status), uint(StructsAndEnums.MilestoneStatus.Approved));
        assertTrue(m0.isApproved);

        // 4. Anyone (or beneficiary/grantor) releases payment
        uint256 beneficiaryInitialBalance = idrxToken.balanceOf(beneficiary);
        vm.startPrank(beneficiary); // Beneficiary triggers payment
        grantContract.releaseMilestonePayment(0);
        vm.stopPrank();
        
        m0 = grantContract.getMilestone(0);
        assertEq(uint(m0.status), uint(StructsAndEnums.MilestoneStatus.Paid));
        assertTrue(m0.isPaid);
        assertEq(idrxToken.balanceOf(beneficiary), beneficiaryInitialBalance + MILESTONE1_AMOUNT);
        assertEq(grantContract.totalFundingPaidOut(), MILESTONE1_AMOUNT);
        assertEq(uint(grantContract.status()), uint(StructsAndEnums.GrantStatus.MilestonesInProgress));
    }
    
    // Add more tests:
    // - Funding partial amounts
    // - Rejecting milestones
    // - Multiple milestones
    // - Withdrawing funds after cancellation/completion
    // - Access control for each function (e.g., maliciousActor attempts)
    // - Edge cases (e.g., milestone amount > remaining funds)
}