// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DATAToken is ERC20, Ownable {
    constructor() ERC20("Data Token", "DATA") Ownable(msg.sender) {
        _mint(msg.sender, 1000000000 * 10**18);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}