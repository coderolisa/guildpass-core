// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";
import "../src/MembershipNFT.sol";

contract MembershipNFTTest is Test {
    MembershipNFT nft;
    address admin = address(0xA11CE);
    address user = address(0xBEEF);

    function setUp() public {
        nft = new MembershipNFT("GuildPass Membership", "GPM");
        nft.setAdmin(admin, true);
    }

    function testMintAndActive() public {
        vm.prank(admin);
        uint256 id = nft.mint(user, 365 days);
        assertTrue(nft.isActive(id));
    }

    function testRenew() public {
        vm.prank(admin);
        uint256 id = nft.mint(user, 1);
        vm.warp(block.timestamp + 2);
        assertFalse(nft.isActive(id));
        vm.prank(admin);
        nft.renew(id, 100);
        assertTrue(nft.isActive(id));
    }

    function testSuspend() public {
        vm.prank(admin);
        uint256 id = nft.mint(user, 100);
        vm.prank(admin);
        nft.setSuspended(id, true);
        assertFalse(nft.isActive(id));
    }
}
