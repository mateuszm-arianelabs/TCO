import "dotenv/config";

export const privateKey = process.env.PRIVATE_KEY as `0x${string}`;
export const publicKey: `0x${string}` = "0xACD0BD350355336c5537dE56250Ef01eD61e73eB";
export const artifactsPath = "./contracts/exchange-protocol/artifacts/contracts";
export const erc721SepoliaContractAddress = process.env.ERC721_SEPOLIA_CONTRACT_ADDRESS as `0x${string}`;
export const erc721HederaContractAddress = process.env.ERC721_HEDERA_CONTRACT_ADDRESS as `0x${string}`;