// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";

contract NFTMarketplace is ReentrancyGuard {
    struct Listing {
        uint256 price;
        address seller;
    }

    struct ListedToken {
        address nft;
        uint256 tokenId;
    }

    mapping(address => mapping(uint256 => Listing)) public listings;
    mapping(address => uint256) public proceeds;

    ListedToken[] private listedTokens;

    event ItemListed(address indexed seller, address indexed nft, uint256 indexed tokenId, uint256 price);
    event ItemBought(address indexed buyer, address indexed nft, uint256 indexed tokenId, uint256 price);
    event ItemCanceled(address indexed seller, address indexed nft, uint256 indexed tokenId);

    modifier isOwner(address nft, uint256 tokenId, address spender) {
        IERC721 token = IERC721(nft);
        require(token.ownerOf(tokenId) == spender, "Not owner");
        _;
    }

    modifier isListed(address nft, uint256 tokenId) {
        require(listings[nft][tokenId].price > 0, "Not listed");
        _;
    }

    modifier notListed(address nft, uint256 tokenId) {
        require(listings[nft][tokenId].price == 0, "Already listed");
        _;
    }

    function listItem(address nft, uint256 tokenId, uint256 price)
        external
        notListed(nft, tokenId)
        isOwner(nft, tokenId, msg.sender)
    {
        require(price > 0, "Price must be above 0");

        IERC721 token = IERC721(nft);
        require(
            token.isApprovedForAll(msg.sender, address(this)) || 
            token.getApproved(tokenId) == address(this),
            "Marketplace not approved"
        );

        listings[nft][tokenId] = Listing(price, msg.sender);
        listedTokens.push(ListedToken(nft, tokenId));
        emit ItemListed(msg.sender, nft, tokenId, price);
    }

    function buyItem(address nft, uint256 tokenId)
        external
        payable
        nonReentrant
        isListed(nft, tokenId)
    {
        Listing memory item = listings[nft][tokenId];
        require(msg.value >= item.price, "Price not met");

        proceeds[item.seller] += msg.value;
        delete listings[nft][tokenId];

        IERC721(nft).safeTransferFrom(item.seller, msg.sender, tokenId);
        emit ItemBought(msg.sender, nft, tokenId, item.price);
    }

    function cancelListing(address nft, uint256 tokenId)
        external
        isOwner(nft, tokenId, msg.sender)
        isListed(nft, tokenId)
    {
        delete listings[nft][tokenId];
        emit ItemCanceled(msg.sender, nft, tokenId);
    }

    function withdrawProceeds() external nonReentrant {
        uint256 amount = proceeds[msg.sender];
        require(amount > 0, "No proceeds");
        proceeds[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
    }

    function getAllListings()
        external
        view
        returns (
            address[] memory nftAddrs,
            uint256[] memory tokenIds,
            uint256[] memory prices,
            address[] memory sellers
        )
    {
        uint256 count = 0;

        // First pass to count valid listings
        for (uint i = 0; i < listedTokens.length; i++) {
            ListedToken memory lt = listedTokens[i];
            if (listings[lt.nft][lt.tokenId].price > 0) {
                count++;
            }
        }

        nftAddrs = new address[](count);
        tokenIds = new uint256[](count);
        prices = new uint256[](count);
        sellers = new address[](count);

        uint256 j = 0;
        for (uint i = 0; i < listedTokens.length; i++) {
            ListedToken memory lt = listedTokens[i];
            Listing memory l = listings[lt.nft][lt.tokenId];

            if (l.price > 0) {
                nftAddrs[j] = lt.nft;
                tokenIds[j] = lt.tokenId;
                prices[j] = l.price;
                sellers[j] = l.seller;
                j++;
            }
        }
    }

    function getListing(address nft, uint256 tokenId)
        external
        view
        returns (Listing memory)
    {
        return listings[nft][tokenId];
    }

    function getListingsForSeller(address /*seller*/)
        external
        pure
        returns (
            Listing[] memory,
            address[] memory,
            uint256[] memory
        )
    {
        // To be implemented
    }
}
