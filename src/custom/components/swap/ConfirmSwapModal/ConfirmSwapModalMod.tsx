import { Trans } from '@lingui/macro'
import { /* Currency,  */ Percent /* , TradeType */ } from '@uniswap/sdk-core'
// import { Trade as V2Trade } from '@uniswap/v2-sdk'
// import { Trade as V3Trade } from '@uniswap/v3-sdk'
import { ReactNode, useCallback, useMemo } from 'react'
import TransactionConfirmationModal, {
  ConfirmationModalContent,
  OperationType,
  TransactionErrorContent,
} from 'components/TransactionConfirmationModal'
import SwapModalFooter from 'components/swap/SwapModalFooter'
import SwapModalHeader from 'components/swap/SwapModalHeader'
// MOD
import TradeGp from 'state/swap/TradeGp'
import { useWalletInfo } from 'hooks/useWalletInfo'

/**
 * Returns true if the trade requires a confirmation of details before we can submit it
 * @param tradeA trade A
 * @param tradeB trade B
 */
/* 
function tradeMeaningfullyDiffers(
  ...args:
    | [V2Trade<Currency, Currency, TradeType>, V2Trade<Currency, Currency, TradeType>]
    | [V3Trade<Currency, Currency, TradeType>, V3Trade<Currency, Currency, TradeType>]
): boolean {
  const [tradeA, tradeB] = args
*/
function tradeMeaningfullyDiffers(tradeA: TradeGp, tradeB: TradeGp): boolean {
  return (
    tradeA.tradeType !== tradeB.tradeType ||
    !tradeA.inputAmount.currency.equals(tradeB.inputAmount.currency) ||
    !tradeA.inputAmount.equalTo(tradeB.inputAmount) ||
    !tradeA.outputAmount.currency.equals(tradeB.outputAmount.currency) ||
    !tradeA.outputAmount.equalTo(tradeB.outputAmount)
  )
}

export default function ConfirmSwapModal({
  trade,
  originalTrade,
  onAcceptChanges,
  allowedSlippage,
  onConfirm,
  onDismiss,
  recipient,
  swapErrorMessage,
  isOpen,
  attemptingTxn,
  txHash,
  PendingTextComponent, // mod
}: {
  isOpen: boolean
  //   trade: V2Trade<Currency, Currency, TradeType> | V3Trade<Currency, Currency, TradeType> | undefined
  // originalTrade: V2Trade<Currency, Currency, TradeType> | V3Trade<Currency, Currency, TradeType> | undefined
  trade: TradeGp | undefined
  originalTrade: TradeGp | undefined
  attemptingTxn: boolean
  txHash: string | undefined
  recipient: string | null
  allowedSlippage: Percent
  onAcceptChanges: () => void
  onConfirm: () => void
  swapErrorMessage: ReactNode | undefined
  onDismiss: () => void
  PendingTextComponent: (props: { trade: TradeGp | undefined }) => JSX.Element // mod
}) {
  const { allowsOffchainSigning } = useWalletInfo()
  const showAcceptChanges = useMemo(
    /* 
    () =>
      Boolean(
        (trade instanceof V2Trade &&
          originalTrade instanceof V2Trade &&
          tradeMeaningfullyDiffers(trade, originalTrade)) ||
          (trade instanceof V3Trade &&
            originalTrade instanceof V3Trade &&
            tradeMeaningfullyDiffers(trade, originalTrade))
      ),
    */
    () => Boolean(trade && originalTrade && tradeMeaningfullyDiffers(trade, originalTrade)),
    [originalTrade, trade]
  )

  const modalHeader = useCallback(() => {
    return trade ? (
      <SwapModalHeader
        trade={trade}
        allowsOffchainSigning={allowsOffchainSigning}
        allowedSlippage={allowedSlippage}
        recipient={recipient}
        showAcceptChanges={showAcceptChanges}
        onAcceptChanges={onAcceptChanges}
      />
    ) : null
  }, [allowedSlippage, onAcceptChanges, recipient, showAcceptChanges, trade, allowsOffchainSigning])

  const modalBottom = useCallback(() => {
    return trade ? (
      <SwapModalFooter onConfirm={onConfirm} disabledConfirm={showAcceptChanges} swapErrorMessage={swapErrorMessage} />
    ) : null
  }, [onConfirm, showAcceptChanges, swapErrorMessage, trade])

  /*
  // text to show while loading
  const pendingText = (
    <Trans>
      Swapping {trade?.inputAmount?.toSignificant(6)} {trade?.inputAmount?.currency?.symbol} for{' '}
      {trade?.outputAmount?.toSignificant(6)} {trade?.outputAmount?.currency?.symbol}
    </Trans>
  )
  */

  const confirmationContent = useCallback(
    () =>
      swapErrorMessage ? (
        <TransactionErrorContent onDismiss={onDismiss} message={swapErrorMessage} />
      ) : (
        <ConfirmationModalContent
          title={<Trans>Confirm Swap</Trans>}
          onDismiss={onDismiss}
          topContent={modalHeader}
          bottomContent={modalBottom}
        />
      ),
    [onDismiss, modalBottom, modalHeader, swapErrorMessage]
  )

  return (
    <TransactionConfirmationModal
      isOpen={isOpen}
      onDismiss={onDismiss}
      attemptingTxn={attemptingTxn}
      hash={txHash}
      content={confirmationContent}
      pendingText={<PendingTextComponent trade={trade} /> /*pendingText*/}
      currencyToAdd={trade?.outputAmount.currency}
      operationType={OperationType.ORDER_SIGN}
    />
  )
}
