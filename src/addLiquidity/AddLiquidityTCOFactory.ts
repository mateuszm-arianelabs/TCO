import { ChainConfig } from "../types";
import TokenPriceService from "../utils/tokenPriceService";
import { ChainNames } from "../types";
import EvmAddLiquidityTCO from "./evmAddLiquidityTCO";

class AddLiquidityTCOFactory {
  static async createAddLiquidityTCO(config: ChainConfig, privateKey: `0x${string}`, publicKey: `0x${string}`, artifactsPath: string): Promise<IAddLiquidityTCO> {
    switch (config.name) {
      case ChainNames.bsc:
        return new EvmAddLiquidityTCO(config, privateKey, publicKey, artifactsPath, await TokenPriceService.fetchBnbPrice());
      case ChainNames.base:
        return new EvmAddLiquidityTCO(config, privateKey, publicKey, artifactsPath, await TokenPriceService.fetchEthPrice());
      case ChainNames.arbitrum:
        return new EvmAddLiquidityTCO(config, privateKey, publicKey, artifactsPath, await TokenPriceService.fetchEthPrice());
      case ChainNames.ethereum:
        return new EvmAddLiquidityTCO(config, privateKey, publicKey, artifactsPath, await TokenPriceService.fetchEthPrice());
      default:
        throw new Error("Unsupported chain - the chain is not supported by the Factory class");
    }
  }
}

export default AddLiquidityTCOFactory;