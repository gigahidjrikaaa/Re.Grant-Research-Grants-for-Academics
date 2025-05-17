// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ReGrantAddresses
 * @dev Stores important addresses for the Re.Grant platform,
 * differentiated by chain ID for testnet and mainnet.
 */
library ReGrantAddresses {
    // Lisk Sepolia Testnet (Chain ID: 4202)
    address constant LISK_SEPOLIA_IDRX_TOKEN = 0x18Bc5bcC660cf2B9cE3cd51a404aFe1a0cBD3C22;

    // Lisk Mainnet (Update with actual mainnet address when available)
    // address constant LISK_MAINNET_IDRX_TOKEN = 0xYourMainnetIDRXTokenAddressHere;

    /**
     * @notice Gets the IDRX token address based on the current chain ID.
     * @return Address of the IDRX token.
     */
    function getIdrxTokenAddress() internal view returns (address) {
        if (block.chainid == 4202) { // Lisk Sepolia Chain ID
            return LISK_SEPOLIA_IDRX_TOKEN;
        }
        // else if (block.chainid == LISK_MAINNET_CHAIN_ID) { // Replace LISK_MAINNET_CHAIN_ID with actual value
        //     return LISK_MAINNET_IDRX_TOKEN;
        // }
        revert("ReGrantAddresses: IDRX token address not configured for this chain.");
    }
}