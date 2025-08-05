/**
 * A service class for fetching the current prices of Ethereum and Binance Coin (BNB) in USD.
 */
class TokenPriceService {
  static async fetchEthPrice(): Promise<number> {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    const data = await response.json();
    return data.ethereum.usd;
  }

  static async fetchBnbPrice(): Promise<number> {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd');
    const data = await response.json();
    return data.binancecoin.usd;
  }
}

export default TokenPriceService;