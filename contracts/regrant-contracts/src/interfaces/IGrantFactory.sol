// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IGrantFactory {
    event GrantCreated(
        address indexed grantContractAddress,
        address indexed grantor,
        address indexed beneficiary,
        address idrxTokenAddress,
        uint256 totalFundingRequested,
        string proposalIpfsHash
    );

    event PlatformAdminChanged(address indexed newAdmin);
    event GrantImplementationUpdated(address indexed newImplementation);

    function createGrant(
        address beneficiary,
        address idrxTokenAddress,
        uint256 totalFundingRequested,
        string calldata proposalIpfsHash
    ) external returns (address grantContractAddress);

    function getGrantCount() external view returns (uint256);
    function getGrantAddress(uint256 index) external view returns (address);
    function getGrantsByGrantor(address grantor) external view returns (address[] memory);
    function getGrantsByBeneficiary(address beneficiary) external view returns (address[] memory);
    function isGrant(address queryAddress) external view returns (bool);
}