import { I18nMessageFunction } from '@/types'

export default {
  markets: {
    title: 'Markets',
    vol: 'Vol',
    quote: 'Quote',
    market: 'Market',
    airdrop: 'Airdrop',
    category: 'Category',
    whatsNew: "What's new",
    topGainer: 'Top Gainer',
    topVolume: 'Top Volume',
    poweredBy: 'Powered by',
    settledAt: 'Settled at',
    perpetuals: 'Perpetuals',
    newMarkets: 'New Markets',
    showLowVol: 'Show low Vol.',
    emptyHeader: 'No markets found',
    preLaunchFutures: 'Pre Launch Futures',
    expiredOrSettledRecently: 'Recently Expired/Settled',
    emptyHeaderFavorites: 'No favorited markets yet.',
    emptyDescription:
      'No results found. Search for markets available on Injective outside of Helix.',
    emptyDescriptionFavorites: 'Your starred markets will be shown here.',
    inactive: 'Inactive'
  },

  marketPage: {
    assets: 'Assets',
    assetsFrom: 'Assets From',
    asseuitsNote: '',
    balances: 'Balances',
    portfolio: 'Portfolio',
    account: 'Account',
    noTradingBalance: 'Deposit to start trading!',
    noChainBalance: 'We cannot find any token balances for your address.',
    noChainBalanceNote: 'Use Injective Bridge to transfer assets to Injective.',
    noTradingAccountBalance:
      'Transfer to your Injective Trading Account to start trading on Helix.',
    startTrading: 'Start Trading!',
    availableBalance: ({ named }: I18nMessageFunction) =>
      `Available ${named('asset')}`,
    transferToTrade: 'Transfer to trade',
    wallet: 'Wallet'
  }
}
