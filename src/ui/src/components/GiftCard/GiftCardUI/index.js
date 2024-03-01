import React, { useState } from 'react'
import BsGift from '@meronex/icons/bs/BsGift'

import { PurchaseGiftCard } from '../PurchaseGiftCard'
import { RedeemGiftCard } from '../RedeemGiftCard'

import {
  Container,
  TitleWrapper,
  ActionWrapper
} from './styles'

import { useLanguage } from '~components'
import { Modal, Button } from '~ui'

export const GiftCardUI = (props) => {
  const [, t] = useLanguage()
  const [openModal, setOpenModal] = useState(null)

  return (
    <Container>
      <TitleWrapper>
        <h1>{t('GIFT_CARD', 'Gift card')}</h1>
        <BsGift />
      </TitleWrapper>
      <ActionWrapper>
        <Button
          color='primary'
          onClick={() => setOpenModal('purchase')}
        >
          {t('PURCHASE_GIFT_CARD', 'Purchase gift card')}
        </Button>
        <Button
          outline
          color='primary'
          className='light'
          onClick={() => setOpenModal('redeem')}
        >
          {t('REDEEM_GIFT_CARD', 'Redeem gift card')}
        </Button>
      </ActionWrapper>
      {openModal === 'purchase' && (
        <Modal
          width='700px'
          padding='0px'
          open={openModal === 'purchase'}
          onClose={() => setOpenModal(null)}
        >
          <PurchaseGiftCard />
        </Modal>
      )}
      {openModal === 'redeem' && (
        <Modal
          width='700px'
          open={openModal === 'redeem'}
          onClose={() => setOpenModal(null)}
        >
          <RedeemGiftCard
            onClose={() => setOpenModal(null)}
          />
        </Modal>
      )}
    </Container>
  )
}
