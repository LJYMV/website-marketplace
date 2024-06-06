import React from 'react'
import Skeleton from 'react-loading-skeleton'

import { Container } from './styles'
import { useConfig, PaymentOptionPaypal as PaymentPaypalController } from '~components'

const PaymentOptionPaypalUI = (props) => {
  const {
    isSdkReady,
    PaypalButton,
    noAuthMessage,
    paypalButtonProps
  } = props

  return (
    <Container>
      {noAuthMessage
        ? (
        <p>{noAuthMessage}</p>
          )
        : (
            isSdkReady
              ? (
                  PaypalButton && <PaypalButton {...paypalButtonProps} />
                )
              : (
                <div>
                  <Skeleton count={3} height={55} />
                </div>
                )
          )
      }
    </Container>
  )
}

export const PaymentOptionPaypal = (props) => {
  const [{ configs }] = useConfig()
  const paymentPaypalProps = {
    ...props,
    UIComponent: PaymentOptionPaypalUI,
    currency: configs?.stripe_currency?.value
  }
  return (
    <PaymentPaypalController {...paymentPaypalProps} />
  )
}
