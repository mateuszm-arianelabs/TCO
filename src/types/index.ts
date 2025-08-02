import {Address, Chain} from "viem";

export interface ChainConfig {
    chain: Chain
    rpc: string
    factory: Address
    router: Address
    weth: Address
    swapToken1: Address
    swapToken2: Address
    newToken1: Address
    newToken2: Address
}