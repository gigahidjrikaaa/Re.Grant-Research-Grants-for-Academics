// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20; // Match your foundry.toml solc_version

import "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol"; // Using OpenZeppelin's Ownable

/**
 * @title MockIDRX
 * @dev A mock ERC20 token to represent IDRX for testing purposes.
 * Allows the owner (deployer) to mint tokens.
 */
contract MockIDRX is ERC20, Ownable {
    constructor(
        address initialOwner
    ) ERC20("Mock Indonesian Rupiah X", "mIDRX") Ownable(initialOwner) {
        // Mint an initial supply to the deployer (initialOwner)
        // For example, 1 billion tokens (assuming 18 decimals like ETH)
        _mint(initialOwner, 1_000_000_000 * (10**decimals()));
    }

    /**
     * @notice Allows the owner to mint more tokens to a specified account.
     * @param to The address to mint tokens to.
     * @param amount The amount of tokens to mint.
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * @notice Allows anyone to burn their own tokens.
     * @param amount The amount of tokens to burn.
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}