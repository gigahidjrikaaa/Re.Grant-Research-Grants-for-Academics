// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24; // Match your foundry.toml solc_version

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockIDRX
 * @dev A mock ERC20 token to represent IDRX for development and local testing.
 * Allows the owner (deployer) to mint tokens.
 * It's Ownable to restrict minting.
 */
contract MockIDRX is ERC20, Ownable {
    /**
     * @dev Sets the values for {name} and {symbol}.
     * The owner is set to the deploying address.
     * Mints a large initial supply to the contract deployer (initialOwner).
     * For IDRX (Rupiah), 2 decimals is common, but ERC20 standard is often 18.
     * Let's assume 18 decimals for broader compatibility in testing unless IDRX specifies otherwise.
     */
    constructor(
        address initialOwner 
    ) ERC20("Mock Indonesian Rupiah X", "mIDRX") Ownable(initialOwner) {
        _mint(initialOwner, 1_000_000_000 * (10**decimals())); // e.g., 1 Billion tokens
    }

    /**
     * @notice Allows the current owner to mint more tokens to a specified account.
     * @param to The address to mint tokens to.
     * @param amount The amount of tokens to mint.
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    /**
     * @notice Allows any user to burn their own tokens.
     * @param amount The amount of tokens to burn.
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}