import inquirer from 'inquirer';
import { CHAINS } from "./config/chains";
import "dotenv/config";
import SwapTCOFactory from "./swapTokens/swapTCOFactory";
import AddLiquidityTCOFactory from "./addLiquidity/AddLiquidityTCOFactory";
import { ActionType, ChainNames } from "./types";

const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
const publicKey: `0x${string}` = "0xACD0BD350355336c5537dE56250Ef01eD61e73eB";
const artifactsPath = "./contracts/exchange-protocol/artifacts/contracts";

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
        choices: [ActionType.addLiquidity, ActionType.swapTokens],
      },
    ]);

    if (action === ActionType.swapTokens) {
      const swapTCOImpl = await SwapTCOFactory.createSwapTCO(config, privateKey, publicKey, artifactsPath);
      await swapTCOImpl.executeTokenSwapFlowTCO();
    } else if (action === ActionType.addLiquidity) {
      const addLiquidityTCOImpl = await AddLiquidityTCOFactory.createAddLiquidityTCO(config, privateKey, publicKey, artifactsPath);
      await addLiquidityTCOImpl.executeAddLiquidityFlowTCO();
    }

  } catch (error) {
    console.error("❌ An error occurred:", error);
  }
}

void showMenu();