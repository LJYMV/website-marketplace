import React, { useEffect, useState } from 'react'

import {
  WrappButton,
  ReviewWrapper
} from './styles'
import { OrdersContainer } from '../OrdersOption/styles'

import { useLanguage } from '~components'
import {
  Button,
  ReviewOrder,
  ReviewProduct,
  ReviewDriver,
  Modal,
  SingleOrderCard
} from '~ui'

export const VerticalOrdersLayout = (props) => {
  const {
    orders,
    pagination,
    loadMoreOrders,
    handleUpdateOrderList,
    setRefreshOrders
  } = props

  const [, t] = useLanguage()
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [reviewStatus, setReviewStatus] = useState({ order: false, product: false, driver: false })
  const [isOrderReviewed, setIsOrderReviewed] = useState(false)
  const [isProductReviewed, setIsProductReviewed] = useState(false)
  const [isDriverReviewed, setIsDriverReviewed] = useState(false)
  const [orderSelected, setOrderSelected] = useState({})

  const closeReviewOrder = () => {
    if (!isProductReviewed) setReviewStatus({ order: false, product: true, driver: false })
    else if (orderSelected?.driver && !orderSelected?.user_review && !isDriverReviewed) setReviewStatus({ order: false, product: false, driver: true })
    else handleCloseReivew()
  }

  const closeReviewProduct = () => {
    if (orderSelected?.driver && !orderSelected?.user_review && !isDriverReviewed) setReviewStatus({ order: false, product: false, driver: true })
    else {
      setIsDriverReviewed(true)
      handleCloseReivew()
    }
  }
  const handleOpenReview = () => {
    if (!orderSelected?.review && !isOrderReviewed) setReviewStatus({ order: true, product: false, driver: false })
    else if (!isProductReviewed) setReviewStatus({ order: false, product: true, driver: false })
    else if (orderSelected?.driver && !orderSelected?.user_review && !isDriverReviewed) setReviewStatus({ order: false, product: false, driver: true })
    else {
      setIsReviewOpen(false)
      return
    }
    setIsReviewOpen(true)
  }

  const handleCloseReivew = () => {
    setReviewStatus({ order: false, product: false, driver: false })
    setIsReviewOpen(false)
    setRefreshOrders(true)
  }

  const handleClickReview = (order) => {
    handleOpenReview && handleOpenReview()
  }

  useEffect(() => {
    if (!orderSelected?.id) return
    handleClickReview()
  }, [orderSelected])

  return (
    <>
      <OrdersContainer id='orders-container'>
        {orders.map(order => (
          <SingleOrderCard
            {...props}
            key={order.id || order.id?.[0]}
            order={order}
            setOrderSelected={setOrderSelected}
          />
        ))}
      </OrdersContainer>
      {pagination.totalPages && pagination.currentPage < pagination.totalPages && (
        <WrappButton>
          <Button
            outline
            color='primary'
            bgtransparent
            onClick={loadMoreOrders}
          >
            {t('LOAD_MORE_ORDERS', 'Load more orders')}
          </Button>
        </WrappButton>
      )}
      {isReviewOpen && (
        <Modal
          open={isReviewOpen}
          onClose={handleCloseReivew}
          title={orderSelected
            ? (reviewStatus?.order
                ? t('REVIEW_ORDER', 'Review order')
                : (reviewStatus?.product
                    ? t('REVIEW_PRODUCT', 'Review Product')
                    : t('REVIEW_DRIVER', 'Review Driver')))
            : t('LOADING', 'Loading...')}
        >
          <ReviewWrapper>
            {
              reviewStatus?.order
                ? <ReviewOrder order={orderSelected} closeReviewOrder={closeReviewOrder} setIsReviewed={setIsOrderReviewed} handleUpdateOrderList={handleUpdateOrderList} />
                : (reviewStatus?.product
                    ? <ReviewProduct order={orderSelected} closeReviewProduct={closeReviewProduct} setIsProductReviewed={setIsProductReviewed} />
                    : <ReviewDriver order={orderSelected} closeReviewDriver={handleCloseReivew} setIsDriverReviewed={setIsDriverReviewed} />)
            }
          </ReviewWrapper>

        </Modal>
      )}
    </>
  )
}
