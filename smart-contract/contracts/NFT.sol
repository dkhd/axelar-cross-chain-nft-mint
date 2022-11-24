// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFT is ERC721URIStorage {

    mapping(uint256 => uint8) private _tokenIds;

    constructor() ERC721("LearnWeb3", "LW3"){}

    function mint(address recipient, uint256 tokenId) external {
        require(
            _tokenIds[tokenId] != 1,
            "This Token ID is already exists"
        );
        _tokenIds[tokenId] = 1;
        _safeMint(recipient, tokenId);
    }

}
