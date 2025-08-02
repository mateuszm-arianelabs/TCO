import {arbitrum, base, bsc} from "viem/chains";
import {ChainConfig} from "../types";

export const CHAINS: Record<string, ChainConfig> = {
    bsc: {
        chain: bsc,
        rpc: "https://bsc-rpc.publicnode.com",
        factory: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
        router: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
        weth: "0x4DB5a66E937A9F4473fA95b1cAF1d1E1D62E29EA",
        swapToken1: "0x9D173E6c594f479B4d47001F8E6A95A7aDDa42bC",
        swapToken2: "0xfb5B838b6cfEEdC2873aB27866079AC55363D37E",
        newToken1: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
        newToken2: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82"
    },
    base: {
        chain: base,
        rpc: "https://mainnet.base.org",
        factory: "0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E",
        router: "0x8cFe327CEc66d1C090Dd72bd0FF11d690C33a2Eb",
        weth: "0x4200000000000000000000000000000000000006",
        swapToken1: "0xA202B2b7B4D2fe56BF81492FFDDA657FE512De07",
        swapToken2: "0xc1512B7023A97d54f8Dd757B1F84e132297CA0D7",
        newToken1: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        newToken2: "0x4200000000000000000000000000000000000006"
    },
    arbitrum: {
        chain: arbitrum,
        rpc: "https://arb1.arbitrum.io/rpc",
        factory: "0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E",
        router: "0x8cFe327CEc66d1C090Dd72bd0FF11d690C33a2Eb",
        weth: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
        swapToken1: "0xCBeb19549054CC0a6257A77736FC78C367216cE7",
        swapToken2: "0x25d887Ce7a35172C62FeBFD67a1856F20FaEbB00",
        newToken1: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
        newToken2: "0x912CE59144191C1204E64559FE8253a0e49E6548"
    }
}