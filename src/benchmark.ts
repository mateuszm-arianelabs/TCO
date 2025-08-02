interface CostEstimate {
    gasUsed: bigint;
    gasPrice: bigint;
    costInWei: bigint;
    costInBNB: string;
    costInUSD: string;
}

export async function benchmark<T extends () => Promise<CostEstimate>, K>(fn: T): Promise<CostEstimate> {
    const start = new Date();
    const result = await fn();
    const end = new Date();

    const timeMs = end.getTime() - start.getTime();

    console.log(`Time - ${timeMs}ms`)

    return result;
}