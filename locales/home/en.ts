import { I18nMessageFunction } from '@/types'

export default {
  home: {
    title: 'Open Finance Reimagined',
    subtitle:
      'Explore limitless financial possibilities. Helix provides unmatched access to global financial primitives, endless on-chain gateways, and true institutional liquidity.',
    tradeNow: 'Trade Now',
    latestNews: 'Latest News',
    viewAllMarkets: 'View all markets',
    trending: 'Trending',
    infiniteMarkets: 'Infinite Markets',
    mevResistant: 'MEV Resistant',
    getStartedHome: 'Get Started',
    infrastructure: 'The Premier On-Chain Exchange Infrastructure',
    unprecedentedAccessToGlobalMarkets:
      'Unprecedented Access to Global Markets',
    engage:
      'Engage with performant decentralized exchange primitives, tokenized assets, and sophisticated Web3 markets with a plug-and-play suite of products powering the future of finance.',
    unifiedLiquidity: 'Unified Liquidity',
    unifiedLiquidityDescription:
      'Helix uniquely aggregates unparalleled institutional grade liquidity, enabling anyone to leverage capital efficient financial markets on the world’s first fully decentralized orderbook network.',
    tailoredSolutionsForEveryNeed: 'Tailored Solutions for Every Need',
    utilizeBespoke:
      'Utilize bespoke on-chain gateways to seamlessly interact with leading financial institutions, tokenized assets and sophisticated structured products.',
    helixInstitutional: 'Helix Institutional',
    accessTheFuture: 'Access The Future of Open Finance',
    InstitutionalGateways: 'Institutional Gateways',
    newlyAdded: 'Newly added',
    totalTradingVolume: 'Total trading volume',
    totalTrades: 'Total trades',
    sevenDaysPrice: '7 days price',
    newToCrypto: 'New to Crypto',
    experienceTrader: 'An Experienced Trader',
    institutionalTrader: 'An Institutional Trader',
    builtOn: 'Built on',
    startTradingNote: 'Start Trading on Helix Now',
    whyTradeOnHelix: 'Why Trade on Helix',
    decentralizedWithAdvancedTypeOrders:
      'Decentralized exchange with advanced order types',
    enjoySpotTrading:
      'Enjoy trading spot and perpetual markets on the premier front-running resistant decentralized orderbook exchange using stop-loss and take-profit orders.',
    lowFees: 'Minimal fees for maximum benefits and rewards',
    zeroGasFees:
      'Zero gas fees, low taker fees and highly competitive maker fee rebates for the best trading experience amongst all exchanges.',
    crossChainAssets: 'Cross-chain assets and novel markets',
    seamlesslyTransferAssets:
      'Seamlessly transfer assets from Ethereum and Cosmos networks to trade popular markets as well as unique markets not available elsewhere.',
    getStarted: 'Get Started in 3 Simple Steps',
    howToBridge: 'Transfer assets to begin',
    injective: 'INJECTIVE',
    howToPurchaseTokens: 'Trade spot markets',
    howToPlaceStopOrders: 'Trade perpetuals with advanced orders',
    startTradingNow: 'Start trading now',
    fast: 'Fast',
    interoperable: 'Interoperable',
    gasFree: 'Gas Free',
    secure: 'Secure',
    market: 'Market',
    lastPrice: 'Last price',
    change24h: 'Change (24H)'
  },

  newsletter: {
    title: 'Subscribe to Helix newsletter',
    emailAddress: 'Email address',
    subscribe: 'Subscribe',
    disclaimer: 'Disclaimer',
    privacyPolicy: 'Privacy Policy',
    termsAndCondition: 'Terms and Conditions',
    subscribeToast: "You've successfully subscribed to our newsletter!",
    disclaimerMessage: ({ interpolate, named }: I18nMessageFunction) =>
      interpolate([
        'By subscribing, you agree to the ',
        named('termsAndCondition'),
        ' and have read the ',
        named('privacyPolicy'),
        '.'
      ])
  },

  footer: {
    resources: 'Resources',
    analytics: 'Analytics',
    termsAndConditions: 'Terms & Conditions',
    privacyPolicy: 'Privacy Policy',
    support: 'Support',
    faq: 'FAQ',
    submitRequest: 'Submit A Request',
    institutional: 'Institutional',
    feeDiscounts: 'Fee Discounts',
    apiDocumentation: 'API Documentation',
    community: 'Community',
    helixProvides:
      'Note: Helix is able to provide maker rebates across a number of markets as approved via the Injective DAO.'
  }
}
