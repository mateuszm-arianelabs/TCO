import { ChainConfig, ChainNames } from '../types';
import TokenPriceService from "../utils/tokenPriceService";
import EvmNftActionsTCO from './evmNftActionsTCO';
import { INftActionsTCO } from './INftActionsTCO';

class NftTCOFactory {
  static async createNftActionsTCO(
    config: ChainConfig,
    privateKey: `0x${string}`,
    publicKey: `0x${string}`,
    nftAbi: any,
    nftAddress: `0x${string}`
  ): Promise<INftActionsTCO> {
    let nativeTokenPrice: number;

    switch (config.name) {
      case ChainNames.ethereum:
      case ChainNames.arbitrum:
      case ChainNames.base:
        nativeTokenPrice = await TokenPriceService.fetchEthPrice();
        break;
      case ChainNames.bsc:
        nativeTokenPrice = await TokenPriceService.fetchBnbPrice();
        break;
      default:
        throw new Error("Unsupported chain for NFT actions");
    }

    return new EvmNftActionsTCO(
      config,
      privateKey,
      publicKey,
      nftAbi,
      nftAddress,
      nativeTokenPrice
    );
  }
}
export default NftTCOFactory;
