import { defineStore } from 'pinia'
import {
  OrderSide,
  TradeExecutionSide,
  TradeExecutionType
} from '@injectivelabs/ts-types'
import {
  UiSpotTrade,
  UiSpotLimitOrder,
  UiSpotTransformer,
  UiSpotOrderHistory,
  UiSpotMarketSummary,
  zeroSpotMarketSummary,
  UiSpotMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import {
  cancelBankBalanceStream,
  cancelSubaccountBalanceStream
} from '../account/stream'
import { spotCacheApi } from '@/app/providers/cache/SpotCacheApi'
import {
  streamTrades,
  cancelTradesStream,
  streamOrderbookUpdate,
  streamSubaccountTrades,
  streamSubaccountOrders,
  cancelOrderbookUpdateStream,
  cancelSubaccountOrdersStream,
  cancelSubaccountTradesStream,
  streamSubaccountOrderHistory,
  cancelSubaccountOrdersHistoryStream
} from '@/store/spot/stream'
import {
  cancelOrder,
  batchCancelOrder,
  submitLimitOrder,
  submitMarketOrder,
  submitStopLimitOrder,
  submitStopMarketOrder
} from '@/store/spot/message'
import {
  tokenService,
  indexerSpotApi,
  tokenServiceStatic
} from '@/app/Services'
import {
  MARKETS_SLUGS,
  TRADE_MAX_SUBACCOUNT_ARRAY_SIZE
} from '@/app/utils/constants'
import { combineOrderbookRecords } from '@/app/utils/market'
import { UiMarketTransformer } from '@/app/client/transformers/UiMarketTransformer'
import {
  UiMarketAndSummary,
  ActivityFetchOptions,
  UiSpotOrderbookWithSequence
} from '@/types'

type SpotStoreState = {
  markets: UiSpotMarketWithToken[]
  marketIdsFromQuery: string[]
  marketsSummary: UiSpotMarketSummary[]
  orderbook?: UiSpotOrderbookWithSequence
  trades: UiSpotTrade[]
  subaccountTrades: UiSpotTrade[]
  subaccountTradesCount: number
  subaccountOrders: UiSpotLimitOrder[]
  subaccountOrdersCount: number
  subaccountOrderHistory: UiSpotOrderHistory[]
  subaccountOrderHistoryCount: number
}

const initialStateFactory = (): SpotStoreState => ({
  markets: [],
  marketIdsFromQuery: [],
  marketsSummary: [],
  orderbook: undefined,
  trades: [],
  subaccountTrades: [],
  subaccountTradesCount: 0,
  subaccountOrders: [] as UiSpotLimitOrder[],
  subaccountOrdersCount: 0,
  subaccountOrderHistory: [] as UiSpotOrderHistory[],
  subaccountOrderHistoryCount: 0
})

export const useSpotStore = defineStore('spot', {
  state: (): SpotStoreState => initialStateFactory(),
  getters: {
    buys: (state) => state.orderbook?.buys || [],
    sells: (state) => state.orderbook?.sells || [],

    activeMarketIds: (state) =>
      state.markets
        .filter(
          ({ slug, marketId }) =>
            MARKETS_SLUGS.spot.includes(slug) ||
            state.marketIdsFromQuery.includes(marketId)
        )
        .map((m) => m.marketId),

    tradeableDenoms: (state) =>
      [...state.markets].reduce((denoms, market) => {
        if (!denoms.includes(market.baseDenom)) {
          denoms.push(market.baseDenom)
        }

        if (!denoms.includes(market.quoteDenom)) {
          denoms.push(market.quoteDenom)
        }

        return denoms
      }, [] as string[]),

    marketsWithSummary: (state) =>
      state.markets
        .map((market) => ({
          market,
          summary: state.marketsSummary.find(
            (summary) => summary.marketId === market.marketId
          )
        }))
        .filter((summary) => summary) as UiMarketAndSummary[]
  },
  actions: {
    streamTrades,
    cancelTradesStream,
    streamOrderbookUpdate,
    streamSubaccountOrders,
    streamSubaccountTrades,
    cancelOrderbookUpdateStream,
    streamSubaccountOrderHistory,

    cancelOrder,
    cancelSubaccountOrdersStream,
    cancelSubaccountTradesStream,
    cancelSubaccountOrdersHistoryStream,

    batchCancelOrder,
    submitLimitOrder,
    submitMarketOrder,
    submitStopLimitOrder,
    submitStopMarketOrder,

    async init() {
      const spotStore = useSpotStore()
      const tokenStore = useTokenStore()

      const markets = await spotCacheApi.fetchMarkets()
      const marketsWithToken =
        tokenServiceStatic.toSpotMarketsWithToken(markets)
      const marketsFromQuery = markets.filter((market) =>
        spotStore.marketIdsFromQuery.includes(market.marketId)
      )
      const marketsFromQueryWithToken =
        await tokenService.toSpotMarketsWithToken(marketsFromQuery)

      const marketsWithTokenAndQuery = [
        ...marketsWithToken,
        ...marketsFromQueryWithToken
      ]
      const uiMarkets = UiSpotTransformer.spotMarketsToUiSpotMarkets(
        marketsWithTokenAndQuery
      )

      const uiMarketsWithToken = uiMarkets
        .filter((market) => {
          return (
            MARKETS_SLUGS.spot.includes(market.slug) ||
            spotStore.marketIdsFromQuery.includes(market.marketId)
          )
        })
        .sort((a, b) => {
          return (
            MARKETS_SLUGS.spot.indexOf(a.slug) -
            MARKETS_SLUGS.spot.indexOf(b.slug)
          )
        })

      spotStore.$patch({
        markets: uiMarketsWithToken
      })

      await spotStore.fetchMarketsSummary()
      await tokenStore.appendUnknownTokensList([
        ...marketsFromQueryWithToken.map((m) => m.baseToken),
        ...marketsFromQueryWithToken.map((m) => m.quoteToken)
      ])
    },

    async initIfNotInit() {
      const spotStore = useSpotStore()

      const marketsAlreadyFetched = spotStore.markets.length

      if (marketsAlreadyFetched) {
        await spotStore.fetchMarketsSummary()
      } else {
        await spotStore.init()
      }
    },

    async initFromTradingPage(marketIdsFromQuery: string[] = []) {
      const spotStore = useSpotStore()

      spotStore.$patch({
        marketIdsFromQuery
      })

      if (marketIdsFromQuery.length === 0) {
        await spotStore.initIfNotInit()
      } else {
        await spotStore.init()
      }
    },

    async fetchSubaccountOrders(marketIds?: string[]) {
      const spotStore = useSpotStore()
      const accountStore = useAccountStore()
      const walletStore = useWalletStore()

      if (!walletStore.isUserWalletConnected || !accountStore.subaccountId) {
        return
      }

      const { orders, pagination } = await indexerSpotApi.fetchOrders({
        subaccountId: accountStore.subaccountId,
        marketIds: marketIds || spotStore.activeMarketIds,
        pagination: {
          limit: TRADE_MAX_SUBACCOUNT_ARRAY_SIZE
        }
      })

      spotStore.$patch({
        subaccountOrders: orders,
        subaccountOrdersCount: Math.min(
          pagination.total,
          TRADE_MAX_SUBACCOUNT_ARRAY_SIZE
        )
      })
    },

    async fetchOrdersBySubaccount({
      subaccountId,
      marketIds
    }: {
      subaccountId: string
      marketIds: string[]
    }) {
      const spotStore = useSpotStore()
      const walletStore = useWalletStore()

      if (!walletStore.isUserWalletConnected || !subaccountId) {
        return
      }

      const { orders, pagination } = await indexerSpotApi.fetchOrders({
        subaccountId,
        marketIds: marketIds || spotStore.activeMarketIds,
        pagination: {
          limit: TRADE_MAX_SUBACCOUNT_ARRAY_SIZE
        }
      })

      spotStore.$patch({
        subaccountOrders: orders,
        subaccountOrdersCount: Math.min(
          pagination.total,
          TRADE_MAX_SUBACCOUNT_ARRAY_SIZE
        )
      })
    },

    async fetchSubaccountOrderHistory(options?: ActivityFetchOptions) {
      const spotStore = useSpotStore()
      const accountStore = useAccountStore()
      const walletStore = useWalletStore()

      if (
        !walletStore.isUserWalletConnected ||
        !(accountStore.subaccountId || options?.subaccountId)
      ) {
        return
      }

      const filters = options?.filters

      const { orderHistory, pagination } =
        await indexerSpotApi.fetchOrderHistory({
          subaccountId: options?.subaccountId
            ? options?.subaccountId
            : accountStore.subaccountId,
          direction: filters?.direction,
          pagination: options?.pagination,
          isConditional: filters?.isConditional,
          marketIds: filters?.marketIds || spotStore.activeMarketIds,
          orderTypes: filters?.orderTypes as unknown as OrderSide[],
          executionTypes: filters?.executionTypes as TradeExecutionType[]
        })

      spotStore.$patch({
        subaccountOrderHistory: orderHistory,
        subaccountOrderHistoryCount: pagination.total
      })
    },

    async fetchOrderbook(marketId: string) {
      const spotStore = useSpotStore()

      const currentOrderbookSequence = spotStore.orderbook?.sequence || 0
      const latestOrderbook = await indexerSpotApi.fetchOrderbookV2(marketId)
      const latestOrderbookIsMostRecent =
        latestOrderbook.sequence >= currentOrderbookSequence

      if (latestOrderbookIsMostRecent) {
        spotStore.orderbook = latestOrderbook
      }

      // handle race condition between fetch and stream
      spotStore.orderbook = {
        sequence: latestOrderbookIsMostRecent
          ? latestOrderbook.sequence
          : currentOrderbookSequence,
        buys: combineOrderbookRecords({
          isBuy: true,
          currentRecords: spotStore.orderbook?.buys,
          updatedRecords: latestOrderbook.buys
        }),
        sells: combineOrderbookRecords({
          isBuy: false,
          currentRecords: spotStore.orderbook?.sells,
          updatedRecords: latestOrderbook.sells
        })
      }
    },

    async fetchTrades({
      marketId,
      executionSide
    }: {
      marketId: string
      executionSide?: TradeExecutionSide
    }) {
      const spotStore = useSpotStore()

      const { trades } = await indexerSpotApi.fetchTrades({
        marketIds: [marketId],
        executionSide
      })

      spotStore.$patch({
        trades
      })
    },

    async fetchLastTrade({
      marketId,
      executionSide
    }: {
      marketId: string
      executionSide?: TradeExecutionSide
    }) {
      const { trades } = await indexerSpotApi.fetchTrades({
        marketIds: [marketId],
        executionSide,
        pagination: { limit: 1 }
      })

      return trades[0]
    },

    async fetchSubaccountTrades(options?: ActivityFetchOptions) {
      const spotStore = useSpotStore()
      const accountStore = useAccountStore()
      const walletStore = useWalletStore()

      if (!walletStore.isUserWalletConnected || !accountStore.subaccountId) {
        return
      }

      const filters = options?.filters

      const { trades, pagination } = await indexerSpotApi.fetchTrades({
        subaccountId: accountStore.subaccountId,
        direction: filters?.direction,
        pagination: options?.pagination,
        marketIds: filters?.marketIds || spotStore.activeMarketIds,
        executionTypes: filters?.executionTypes as TradeExecutionType[]
      })

      spotStore.$patch({
        subaccountTrades: trades,
        subaccountTradesCount: pagination.total
      })
    },

    async fetchMarketsSummary() {
      const spotStore = useSpotStore()

      const { markets } = spotStore

      try {
        const marketSummaries = await spotCacheApi.fetchMarketsSummary()

        const marketsWithoutMarketSummaries = marketSummaries.filter(
          ({ marketId }) =>
            !markets.some((market) => market.marketId === marketId)
        )

        spotStore.$patch({
          marketsSummary: [
            ...marketSummaries.map(
              UiMarketTransformer.convertMarketSummaryToUiMarketSummary
            ),
            ...marketsWithoutMarketSummaries.map(({ marketId }) =>
              zeroSpotMarketSummary(marketId)
            )
          ]
        })
      } catch (e) {
        // don't do anything for now
      }
    },

    cancelSubaccountStream() {
      cancelBankBalanceStream()
      cancelSubaccountBalanceStream()
      cancelSubaccountOrdersStream()
      cancelSubaccountTradesStream()
      cancelSubaccountOrdersHistoryStream()
    },

    resetOrderbookAndTrades() {
      const spotStore = useSpotStore()

      spotStore.$patch({
        trades: [],
        orderbook: undefined
      })
    },

    resetSubaccount() {
      const spotStore = useSpotStore()

      const {
        subaccountOrders,
        subaccountTrades,
        subaccountOrdersCount,
        subaccountTradesCount,
        subaccountOrderHistory,
        subaccountOrderHistoryCount
      } = initialStateFactory()

      spotStore.cancelSubaccountStream()

      spotStore.$patch({
        subaccountOrders,
        subaccountTrades,
        subaccountTradesCount,
        subaccountOrdersCount,
        subaccountOrderHistory,
        subaccountOrderHistoryCount
      })
    },

    reset() {
      const spotStore = useSpotStore()

      const { trades, orderbook, subaccountOrders, subaccountTrades } =
        initialStateFactory()

      spotStore.$patch({
        trades,
        orderbook,
        subaccountOrders,
        subaccountTrades
      })
    }
  }
})
