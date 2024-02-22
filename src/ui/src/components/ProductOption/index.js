import React, { useEffect, useState } from 'react'

import {
  Container,
  WrapHeader,
  TitleContainer,
  Title,
  Flag,
  OptionThumbnail
} from './styles'

import { ProductOption as ProductOptionController, useLanguage } from '~components'
import { Alert } from '~ui'

const ProductOptionUI = (props) => {
  const {
    children,
    option,
    currentState,
    isAlsea,
    alseaIngredientsValidation
  } = props

  const [, t] = useLanguage()
  const [incrementPriceAlert, setIncrementPriceAlert] = useState(false)
  const [disableIncrementAlert, setDisableIncrementAlert] = useState(false)

  let maxMin = `${t('MIN', 'Min')}. ${option.min} - ${t('MAX', 'Max')}. ${option.max}`
  if (option.min === 1 && option.max === 1) {
    maxMin = t('REQUIRED', 'Required')
  } else if (option.min === 0 && option.max > 0) {
    maxMin = `${t('MAX', 'Max')}. ${option.max}`
  } else if (option.min > 0 && option.max === 0) {
    maxMin = `${t('MIN', 'Min')}. ${option.min})`
  }

  useEffect(() => {
    if (!(isAlsea && option?.name?.toLowerCase() === 'elige tus ingredientes' && alseaIngredientsValidation !== 9)) return
    if (alseaIngredientsValidation < currentState?.balance && !disableIncrementAlert) {
      setIncrementPriceAlert(true)
      setDisableIncrementAlert(true)
    }
    if (alseaIngredientsValidation >= currentState?.balance) {
      setDisableIncrementAlert(false)
    }
  }, [currentState])

  return (
    <>
      <Container id={`id_${option?.id}`}>
        <WrapHeader>
          <TitleContainer>
            {option.image && option.image !== '-' && (
              <OptionThumbnail src={option.image} />
            )}
            <Title><span>{option.name}</span></Title>
          </TitleContainer>

          <Flag required={option?.min > 0}>{maxMin}</Flag>
        </WrapHeader>
        {children}
      </Container>
      <Alert
        title={t('PRODUCT_FORM', 'Product form')}
        content={`${t('OPTIONS_PRICE_INCREMENT', 'The price of the product will increase because additional options have been selected')}`}
        open={incrementPriceAlert}
        acceptText={t('ACCEPT', 'Accept')}
        onClose={() => setIncrementPriceAlert(false)}
        onAccept={() => setIncrementPriceAlert(false)}
        closeOnBackdrop={false}
      />
    </>
  )
}

export const ProductOption = (props) => {
  const productOptionProps = {
    ...props,
    UIComponent: ProductOptionUI
  }

  return (
    <ProductOptionController {...productOptionProps} />
  )
}
