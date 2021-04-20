import React, { useState, useCallback } from 'react'
import styled from 'styled-components'
import { Separator } from 'components/Menu'
import { ArrowDown, AlertTriangle } from 'react-feather'
import { ButtonPrimary } from 'components/Button'
import { Currency, Token } from '@uniswap/sdk'
import { useCurrencyBalances } from 'state/wallet/hooks'
import { SHORT_PRECISION } from 'constants/index'
import { colors } from 'theme'
import Loader from 'components/Loader'

const COLOUR_SHEET = colors(false)

const Wrapper = styled.div`
  ${({ theme }) => theme.flexColumnNoWrap}
  background: ${({ theme }) => theme.bg2};
  align-items: center;
  justify-content: center;
  margin: 0.3rem auto 0;
  padding: 1rem;
  width: 100%;

  border-radius: ${({ theme }) => theme.buttonPrimary.borderRadius};
  font-size: smaller;

  > ${Separator} {
      margin: -0.3rem 0 0.6rem 0;
      width: 83%;
  }

  > ${ButtonPrimary} {
      // TODO: @biocom themed
      background: #62d9ff;
      width: 75%;
      padding: 0.4rem;
      margin-top: 0.3rem;

      &:disabled {
        // TODO: @biocom disabled prop should already do this
        background-color: ${({ theme }) => theme.disabled}
      }
  }
`
const WarningWrapper = styled(Wrapper)`
  ${({ theme }) => theme.flexRowNoWrap}
  padding: 0rem;

  color: ${({ theme }) => theme.red1};
  font-weight: 600;
  font-size: small;

  // warning logo
  > svg {
    margin-right: 0.5rem;
  }

  // warning text
  > div {
    ${({ theme }) => theme.flexColumnNoWrap}
    align-items: flex-start;
    justify-content: center;
    font-size: 90%;
  }
`

const BalanceLabel = styled.p<{ background?: string }>`
  display: flex;
  justify-content: space-between;
  width: 90%;
  padding: 0.5rem 0.7rem;
  margin: 0.5rem 0;

  border-radius: ${({ theme }) => theme.buttonPrimary.borderRadius};

  background: ${({ background = 'initial' }) => background};

  > span {
    &:first-child {
      margin-right: auto;
    }
  }
`

export interface Props {
  account?: string
  native: Currency
  wrapped: Token
  wrapCallback: () => Promise<void>
}

export default function EthWethWrap({ account, native, wrapped, wrapCallback }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [nativeBalance, wrappedBalance] = useCurrencyBalances(account, [native, wrapped])

  const wrappedSymbol = wrapped.symbol || 'wrapped native token'
  const nativeSymbol = native.symbol || 'native token'

  const handleWrap = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      await wrapCallback()
    } catch (error) {
      console.error('Error wrapping ETH:', error)

      setError(new Error(error))
    } finally {
      setLoading(false)
    }
  }, [wrapCallback])

  return (
    <Wrapper>
      <WarningWrapper>
        <AlertTriangle size={30} />
        <div>
          <span>Only {wrappedSymbol} can be used to swap.</span>
          <span>
            Wrap your {nativeSymbol} first or switch to {wrappedSymbol}
          </span>
          {error && (
            <span>
              <strong>{error.message}</strong>
            </span>
          )}
        </div>
      </WarningWrapper>
      <BalanceLabel>
        <span>{nativeSymbol} balance:</span> <span>{nativeBalance?.toSignificant(SHORT_PRECISION) || '-'}</span>
      </BalanceLabel>
      <Separator />
      <ArrowDown size={18} color={COLOUR_SHEET.primary1} />
      <BalanceLabel background={COLOUR_SHEET.bg1}>
        <span>{wrappedSymbol} balance:</span>
        <span>{wrappedBalance?.toSignificant(SHORT_PRECISION) || '-'}</span>
      </BalanceLabel>
      <ButtonPrimary disabled={loading} padding="0.5rem" onClick={handleWrap}>
        {loading ? <Loader /> : `Wrap my ${nativeSymbol}`}
      </ButtonPrimary>
    </Wrapper>
  )
}