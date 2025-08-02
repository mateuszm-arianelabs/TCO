import inquirer from 'inquirer';
import {CHAINS} from "./config/chains";
import {swapTokensTCO} from "./swap-tokens";
import "dotenv/config"
import {addLiquidityTCO} from "./add-liquidity";

const privateKey = process.env.PRIVATE_KEY;
const publicKey = "0xACD0BD350355336c5537dE56250Ef01eD61e73eB"

async function showMenu() {
    console.clear();
    console.log('Welcome to the TCO Calculator! 🚀\n');

    try {
        if(!privateKey) {
            console.error("Missing PRIVATE_KEY in environment variables");
            return;
        }

        const blockchainChoices = ['BSC', 'Base', 'Arbitrum'];

        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'blockchain',
                message: 'Select a blockchain:',
                choices: blockchainChoices,
            },
        ]);

        const value = String(answers.blockchain).toLowerCase();
        const config = CHAINS[value];

        if(!config) {
            console.clear();
            console.error(`Invalid or unhandled parameter ${value}`);
            return;
        }

        return addLiquidityTCO(privateKey, publicKey,  config)
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

void showMenu();