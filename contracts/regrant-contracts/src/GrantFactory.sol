// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControlEnumerable} from "@openzeppelin/contracts/access/extensions/AccessControlEnumerable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol"; // If planning for upgradeability

import {Grant} from "../src/Grant.sol";
import {IGrantFactory} from "./interfaces/IGrantFactory.sol";
import {ReGrantAddresses} from "./lib/ReGrantAddresses.sol";

/**
 * @title GrantFactory
 * @author Re.Grant Team
 * @notice Factory for deploying and managing Grant contracts.
 * This contract will own the Grant contracts it deploys, acting as their admin initially.
 */
 
contract GrantFactory is IGrantFactory, AccessControlEnumerable {
    // --- Roles for the Factory ---
    // DEFAULT_ADMIN_ROLE can grant/revoke other roles for this factory.
    // PLATFORM_ADMIN_ROLE can perform administrative actions on the factory itself.
    bytes32 public constant PLATFORM_ADMIN_ROLE = keccak256("PLATFORM_ADMIN_ROLE");
    bytes32 public constant GRANT_CREATOR_ROLE = keccak256("GRANT_CREATOR_ROLE"); // Optional: To restrict who can create grants

    // --- State Variables ---
    address[] private _deployedGrants;
    mapping(address => address[]) private _grantsByGrantor;
    mapping(address => address[]) private _grantsByBeneficiary;
    mapping(address => bool) private _isGrantContract; // To quickly check if an address is a deployed grant

    // If using upgradeable Grant contracts (via UUPS proxy pattern)
    // address private _grantImplementation;

    // --- Events ---
    // GrantCreated event is defined in IGrantFactory

    // --- Constructor ---
    /**
     * @notice Initializes the GrantFactory.
     * @param initialPlatformAdmin The address that will receive platform admin rights for this factory.
     */
    constructor(address initialPlatformAdmin) {
        require(initialPlatformAdmin != address(0), "GrantFactory: Initial admin cannot be zero");
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); // Deployer of factory is initial DEFAULT_ADMIN
        _grantRole(PLATFORM_ADMIN_ROLE, initialPlatformAdmin);
        _setRoleAdmin(PLATFORM_ADMIN_ROLE, DEFAULT_ADMIN_ROLE); // DEFAULT_ADMIN can manage PLATFORM_ADMIN
        _setRoleAdmin(GRANT_CREATOR_ROLE, PLATFORM_ADMIN_ROLE); // PLATFORM_ADMIN can manage GRANT_CREATORs
        
        // If using upgradeable grant contracts, set initial implementation:
        // _grantImplementation = address(new Grant(address(0), address(0), address(0), 0, "", address(this)));
        // For non-upgradeable grants, this line is not needed.
    }

    // --- Initializer (for Upgradeable Contracts - UUPS Pattern) ---
    // Uncomment if making this factory upgradeable
    // function initialize(address initialPlatformAdmin) public initializer {
    //     __AccessControl_init();
    //     // __ReentrancyGuard_init(); // If using ReentrancyGuard
    //     require(initialPlatformAdmin != address(0), "GrantFactory: Initial admin cannot be zero");
    //     _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
    //     _grantRole(PLATFORM_ADMIN_ROLE, initialPlatformAdmin);
    //     _setRoleAdmin(PLATFORM_ADMIN_ROLE, DEFAULT_ADMIN_ROLE);
    //     _setRoleAdmin(GRANT_CREATOR_ROLE, PLATFORM_ADMIN_ROLE);
    // }

    // --- External Functions ---

    /**
     * @notice Creates a new Grant contract and registers it.
     * @dev The IDRX token address is fetched from ReGrantAddresses library based on chain ID.
     * @param beneficiary The address of the grant recipient (researcher).
     * @param totalFundingRequested The total amount of IDRX requested for the grant.
     * @param proposalIpfsHash A CID (string) pointing to the detailed grant proposal on IPFS.
     * @return grantContractAddress The address of the newly created Grant contract.
     */
    function createGrant(
        address beneficiary,
        address idrxTokenAddress, // We get this from ReGrantAddresses
        uint256 totalFundingRequested,
        string calldata proposalIpfsHash
    ) external returns (address grantContractAddress) {
        // Optional: Restrict who can create grants
        // require(hasRole(GRANT_CREATOR_ROLE, _msgSender()) || hasRole(PLATFORM_ADMIN_ROLE, _msgSender()), "GrantFactory: Not authorized to create grants");

        address determinedIdrxTokenAddress = ReGrantAddresses.getIdrxTokenAddress();
        require(idrxTokenAddress == determinedIdrxTokenAddress, "GrantFactory: Provided token address mismatch or chain not supported by ReGrantAddresses");
        
        address grantor = _msgSender(); // The caller of createGrant is the grantor

        // The 'initialAdmin' for the Grant contract will be this GrantFactory itself,
        // or a more specific platform admin address if preferred.
        // Giving the factory DEFAULT_ADMIN_ROLE over the Grant allows the factory to manage Grant roles if needed.
        Grant newGrant = new Grant(
            grantor,
            beneficiary,
            idrxTokenAddress,
            totalFundingRequested,
            proposalIpfsHash,
            address(this) // GrantFactory is the initial admin of the Grant contract
        );
        grantContractAddress = address(newGrant);

        _deployedGrants.push(grantContractAddress);
        _grantsByGrantor[grantor].push(grantContractAddress);
        _grantsByBeneficiary[beneficiary].push(grantContractAddress);
        _isGrantContract[grantContractAddress] = true;

        emit GrantCreated(
            grantContractAddress,
            grantor,
            beneficiary,
            idrxTokenAddress,
            totalFundingRequested,
            proposalIpfsHash
        );
        return grantContractAddress;
    }


    // --- Admin Functions for the Factory ---

    /**
     * @notice Allows the DEFAULT_ADMIN_ROLE to change the PLATFORM_ADMIN_ROLE.
     */
    function setPlatformAdmin(address newPlatformAdmin) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newPlatformAdmin != address(0), "GrantFactory: New platform admin cannot be zero address");
        address oldPlatformAdmin = getRoleMember(PLATFORM_ADMIN_ROLE, 0); // Assuming one platform admin for simplicity
        _revokeRole(PLATFORM_ADMIN_ROLE, oldPlatformAdmin);
        _grantRole(PLATFORM_ADMIN_ROLE, newPlatformAdmin);
        emit PlatformAdminChanged(newPlatformAdmin);
    }

    // If using UUPS for Grant contracts:
    // function setGrantImplementation(address newImplementation) external onlyRole(PLATFORM_ADMIN_ROLE) {
    //     require(newImplementation != address(0), "GrantFactory: Implementation cannot be zero");
    //     _grantImplementation = newImplementation;
    //     emit GrantImplementationUpdated(newImplementation);
    // }
    // function grantImplementation() external view returns (address) {
    //     return _grantImplementation;
    // }


    // --- View Functions ---
    function getGrantCount() external view override returns (uint256) {
        return _deployedGrants.length;
    }

    function getGrantAddress(uint256 index) external view override returns (address) {
        require(index < _deployedGrants.length, "GrantFactory: Index out of bounds");
        return _deployedGrants[index];
    }

    function getGrantsByGrantor(address grantor) external view override returns (address[] memory) {
        return _grantsByGrantor[grantor];
    }

    function getGrantsByBeneficiary(address beneficiary) external view override returns (address[] memory) {
        return _grantsByBeneficiary[beneficiary];
    }

    function isGrant(address queryAddress) external view override returns (bool) {
        return _isGrantContract[queryAddress];
    }

    // --- AccessControl Overrides ---
    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControlEnumerable) // Specify both bases being overridden
        returns (bool)
    {
        // Check if the interfaceId matches IGrantFactory's interfaceId
        // or if it's supported by AccessControlEnumerable (which handles its own ERC165 and AccessControl's)
        return
            interfaceId == type(IGrantFactory).interfaceId ||
            super.supportsInterface(interfaceId); // super here will call AccessControlEnumerable's supportsInterface
    }
}