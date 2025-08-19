import { ChainConfig, ChainNames } from '../types';
import TokenPriceService from '../utils/tokenPriceService';
import EvmNftActionsTCO from './evmNftActionsTCO';
import { INftActionsTCO } from './INftActionsTCO';
import erc721Abi from './abi/erc721.json'

const erc721SepoliaContractAddress = process.env.ERC721_SEPOLIA_CONTRACT_ADDRESS as `0x${string}`;
const erc721HederaContractAddress = process.env.ERC721_HEDERA_CONTRACT_ADDRESS as `0x${string}`;

class NftTCOFactory {
  static async createNftActionsTCO(
    config: ChainConfig,
    privateKey: `0x${string}`,
    publicKey: `0x${string}`,
  ): Promise<INftActionsTCO> {
    let nativeTokenPrice: number;

    switch (config.name) {
      case ChainNames.ethereum:
      case ChainNames.arbitrum:
      case ChainNames.base:
        nativeTokenPrice = await TokenPriceService.fetchEthPrice();
        return new EvmNftActionsTCO(
          config, privateKey, publicKey, erc721Abi, erc721SepoliaContractAddress, nativeTokenPrice
        );
      case ChainNames.bsc:
        nativeTokenPrice = await TokenPriceService.fetchBnbPrice();
        return new EvmNftActionsTCO(
          config, privateKey, publicKey, erc721Abi, erc721SepoliaContractAddress, nativeTokenPrice
        );
      case ChainNames.hedera:
        nativeTokenPrice = await TokenPriceService.fetchHbarPrice();
        return new EvmNftActionsTCO(
          config, privateKey, publicKey, erc721Abi, erc721HederaContractAddress, nativeTokenPrice
        );
      default:
        throw new Error("Unsupported chain for NFT actions");
    }
  }
}
export default NftTCOFactory;
