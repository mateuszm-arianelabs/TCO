import inquirer from 'inquirer';
import { CHAINS } from "./config/chains";
import "dotenv/config";
import SwapTCOFactory from "./swapTokens/swapTCOFactory";
import AddLiquidityTCOFactory from "./addLiquidity/AddLiquidityTCOFactory";
import NftTCOFactory from "./nftActions/nftTCOFactory";
import nftAbi from "../contracts/exchange-protocol/data/abi/contracts/CustomERC721/MyNFT.json";
import { ActionType, ChainNames } from "./types";
import { benchmark } from "./utils/benchmark";

const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
const publicKey: `0x${string}` = "0xACD0BD350355336c5537dE56250Ef01eD61e73eB";
const artifactsPath = "./contracts/exchange-protocol/artifacts/contracts";
const nftAddress = process.env.ERC721_CONTRACT_ADDRESS as `0x${string}`;

async function showMenu() {
  console.clear();
  console.log('Welcome to the TCO Calculator! 🚀\n');

  if (!privateKey) {
    console.error("❌ Missing PRIVATE_KEY in environment variables");
    return;
  }

  try {
    const { blockchain } = await inquirer.prompt([
      {
        type: 'list',
        name: 'blockchain',
        message: 'Select a blockchain:',
        choices: [ChainNames.bsc, ChainNames.base, ChainNames.arbitrum, ChainNames.ethereum],
      },
    ]);

    const selectedChainKey = blockchain.toLowerCase();
    const config = CHAINS[selectedChainKey];

    if (!config) {
      console.clear();
      console.error(`❌ Invalid or unhandled blockchain selection: ${selectedChainKey}`);
      return;
    }

    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Select a TCO action:',
        choices: [
          ActionType.addLiquidity,
          ActionType.swapTokens,
          ActionType.mintNFT,
          ActionType.burnNFT,
          ActionType.airdropNFT,
        ],
      },
    ]);

    let nftTCOImpl: any;
    if (
      action === ActionType.mintNFT ||
      action === ActionType.burnNFT ||
      action === ActionType.airdropNFT
    ) {
      nftTCOImpl = await NftTCOFactory.createNftActionsTCO(
        config,
        privateKey,
        publicKey,
        nftAbi,
        nftAddress
      );
    }

    if (action === ActionType.swapTokens) {
      const swapTCOImpl = await SwapTCOFactory.createSwapTCO(config, privateKey, publicKey, artifactsPath);
      await benchmark(() => swapTCOImpl.executeTokenSwapFlowTCO());
    } else if (action === ActionType.addLiquidity) {
      const addLiquidityTCOImpl = await AddLiquidityTCOFactory.createAddLiquidityTCO(config, privateKey, publicKey, artifactsPath);
      await benchmark(() => addLiquidityTCOImpl.executeAddLiquidityFlowTCO());
    } else if (action === ActionType.mintNFT) {
      await benchmark(() => nftTCOImpl.executeMintFlowTCO());
    } else if (action === ActionType.burnNFT) {
      const { tokenId } = await inquirer.prompt([
        {
          type: 'input',
          name: 'tokenId',
          message: 'Enter the token ID to burn:',
          validate: (value) => /^\d+$/.test(value) || "Please enter a valid numeric token ID!",
        },
      ]);
      await benchmark(() => nftTCOImpl.executeBurnFlowTCO(BigInt(tokenId)));
    } else if (action === ActionType.airdropNFT) {
      await benchmark(() => nftTCOImpl.executeAirdropFlowTCO());
    }


  } catch (error) {
    console.error("❌ An error occurred:", error);
  }
}

void showMenu();