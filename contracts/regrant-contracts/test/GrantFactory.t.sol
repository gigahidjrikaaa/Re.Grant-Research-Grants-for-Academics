// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {GrantFactory} from "../src/GrantFactory.sol";
import {IGrantFactory} from "../src/interfaces/IGrantFactory.sol";
import {IGrant} from "../src/interfaces/IGrant.sol";
import {Grant} from "../src/Grant.sol"; // To cast the deployed grant address
import {ReGrantAddresses} from "../src/lib/ReGrantAddresses.sol";
import {MockIDRX} from "../src/mocks/MockIDRX.sol"; // For testing IDRX interactions if needed locally

contract GrantFactoryTest is Test {
    GrantFactory public factory;
    address public platformAdmin = makeAddr("PlatformAdmin");
    address public deployer = makeAddr("Deployer"); // User deploying the factory
    
    address public user1 = makeAddr("User1_Grantor");
    address payable public beneficiary1 = payable(makeAddr("Beneficiary1"));
    string public constant PROPOSAL1_IPFS = "QmProposal1";
    uint256 public constant FUNDING1_REQUESTED = 50000 * 10**18;

    address public liskSepoliaIdrxAddress; // Will be set in setUp

    function setUp() public {
        vm.startPrank(deployer);
        factory = new GrantFactory(platformAdmin);
        vm.stopPrank();

        // Set the current chain ID to Lisk Sepolia for ReGrantAddresses to work correctly
        vm.chainId(4202); 
        liskSepoliaIdrxAddress = ReGrantAddresses.getIdrxTokenAddress();

        // Optional: Grant GRANT_CREATOR_ROLE to user1 if createGrant is restricted
        // vm.startPrank(platformAdmin); // Assuming platformAdmin gets DEFAULT_ADMIN_ROLE in factory constructor
        // factory.grantRole(factory.GRANT_CREATOR_ROLE(), user1);
        // vm.stopPrank();
    }

    function test_InitialFactoryState() public {
        assertTrue(factory.hasRole(factory.DEFAULT_ADMIN_ROLE(), deployer), "Deployer should be DEFAULT_ADMIN");
        assertTrue(factory.hasRole(factory.PLATFORM_ADMIN_ROLE(), platformAdmin), "Initial Platform Admin not set");
        assertEq(factory.getGrantCount(), 0, "Initial grant count should be 0");
    }

    function test_CreateGrant_Success() public {
        vm.startPrank(user1); // user1 (grantor) creates the grant
        
        vm.expectEmit(true, true, true, true, address(factory)); // Check for event from factory
        emit IGrantFactory.GrantCreated(
            address(0), // We don't know the grant address yet, check dynamically or use anyValue
            user1,
            beneficiary1,
            liskSepoliaIdrxAddress,
            FUNDING1_REQUESTED,
            PROPOSAL1_IPFS
        );
        
        address grantAddress = factory.createGrant(
            beneficiary1,
            // idrxTokenAddress is now fetched inside createGrant
            FUNDING1_REQUESTED,
            PROPOSAL1_IPFS
        );
        vm.stopPrank();

        assertTrue(grantAddress != address(0), "Grant address should not be zero");
        assertEq(factory.getGrantCount(), 1, "Grant count should be 1");
        assertEq(factory.getGrantAddress(0), grantAddress, "Stored grant address mismatch");
        assertTrue(factory.isGrant(grantAddress), "isGrant check failed");

        address[] memory grantorGrants = factory.getGrantsByGrantor(user1);
        assertEq(grantorGrants.length, 1, "Grantor grants count mismatch");
        assertEq(grantorGrants[0], grantAddress, "Grantor grant address mismatch");

        address[] memory beneficiaryGrants = factory.getGrantsByBeneficiary(beneficiary1);
        assertEq(beneficiaryGrants.length, 1, "Beneficiary grants count mismatch");
        assertEq(beneficiaryGrants[0], grantAddress, "Beneficiary grant address mismatch");

        // Verify details of the deployed Grant contract
        IGrant deployedGrant = IGrant(grantAddress);
        assertEq(deployedGrant.getGrantor(), user1, "Deployed grant's grantor incorrect");
        assertEq(deployedGrant.getBeneficiary(), beneficiary1, "Deployed grant's beneficiary incorrect");
        assertEq(deployedGrant.getIdrxToken(), liskSepoliaIdrxAddress, "Deployed grant's IDRX token incorrect");
        assertEq(deployedGrant.getTotalFundingRequested(), FUNDING1_REQUESTED, "Deployed grant's funding incorrect");
        
        // Check roles on the deployed Grant contract
        Grant grantInstance = Grant(payable(grantAddress)); // Cast to Grant to check roles
        assertTrue(grantInstance.hasRole(grantInstance.DEFAULT_ADMIN_ROLE(), address(factory)), "Factory should be admin of Grant");
        assertTrue(grantInstance.hasRole(grantInstance.GRANTOR_ROLE(), user1), "Grantor role not set on Grant");
    }

    // function test_Fail_CreateGrant_NotCreatorRole() public {
    //     // This test is relevant if GRANT_CREATOR_ROLE is enforced
    //     vm.startPrank(makeAddr("RandomUser"));
    //     vm.expectRevert("GrantFactory: Not authorized to create grants"); // Or AccessControl revert
    //     factory.createGrant(
    //         beneficiary1,
    //         FUNDING1_REQUESTED,
    //         PROPOSAL1_IPFS
    //     );
    //     vm.stopPrank();
    // }

    function test_SetPlatformAdmin_Success() public {
        address newAdmin = makeAddr("NewPlatformAdmin");
        vm.startPrank(deployer); // DEFAULT_ADMIN_ROLE for the factory
        factory.setPlatformAdmin(newAdmin);
        vm.stopPrank();
        assertTrue(factory.hasRole(factory.PLATFORM_ADMIN_ROLE(), newAdmin));
    }

    function test_Fail_SetPlatformAdmin_NotDefaultAdmin() public {
        address newAdmin = makeAddr("NewPlatformAdmin");
        vm.startPrank(platformAdmin); // platformAdmin does not have DEFAULT_ADMIN_ROLE by default
         vm.expectRevert(
            abi.encodeWithSelector(
                AccessControlEnumerable.AccessControlUnauthorizedAccount.selector,
                platformAdmin,
                factory.DEFAULT_ADMIN_ROLE()
            )
        );
        factory.setPlatformAdmin(newAdmin);
        vm.stopPrank();
    }

    // TODO: Add tests for:
    // - createGrant with various inputs
    // - View functions with multiple grants
    // - Role granting/revoking for GRANT_CREATOR_ROLE (if implemented)
}