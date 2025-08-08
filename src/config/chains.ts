import { arbitrum, base, bsc, mainnet, hederaTestnet } from "viem/chains";
import { ChainConfig, ChainNames } from "../types";

export const CHAINS: Record<string, ChainConfig> = {
  bsc: {
    chain: bsc,
    name: ChainNames.bsc,
    rpc: "https://bsc-rpc.publicnode.com",
    factory: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
    router: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
    weth: {
      address: "0x4DB5a66E937A9F4473fA95b1cAF1d1E1D62E29EA",
      decimals: 18
    },
    operationToken1: {
      address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
      decimals: 18
    },
    operationToken2: {
      address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
      decimals: 18
    },
    newToken1: {
      address: "0x9D173E6c594f479B4d47001F8E6A95A7aDDa42bC",
      decimals: 18
    },
    newToken2: {
      address: "0xfb5B838b6cfEEdC2873aB27866079AC55363D37E",
      decimals: 9
    }
  },
  base: {
    chain: base,
    name: ChainNames.base,
    rpc: "https://mainnet.base.org",
    factory: "0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E",
    router: "0x8cFe327CEc66d1C090Dd72bd0FF11d690C33a2Eb",
    weth: {
      address: "0x4200000000000000000000000000000000000006",
      decimals: 18
    },
    operationToken1: {
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      decimals: 6
    },
    operationToken2: {
      address: "0x3055913c90Fcc1A6CE9a358911721eEb942013A1",
      decimals: 18
    },
    newToken1: {
      address: "0xA202B2b7B4D2fe56BF81492FFDDA657FE512De07",
      decimals: 18
    },
    newToken2: {
      address: "0xc1512B7023A97d54f8Dd757B1F84e132297CA0D7",
      decimals: 18
    }
  },
  arbitrum: {
    chain: arbitrum,
    name: ChainNames.arbitrum,
    rpc: "https://arb1.arbitrum.io/rpc",
    factory: "0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E",
    router: "0x8cFe327CEc66d1C090Dd72bd0FF11d690C33a2Eb",
    weth: {
      address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      decimals: 18
    },
    operationToken1: {
      address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      decimals: 6
    },
    operationToken2: {
      address: "0x912CE59144191C1204E64559FE8253a0e49E6548",
      decimals: 18
    },
    newToken1: {
      address: "0xCBeb19549054CC0a6257A77736FC78C367216cE7",
      decimals: 5
    },
    newToken2: {
      address: "0x25d887Ce7a35172C62FeBFD67a1856F20FaEbB00",
      decimals: 18
    }
  },
  ethereum: {
    chain: mainnet,
    name: ChainNames.ethereum,
    rpc: "https://ethereum-rpc.publicnode.com",
    factory: "0x1097053Fd2ea711dad45caCcc45EfF7548fCB362",
    router: "0xEfF92A263d31888d860bD50809A8D171709b7b1c",
    weth: {
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      decimals: 18
    },
    operationToken1: {
      address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
      decimals: 18
    },
    operationToken2: {
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      decimals: 6
    },
    newToken1: {
      address: "0x8236a87084f8B84306f72007F36F2618A5634494",
      decimals: 8
    },
    newToken2: {
      address: "0x4a220E6096B25EADb88358cb44068A3248254675",
      decimals: 18
    }
  },
  hedera: {
    chain: hederaTestnet,
    name: ChainNames.hedera,
    rpc: "https://testnet.hashio.io/api",
    factory: "0x...placeholder",
    router: "0x...placeholder",
    weth: {
      address: "0x...placeholder",
      decimals: 8
    },
    operationToken1: {
      address: "0x...placeholder",
      decimals: 8
    },
    operationToken2: {
      address: "0x...placeholder",
      decimals: 8
    },
    newToken1: {
      address: "0x...placeholder",
      decimals: 8
    },
    newToken2: {
      address: "0x...placeholder",
      decimals: 8
    }
  }
}