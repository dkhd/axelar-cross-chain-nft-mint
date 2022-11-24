//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import {IERC20} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IERC20.sol";
import {IAxelarGasService} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol";
import {AxelarExecutable} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/executables/AxelarExecutable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "./NFT.sol";

contract DeployOnDestinationChain is AxelarExecutable {
    IAxelarGasService immutable gasReceiver;
    NFT nftContract;

    constructor(address _gateway, address _gasReceiver)
        AxelarExecutable(_gateway)
    {
        gasReceiver = IAxelarGasService(_gasReceiver);
        nftContract = new NFT();
    }

    event Executed();

    function _execute(
        string calldata, /*sourceChain*/
        string calldata, /*sourceAddress*/
        bytes calldata payload
    ) internal override {
        (
            address recipientAddress,
            uint256 tokenId
        ) = abi.decode(
                payload,
                (address, uint256)
            );
        
        nftContract.mint(recipientAddress, tokenId);

        emit Executed();
    }

    function getNFTContractAddress() public view returns (address) {
        return address(nftContract);
    }
}
