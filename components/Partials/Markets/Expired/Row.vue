<script lang="ts" setup>
import { BigNumberInWei, BigNumberInBase } from '@injectivelabs/utils'
import {
  MarketType,
  ZERO_IN_BASE,
  UiDerivativeMarketWithToken,
  UiExpiryFuturesMarketWithToken
} from '@injectivelabs/sdk-ui-ts'
import { format, fromUnixTime } from 'date-fns'
import { UI_DEFAULT_MIN_DISPLAY_DECIMALS } from '@/app/utils/constants'
import { SETTLED_PERP_MARKETS_LAST_PRICE } from '@/app/data/market'
import { toBalanceInToken } from '@/app/utils/formatters'

const tokenStore = useTokenStore()

const props = defineProps({
  market: {
    type: Object as PropType<UiDerivativeMarketWithToken>,
    required: true
  }
})

const lastTradedPrice = computed(() => {
  const settledPerpMarket =
    SETTLED_PERP_MARKETS_LAST_PRICE[props.market.slug as string]

  if (!settledPerpMarket?.price) {
    return
  }

  const token = tokenStore.tokens.find(
    ({ denom }) => denom === settledPerpMarket.denom
  )

  return toBalanceInToken({
    value: settledPerpMarket.price,
    decimalPlaces: token?.decimals || 0
  })
})

const settlementPrice = computed(() => {
  if (!props.market) {
    return ZERO_IN_BASE
  }

  if (props.market.type === MarketType.Spot) {
    return ZERO_IN_BASE
  }

  if (props.market.subType === MarketType.Perpetual) {
    return new BigNumberInBase(lastTradedPrice.value || 0)
  }

  if (props.market.subType === MarketType.BinaryOptions) {
    return ZERO_IN_BASE
  }

  const expiryFuturesMarket = props.market as UiExpiryFuturesMarketWithToken

  if (!expiryFuturesMarket.expiryFuturesMarketInfo) {
    return ZERO_IN_BASE
  }

  if (!expiryFuturesMarket.expiryFuturesMarketInfo.settlementPrice) {
    return ZERO_IN_BASE
  }

  return new BigNumberInWei(
    expiryFuturesMarket.expiryFuturesMarketInfo.settlementPrice
  ).toBase(expiryFuturesMarket.quoteToken.decimals)
})

const { valueToString: settlementPriceToFormat } = useBigNumberFormatter(
  settlementPrice,
  {
    decimalPlaces: Math.min(
      props.market?.priceDecimals || 0,
      UI_DEFAULT_MIN_DISPLAY_DECIMALS
    )
  }
)

const expiryAt = computed(() => {
  if (!props.market) {
    return ''
  }

  if (props.market.type === MarketType.Spot) {
    return ''
  }

  if (props.market.subType === MarketType.BinaryOptions) {
    return ''
  }

  if (props.market.subType === MarketType.Perpetual) {
    return ''
  }

  const derivativeMarket = props.market as UiExpiryFuturesMarketWithToken
  const expiryFuturesMarketInfo = derivativeMarket.expiryFuturesMarketInfo

  if (!expiryFuturesMarketInfo) {
    return ''
  }

  if (!expiryFuturesMarketInfo.expirationTimestamp) {
    return ''
  }

  return format(
    fromUnixTime(expiryFuturesMarketInfo.expirationTimestamp),
    'dd LLL yyyy, HH:mm:ss'
  )
})
</script>

<template>
  <div
    class="grid grid-cols-3 sm:grid-cols-10 3md:grid-cols-12 text-gray-200 gap-4 text-sm px-4 py-2 mb-1 items-center border-b"
    :data-cy="`markets-expired-table-row-${market.ticker}`"
  >
    <span class="text-sm col-span-2 sm:col-span-3 flex items-center">
      <div class="flex items-center">
        <CommonTokenIcon
          v-if="market.baseToken"
          :token="market.baseToken"
          class="mr-3 hidden 3md:block"
        />
        <div class="flex flex-col">
          <span
            class="tracking-wider font-bold mb-1"
            data-cy="markets-ticker-name-table-data"
            >{{ market.ticker }}
          </span>
          <span class="text-gray-500 text-xs hidden md:block">
            {{ market.baseToken.name }}
          </span>
        </div>
      </div>
    </span>

    <!-- Mobile column -->
    <div class="sm:hidden flex flex-col items-end font-mono">
      <div class="flex flex-wrap items-center">
        <div class="w-full flex items-center">
          <span v-if="!settlementPrice.isNaN() && !settlementPrice.isZero()">
            <span class="font-sans">{{ $t('markets.settledAt') }}</span>
            {{ settlementPriceToFormat }} {{ market.quoteToken.symbol }}
          </span>
          <span v-else class="text-gray-400">&mdash;</span>
        </div>
        <div
          v-if="market.subType !== MarketType.Perpetual"
          class="w-full text-gray-500 text-xs"
        >
          {{ expiryAt }}
        </div>
      </div>
    </div>

    <span
      class="hidden font-mono sm:flex sm:flex-wrap items-center justify-end col-span-3"
      data-cy="markets-last-traded-price-table-data"
    >
      <div class="w-full flex items-center justify-end">
        <span
          v-if="!settlementPrice.isNaN() && !settlementPrice.isZero()"
          class="text-right"
        >
          <span class="font-sans">{{ $t('markets.settledAt') }}</span>
          {{ settlementPriceToFormat }} {{ market.quoteToken.symbol }}
        </span>
        <span v-else class="text-gray-400">&mdash;</span>
      </div>
      <div
        v-if="market.subType !== MarketType.Perpetual"
        class="w-full text-gray-500 text-xs text-right"
      >
        {{ expiryAt }}
      </div>
    </span>
  </div>
</template>
