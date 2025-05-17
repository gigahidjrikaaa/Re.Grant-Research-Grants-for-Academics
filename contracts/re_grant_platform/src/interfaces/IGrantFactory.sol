// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {StructsAndEnums} from "../lib/StructsAndEnums.sol";

interface IGrantFactory {
    event GrantCreated(
        address indexed grantContractAddress,
        address indexed grantor,
        address indexed beneficiary,
        uint256 totalFundingRequested,
        string proposalIpfsHash,
        address idrxTokenAddress
    );

    /**
     * @notice Creates a new Grant contract and registers it.
     * @param beneficiary The address of the grant recipient (researcher).
     * @param idrxTokenAddress The address of the IDRX (ERC20) token contract.
     * @param totalFundingRequested The total amount of IDRX requested for the grant.
     * @param proposalIpfsHash A CID (string) pointing to the detailed grant proposal on IPFS.
     * @return grantContractAddress The address of the newly created Grant contract.
     */
    function createGrant(
        address beneficiary,
        address idrxTokenAddress,
        uint256 totalFundingRequested,
        string calldata proposalIpfsHash
    ) external returns (address grantContractAddress);

    function getDeployedGrants() external view returns (address[] memory);

    function getGrantsByGrantor(address grantor) external view returns (address[] memory);

    function getGrantsByBeneficiary(address beneficiary) external view returns (address[] memory);

    // Potentially add functions to set platform admin or other config if needed
}