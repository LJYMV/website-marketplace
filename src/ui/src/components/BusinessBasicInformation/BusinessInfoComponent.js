import React, { useState } from 'react'
import { StarFill, Facebook, Tiktok, Pinterest, Whatsapp, Instagram, Snapchat } from 'react-bootstrap-icons'
import Skeleton from 'react-loading-skeleton'
import { useTheme } from 'styled-components'

import {
  BusinessDetail,
  BusinessInfo,
  BusinessInfoContainer,
  BusinessInfoContent,
  BusinessInfoItem,
  IconWrapper,
  RibbonBox,
  SearchContainer,
  SocialList,
  TitleWrapper
} from './styles'

import { SocialNetWork } from './SocialNetWork'
import { SearchComponent } from './SearchComponent'

import { useConfig, useLanguage, useOrder, useUtils } from '~components'
import {
  BusinessReservation,
  Button,
  Modal,
  convertHoursToMinutes,
  lightenDarkenColor,
  shape,
  useWindowSize
} from '~ui'

export const BusinessInfoComponent = (props) => {
  const {
    loading,
    business,
    isInfoShrunken,
    isCustomerMode,
    setIsPreOrder,
    setIsBusinessReviews,
    categoryState,
    searchValue,
    errorQuantityProducts,
    setOpenSearchProducts,
    handleChangeSortBy,
    sortByValue,
    sortByOptions,
    isCustomLayout,
    currentCart
  } = props
  const theme = useTheme()
  const [orderState] = useOrder()
  const [{ parsePrice, parseDistance }] = useUtils()
  const [{ configs }] = useConfig()
  const [, t] = useLanguage()
  const windowSize = useWindowSize()
  const [openReservations, setOpenReservations] = useState(false)
  const hideDeliveryFee = theme?.business_view?.components?.header?.components?.business?.components?.fee?.hidden
  const hideTime = theme?.business_view?.components?.header?.components?.business?.components?.time?.hidden
  const hideReviews = theme?.business_view?.components?.header?.components?.business?.components?.reviews?.hidden
  const hideReviewsPopup = theme?.business_view?.components?.reviews?.hidden
  const hideDistance = theme?.business_view?.components?.header?.components?.business?.components?.distance?.hidden
  const hideCity = theme?.business_view?.components?.header?.components?.business?.components?.city?.hidden
  const layoutsWithOldSearch = ['starbucks', 'old', 'floating']
  const hideSearch = layoutsWithOldSearch.includes(theme?.business_view?.components?.product_search?.components?.layout?.type)
  const isPreOrderSetting = configs?.preorder_status_enabled?.value === '1'
  const singleBusinessRedirect = window.localStorage.getItem('single_business')
  const businessConfig = business?.configs?.find(config => config?.key === 'reservation_setting')
  const reservationSetting = businessConfig ? JSON.parse(businessConfig?.value || '{}') : JSON.parse(configs?.reservation_setting?.value || '{}')
  const searchComponentProps = {
    setOpenSearchProducts,
    handleChangeSortBy,
    sortByValue,
    sortByOptions
  }

  return (
    <BusinessInfoContainer isFlexEnd={windowSize.width >= 768}>
      <BusinessInfoContent>
        <BusinessInfo className='info'>
          <BusinessInfoItem isInfoShrunken={isInfoShrunken}>
            {!loading
              ? (
                <TitleWrapper isCustomLayout={isCustomLayout} disableLeftSpace={singleBusinessRedirect}>
                  <h2 className='bold' id='business_name'>{business?.name}</h2>
                  <span id='business_name_feedback' />
                  {business?.ribbon?.enabled && (
                    <RibbonBox
                      bgColor={business?.ribbon?.color}
                      colorText={lightenDarkenColor(business?.ribbon?.color)}
                      borderRibbon={lightenDarkenColor(business?.ribbon?.color)}
                      isRoundRect={business?.ribbon?.shape === shape?.rectangleRound}
                      isCapsule={business?.ribbon?.shape === shape?.capsuleShape}
                    >
                      {business?.ribbon?.text}
                    </RibbonBox>
                  )}
                </TitleWrapper>
                )
              : (
                <Skeleton width={isCustomerMode ? 100 : 150} height={isCustomerMode ? 35 : 'auto'} />
                )}
            {typeof hideCity !== 'undefined' && !hideCity && business?.city?.name && (
              <>
                {!loading
                  ? (
                    <p className='type'>{business?.city?.name}</p>
                    )
                  : (
                    <Skeleton width={isCustomerMode ? 100 : 150} />
                    )}
              </>
            )}
            {!loading
              ? (
                <SocialList>
                  {business?.facebook_profile && (
                    <SocialNetWork
                      url={business?.facebook_profile}
                      icon={<Facebook />}
                    />
                  )}
                  {business?.instagram_profile && (
                    <SocialNetWork
                      url={business?.instagram_profile}
                      icon={<Instagram />}
                    />
                  )}
                  {business?.tiktok_profile && (
                    <SocialNetWork
                      url={business?.tiktok_profile}
                      icon={<Tiktok />}
                    />
                  )}
                  {business?.pinterest_profile && (
                    <SocialNetWork
                      url={business?.pinterest_profile}
                      icon={<Pinterest />}
                    />
                  )}
                  {business?.whatsapp_number && (
                    <SocialNetWork
                      url={business?.whatsapp_number}
                      icon={<Whatsapp />}
                    />
                  )}
                  {business?.snapchat_profile && (
                    <SocialNetWork
                      url={business?.snapchat_profile}
                      icon={<Snapchat />}
                    />
                  )}
                </SocialList>
                )
              : (
                <SocialList>
                  {[...Array(5).keys()].map(i => (
                    <IconWrapper isSkeleton key={i}>
                      <Skeleton width={27} height={27} />
                    </IconWrapper>
                  ))}
                </SocialList>
                )}
            <BusinessDetail isSkeleton={loading}>
              {orderState?.options.type === 1 && !hideDeliveryFee && (
                <>
                  {!loading
                    ? (
                      <>
                        <h5>
                          <span>{t('DELIVERY_FEE', 'Delivery fee')}</span>
                          {business && parsePrice(business?.delivery_price || 0)}
                        </h5>
                        <span className='dot'>•</span>
                      </>
                      )
                    : (
                      <Skeleton width={isCustomerMode ? 70 : 50} />
                      )}
                </>
              )}
              {!hideTime && (
                <>
                  {!loading
                    ? (
                      <>
                        {orderState?.options?.type === 1
                          ? (
                            <>
                              <h5>
                                {convertHoursToMinutes(business?.delivery_time)}
                              </h5>
                              <span className='dot'>•</span>
                            </>
                            )
                          : (
                            <>
                              <h5>
                                {convertHoursToMinutes(business?.pickup_time)}
                              </h5>
                              <span className='dot'>•</span>
                            </>
                            )}
                      </>
                      )
                    : (
                      <Skeleton width={isCustomerMode ? 70 : 50} />
                      )}
                </>
              )}
              {!hideDistance && (
                <>
                  {!loading
                    ? (
                      <>
                        <h5>
                          {parseDistance(business?.distance || 0)}
                        </h5>
                        <span className='dot'>•</span>
                      </>
                      )
                    : (
                      <Skeleton width={isCustomerMode ? 70 : 50} />
                      )}
                </>
              )}
              {!hideReviews && (
                <>
                  {!loading
                    ? (
                      <div className='review'>
                        <StarFill className='start' />
                        <p>{business?.reviews?.total}</p>
                      </div>
                      )
                    : (
                      <Skeleton width={isCustomerMode ? 100 : 50} />
                      )}
                </>
              )}
            </BusinessDetail>
            {
              !loading
                ? (
                  <div className='preorder-Reviews'>
                    {isPreOrderSetting && (
                      <>
                        <span onClick={() => setIsPreOrder(true)}>{isCustomerMode ? t('CHANGE_SCHEDULE', 'Change schedule') : t('PREORDER', 'Preorder')}</span>
                        <span className='dot'>•</span>
                      </>
                    )}
                    {business.reviews?.reviews && !hideReviewsPopup && !isCustomerMode && <span onClick={() => setIsBusinessReviews(true)}>{t('REVIEWS', 'Reviews')}</span>}
                  </div>
                  )
                : (
                  <Skeleton width={isCustomerMode ? 100 : 150} />
                  )
            }
          </BusinessInfoItem>
        </BusinessInfo>
      </BusinessInfoContent>
      {
        // (categoryClicked || windowSize.width >= 993) &&
        (
          <>
            <SearchContainer>
              {(!loading &&
                !currentCart?.reservation) &&
                orderState?.options?.type === 9 &&
                categoryState?.products?.length !== 0 &&
                (reservationSetting?.allow_preorder_reservation || (currentCart?.products?.length === 0)) &&
                (
                  <Button onClick={() => setOpenReservations(true)}>
                    {t('RESERVATIONS', 'Reservations')}
                  </Button>
                )}
              {
                !hideSearch &&
                (categoryState?.products?.length !== 0 || searchValue) &&
                !errorQuantityProducts &&
                !isInfoShrunken &&
                !business?.professionals?.length && (
                  <SearchComponent {...searchComponentProps} />
                )
              }
            </SearchContainer>
          </>
        )}
      <Modal
        title={business?.name}
        open={openReservations}
        disableDefaultStyleOnRender
        onClose={() => setOpenReservations(false)}
      >
        <BusinessReservation
          cart={currentCart}
          business={business}
          isCustomerMode={isCustomerMode}
          scheduleList={business?.schedule}
          setOpenReservations={setOpenReservations}
        />
      </Modal>
    </BusinessInfoContainer>
  )
}
