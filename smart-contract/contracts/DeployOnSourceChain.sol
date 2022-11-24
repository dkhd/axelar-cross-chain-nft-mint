//SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import {IERC20} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IERC20.sol";
import {IAxelarGateway} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGateway.sol";
import {IAxelarGasService} from "@axelar-network/axelar-gmp-sdk-solidity/contracts/interfaces/IAxelarGasService.sol";

contract DeployOnSourceChain {
    IAxelarGasService immutable gasReceiver;
    IAxelarGateway immutable gateway;

    constructor(address _gateway, address _gasReceiver) {
        gateway = IAxelarGateway(_gateway);
        gasReceiver = IAxelarGasService(_gasReceiver);
    }

    event Executed();

    function mintNFT(
        string calldata destinationChain,
        string calldata destinationAddress,
        address recipientAddress,
        uint256 tokenId
    ) external payable {
        bytes memory payload = abi.encode(recipientAddress, tokenId);
        if (msg.value > 0) {
            gasReceiver.payNativeGasForContractCall{value: msg.value}(
                address(this),
                destinationChain,
                destinationAddress,
                payload,
                msg.sender
            );
        }

        gateway.callContract(
            destinationChain,
            destinationAddress,
            payload
        );
        emit Executed();
    }
}
