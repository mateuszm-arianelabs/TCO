import EvmSwapTokensTCO from "./evmSwapTokensTCO";
import { ChainConfig, ChainNames } from "../types";
import TokenPriceService from "../utils/tokenPriceService";

class SwapTCOFactory {
  static async createSwapTCO(config: ChainConfig, privateKey: `0x${string}`, publicKey: `0x${string}`, artifactsPath: string): Promise<ISwapTokensTCO> {
    switch (config.name) {
      case ChainNames.bsc:
        return new EvmSwapTokensTCO(config, privateKey, publicKey, artifactsPath, await TokenPriceService.fetchBnbPrice());
      case ChainNames.ethereum:
        return new EvmSwapTokensTCO(config, privateKey, publicKey, artifactsPath, await TokenPriceService.fetchEthPrice());
      case ChainNames.arbitrum:
        return new EvmSwapTokensTCO(config, privateKey, publicKey, artifactsPath, await TokenPriceService.fetchEthPrice());
      case ChainNames.base:
        return new EvmSwapTokensTCO(config, privateKey, publicKey, artifactsPath, await TokenPriceService.fetchEthPrice());
      default:
        throw new Error("Unsupported chain - the chain is not supported by the Factory class");
    }
  }
}

export default SwapTCOFactory;