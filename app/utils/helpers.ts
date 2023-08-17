import {
  BigNumber,
  BigNumberInWei,
  BigNumberInBase
} from '@injectivelabs/utils'
import { Network } from '@injectivelabs/networks'
import { UiSpotMarketWithToken } from '@injectivelabs/sdk-ui-ts'
import { UI_DEFAULT_DISPLAY_DECIMALS, NETWORK, ENDPOINTS } from './constants'
import { hexToString, stringToHex } from './converters'
import { UiMarketWithToken } from '@/types'

export const getDecimalsBasedOnNumber = (
  number: number | string | BigNumber,
  defaultDecimals = UI_DEFAULT_DISPLAY_DECIMALS
): { number: BigNumberInBase; decimals: number } => {
  const actualNumber = new BigNumber(number)

  if (actualNumber.gte(1e6)) {
    return {
      number: new BigNumberInBase(actualNumber.toFixed(0)),
      decimals: 0
    }
  }

  if (actualNumber.gte(1e4)) {
    return {
      number: new BigNumberInBase(actualNumber.toFixed(1)),
      decimals: 1
    }
  }

  return {
    number: new BigNumberInBase(actualNumber.toFixed(defaultDecimals)),
    decimals: defaultDecimals
  }
}

export const getChronosDatafeedEndpoint = (marketType: string): string => {
  return `${ENDPOINTS.indexer}/api/chronos/v1/${marketType}`
}

export const getHubUrl = (): string => {
  if ([Network.Devnet, Network.Local].includes(NETWORK)) {
    return 'https://devnet.hub.injective.dev'
  }

  if ([Network.Testnet, Network.TestnetK8s].includes(NETWORK)) {
    return 'https://hub.injective.dev'
  }

  return 'https://hub.injective.network'
}

export const getSubaccountIndex = (subaccount: string) =>
  parseInt(subaccount.slice(42), 16)

export function getMinQuantityTickSize(
  isSpot: boolean,
  market: UiMarketWithToken
) {
  if (!isSpot) {
    return market.minQuantityTickSize
  }

  const spotMarket = market as UiSpotMarketWithToken

  return market.quoteToken && spotMarket.baseToken
    ? new BigNumberInWei(market.minQuantityTickSize)
        .toBase(spotMarket.baseToken.decimals)
        .toFixed()
    : ''
}

export const addressAndMarketSlugToSubaccountId = (
  ethAddress: string,
  slug: string
) => {
  const marketHex = stringToHex(slug)

  return `${ethAddress}${'0'.repeat(66 - 42 - marketHex.length)}${marketHex}`
}

export const isSgtSubaccountId = (subaccountId: string) => {
  const MAX_ALLOWED_INDEX = 1000 /** TODO */
  const subaccountIdPrefix = subaccountId.slice(42).replace(/^0+/, '')
  const subaccountIdIndex = parseInt(subaccountIdPrefix, 10)

  return subaccountIdIndex > MAX_ALLOWED_INDEX
}

export const getMarketIdFromSubaccountId = (subaccountId: string) => {
  if (isSgtSubaccountId(subaccountId)) {
    return ''
  }

  return hexToString(subaccountId.slice(42).replace(/^0+/, ''))
}

export function getMinPriceTickSize(
  isSpot: boolean,
  market: UiMarketWithToken
) {
  if (!isSpot) {
    return new BigNumberInWei(market.minPriceTickSize)
      .toBase(market.quoteToken.decimals)
      .toFixed()
  }

  const spotMarket = market as UiSpotMarketWithToken

  return spotMarket.baseToken
    ? new BigNumberInWei(market.minPriceTickSize)
        .toBase(spotMarket.quoteToken.decimals - spotMarket.baseToken.decimals)
        .toFixed()
    : ''
}
