import { CostEstimate } from "../types";

/**
 * Logs a standardized TCO (Total Cost of Ownership) cost estimate to the console.
 *
 * @param {string} operation - The name of the operation being logged (e.g. "Mint", "Burn", "Token Swap").
 * @param {CostEstimate} gasEstimate - The cost estimate object containing values such as gas used, gas price, cost in wei, cost in native currency, and cost in USD.
 * @param {string} nativeCurrencySymbol - The symbol of the chain’s native currency (e.g. "ETH", "BNB", "ARB").
 *
 * @return {void} This function does not return a value; it logs cost details to the console.
 */
export function logCostEstimate(
  operation: string,
  gasEstimate: CostEstimate,
  nativeCurrencySymbol: string,
): void {
  const usdCost = Number(gasEstimate.costInUSD).toFixed(6);

  console.log(`\n=== ${operation} ===`);
  console.log(`Gas used: ${gasEstimate.gasUsed.toString()}`);
  console.log(`Gas price: ${gasEstimate.gasPrice ? Number(gasEstimate.gasPrice) / 1e9 : '-'} Gwei`);
  console.log(`Cost in ${nativeCurrencySymbol}: ${Number(gasEstimate.costInNativeCurrency).toFixed(8)}`);
  console.log(`Cost in USD: $${usdCost}`);
}
