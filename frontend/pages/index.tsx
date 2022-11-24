import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import { useAccount, useNetwork, useSigner, useSwitchNetwork } from "wagmi";

import sourceAbi from "../abis/DeployOnSourceChain.json";
import destinationAbi from "../abis/DeployOnDestinationChain.json";
import erc721Abi from "../abis/ERC721.json";

import { Contract } from "ethers";
import { AxelarQueryAPI, Environment, EvmChain, GasToken } from "@axelar-network/axelarjs-sdk";


export default function Home() {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [tokenId, setTokenId] = useState(1);
  const [nftContractAddress, setNftContractAddress] = useState("");
  const [tokenBalance, setTokenBalance] = useState(0);
  const [isPolygon, setIsPolygon] = useState(false);

  const { data: signer } = useSigner();
  const { address: currentAddress, connector, isConnected } = useAccount();

  const { chain } = useNetwork();

  const sourceContract = new Contract(
    process.env.NEXT_PUBLIC_SOURCE_CONTRACT_ADDRESS!,
    sourceAbi.abi,
    signer!
  );

  const destinationContract = new Contract(
    process.env.NEXT_PUBLIC_DESTINATION_CONTRACT_ADDRESS!,
    destinationAbi.abi,
    signer!
  )

  async function getNFTContractAddress() {
    const txn = await destinationContract.getNFTContractAddress();
    return txn;
  }

  async function getNFTBalance() {
    const nftContract = new Contract(
      nftContractAddress,
      erc721Abi.abi,
      signer!
    )

    const txn = await nftContract.balanceOf(recipientAddress);
    setTokenBalance(txn);
  }

  async function mintOnPolygon() {
    const api = new AxelarQueryAPI({ environment: Environment.TESTNET });

    const gasFee = BigInt(
      Math.floor(
        Number(
          await api.estimateGasFee(
            EvmChain.MOONBEAM,
            EvmChain.POLYGON,
            "DEV",
            700000,
            2
          )
        )
      )
    );
    
    const txn = await sourceContract.mintNFT(
      "Polygon",
      destinationContract.address,
      recipientAddress,
      tokenId,
      {
        value: gasFee,
      }
    );

    await txn.wait();
  }

  async function mintBtnHandler() {
    await mintOnPolygon();
  }

  async function checkBalanceBtnHandler() {
    if (chain?.name === "Polygon Mumbai")
      if (currentAddress) {
        await getNFTContractAddress().then((res: any) =>
          setNftContractAddress(res)
        );
      }
  }

  useEffect(() => {
    setIsWalletConnected(isConnected)
  },[isConnected])

  useEffect(() => {
    setIsPolygon(chain?.name === "Polygon Mumbai")
  },[chain?.name])

  useEffect(() => {
    async function retrieve() {
      if (nftContractAddress.length > 0) await getNFTBalance();
    }
    retrieve();
  },[nftContractAddress])

  return (
    <div>
      <div className="flex flex-row-reverse items-center p-10">
        <ConnectButton />
      </div>
      <div className="flex flex-col  justify-center w-full md:w-1/3 mx-auto">
        <div className="shadow-xl border border-gray-100 rounded-xl p-10">
          <div className="flex flex-row items-center justify-center">
            <img
              src="https://moonbeam.network/wp-content/uploads/2020/03/Moonbeam-Logo-Final-500px.png"
              className="w-1/2"
            />
            <span>&rarr;</span>
            <img
              src="https://upload.wikimedia.org/wikipedia/en/2/24/Polygon_blockchain_logo.png"
              className="w-1/2"
            />
          </div>
          <p className="text-center text-xl font-light tracking-widest uppercase">
            Mint NFT on Polygon from Moonbeam
          </p>
          <input
            placeholder="Token ID (e.g. 1)"
            className="px-3 py-2 border border-gray-300 mt-5 w-full font-light"
            type="number"
            onChange={(e) => setTokenId(parseInt(e.target.value))}
            disabled={!isWalletConnected}
          />
          <input
            placeholder="Polygon Wallet Address (e.g. 0x...)"
            className="px-3 py-2 border border-gray-300 mt-3 w-full font-light"
            onChange={(e) => setRecipientAddress(e.target.value)}
            disabled={!isWalletConnected}
          />
          <button
            className="px-3 py-2 bg-yellow-300 text-gray-500 w-full mt-3 hover:bg-yellow-400 disabled:bg-gray-200"
            onClick={mintBtnHandler}
            disabled={!isWalletConnected}
          >
            Mint
          </button>
          <div className="mt-10 font-light uppercase tracking-widest text-center">
            <span>&middot; Check NFT Balance &middot;</span>
          </div>
          <div className="mt-10">
            <div className="font-light">NFT Contract Address (on Polygon):</div>
            <input
              className="px-3 py-2 border border-gray-300 mt-1 w-full font-light"
              disabled
              value={nftContractAddress}
            />
            <div className="font-light mt-5">NFT Balance:</div>
            <input
              className="px-3 py-2 border border-gray-300 mt-1 w-full font-light"
              disabled
              value={tokenBalance}
            />
            <button
              className="px-3 py-2 bg-yellow-300 text-gray-500 w-full mt-3 hover:bg-yellow-400 disabled:bg-gray-200"
              onClick={checkBalanceBtnHandler}
              disabled={!isPolygon}
            >
              Check Balance
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

