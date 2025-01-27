import React, { useEffect, useMemo, useState } from 'react'
import {
  Switch,
  Route,
  Redirect,
  Link,
  useLocation,
  useHistory
} from 'react-router-dom'
import parse from 'html-react-parser'
import { useTheme } from 'styled-components'
import PWAPrompt from 'react-ios-pwa-prompt'
import loadable from '@loadable/component'
import settings from './config'

import {
  useSession,
  useApi,
  useLanguage,
  useOrder,
  Analytics,
  FacebookPixel,
  useConfig,
  AnalyticsSegment,
  useEvent,
  useOrderingTheme,
  useSite
} from '~components'

import {
  Alert,
  useWindowSize,
  useOnlineStatus,
  ThemeProvider,
  CancellationComponent,
  SmartAppBanner,
  SpinnerLoader,
  Header,
  Modal,
  Button,
  Input,
  Footer,
  NotNetworkConnectivity,
  NavigationBar,
  ReviewTrigger,
  ReviewOrder,
  ReviewProduct,
  ReviewDriver,
  SignUpApproval,
  QueryLoginSpoonity,
  WebsocketStatus
} from '~ui'

import { lazyRetry } from './components/LazyRetry'

const AddressList = loadable(() => lazyRetry(() => import('./pages/AddressList')))
const BusinessesList = loadable(() => lazyRetry(() => import('./pages/BusinessesList')))
const BusinessProductsList = loadable(() => lazyRetry(() => import('./pages/BusinessProductsList')))
const CheckoutPage = loadable(() => lazyRetry(() => import('./pages/Checkout')))
const Cms = loadable(() => lazyRetry(() => import('./pages/Cms')))
const HomePage = loadable(() => lazyRetry(() => import('./pages/Home')))
const MyOrders = loadable(() => lazyRetry(() => import('./pages/MyOrders')))
const OrderDetailsPage = loadable(() => lazyRetry(() => import('./pages/OrderDetails')))
const PageNotFound = loadable(() => lazyRetry(() => import('./pages/PageNotFound')))
const PagesList = loadable(() => lazyRetry(() => import('./pages/PagesList')))

const ScrollToTop = loadable(() => lazyRetry(() => import('./components/ScrollToTop')))
const ListenPageChanges = loadable(() => lazyRetry(() => import('./components/ListenPageChanges')))
const HelmetTags = loadable(() => lazyRetry(() => import('./components/HelmetTags')))
const Profile = loadable(() => lazyRetry(() => import('./pages/Profile')))
const Wallets = loadable(() => lazyRetry(() => import('./pages/Wallets')))
const MessagesList = loadable(() => lazyRetry(() => import('./pages/MessagesList')))
const Help = loadable(() => lazyRetry(() => import('./pages/Help')))
const Favorite = loadable(() => lazyRetry(() => import('./pages/Favorite')))
const SessionsList = loadable(() => lazyRetry(() => import('./pages/SessionsList')))
const SignUpBusiness = loadable(() => lazyRetry(() => import('./pages/SignUpBusiness')))
const SignUpDriver = loadable(() => lazyRetry(() => import('./pages/SignUpDriver')))
const UserVerification = loadable(() => lazyRetry(() => import('./pages/UserVerification')))
const Promotions = loadable(() => lazyRetry(() => import('./pages/Promotions')))
const ResetPassword = loadable(() => lazyRetry(() => import('./pages/ResetPassword')))
const MultiCheckout = loadable(() => lazyRetry(() => import('./pages/MultiCheckout')))
const MultiCart = loadable(() => lazyRetry(() => import('./pages/MultiCart')))
const MultiOrdersDetails = loadable(() => lazyRetry(() => import('./pages/MultiOrdersDetails')))
const BusinessListingSearch = loadable(() => lazyRetry(() => import('./pages/BusinessListingSearch')))

export const App = () => {
  const history = useHistory()
  const [{ auth, user }, { login }] = useSession()
  const [events] = useEvent()
  const [ordering] = useApi()
  const theme = useTheme()
  const [orderStatus, { changeType, getLastOrderHasNoReview }] = useOrder()
  const [{ configs, loading: configLoading }] = useConfig()
  const [{ loading: siteLoading }] = useSite()
  const [languageState, t] = useLanguage()
  const [orderingTheme] = useOrderingTheme()
  const [loaded, setLoaded] = useState(false)
  const onlineStatus = useOnlineStatus()
  const location = useLocation()
  const [alertState, setAlertState] = useState({ open: false, content: [] })
  const windowSize = useWindowSize()
  const [businessSignUpSuccessed, setBusinessSignUpSuccessed] = useState({ open: false, content: {} })
  const [searchValue, setSearchValue] = useState('')
  const [lastOrderReview, setLastOrderReview] = useState({
    isReviewOpen: false,
    order: null,
    defaultStar: 5,
    reviewStatus: { trigger: false, order: false, product: false, driver: false },
    reviewed: { isOrderReviewed: false, isProductReviewed: false, isDriverReviewed: false }
  })
  const [oneSignalState, setOneSignalState] = useState({
    notification_app: settings.notification_app
  })

  const isShowReviewsPopupEnabled = configs?.show_reviews_popups_enabled?.value === '1'
  const hashKey = new URLSearchParams(useLocation()?.search)?.get('hash') || null
  const isKioskApp = settings?.use_kiosk
  const enabledPoweredByOrdering = configs?.powered_by_ordering_module?.value

  let queryIntegrationToken
  let queryIntegrationCode
  if (location.search) {
    const query = new URLSearchParams(location.search)
    queryIntegrationCode = query.get('integration_code')
    queryIntegrationToken = query.get('integration_token')
  }

  const themeUpdated = useMemo(() => ({
    ...theme,
    ...orderingTheme?.theme,
    colors: {
      ...theme.colors,
      ...(orderingTheme?.theme?.my_products?.components?.theme_settings?.components?.style?.primary_btn_color && { primary: orderingTheme?.theme?.my_products?.components?.theme_settings?.components?.style?.primary_btn_color }),
      ...(orderingTheme?.theme?.my_products?.components?.theme_settings?.components?.style?.primary_link_color && { links: orderingTheme?.theme?.my_products?.components?.theme_settings?.components?.style?.primary_link_color }),
      ...(orderingTheme?.theme?.my_products?.components?.theme_settings?.components?.style?.background_page && { backgroundPage: orderingTheme?.theme?.my_products?.components?.theme_settings?.components?.style?.background_page })
    },
    images: {
      ...theme.images,
      general: {
        ...theme.images.general,
        homeHero: orderingTheme?.theme?.homepage_view?.components?.homepage_header?.components?.image || theme.images?.general?.homeHero,
        businessHero: orderingTheme?.theme?.business_listing_view?.components?.business_hero?.components?.image || theme.images?.general?.businessHero,
        notFound: orderingTheme?.theme?.business_listing_view?.components?.not_found_source?.components?.image || theme.images?.general?.notFound,
        emptyActiveOrders: orderingTheme?.theme?.orders?.components?.active_orders?.components?.not_found_source?.components?.image || theme.images?.general?.emptyActiveOrders,
        emptyPastOrders: orderingTheme?.theme?.orders?.components?.past_orders?.components?.not_found_source?.components?.image,
        notNetwork: orderingTheme?.theme?.no_internet?.components?.image || theme.images?.general?.notNetwork,
        businessSignUpHero: orderingTheme?.theme?.business_signup?.components?.icon?.components?.image || theme.images?.general?.businessSignUpHero,
        driverSignUpHero: orderingTheme?.theme?.driver_signup?.components?.icon?.components?.image || theme.images?.general?.driverSignUpHero
      },
      categories: {
        ...theme.images.categories,
        food: orderingTheme?.theme?.business_listing_view?.components?.categories?.components?.food?.image || theme.images.categories.categoryFood,
        groceries: orderingTheme?.theme?.business_listing_view?.components?.categories?.components?.groceries?.image || theme.images.categories.categoryGroceries,
        alcohol: orderingTheme?.theme?.business_listing_view?.components?.categories?.components?.alcohol?.image || theme.images.categories.categoryAlcohol,
        laundry: orderingTheme?.theme?.business_listing_view?.components?.categories?.components?.laundry?.image || theme.images.categories.categoryLaundry,
        all: orderingTheme?.theme?.business_listing_view?.components?.categories?.components?.all?.image || theme.images.categories.categoryAll
      },
      dummies: {
        ...theme.images.dummies,
        businessHeader: orderingTheme?.theme?.business_view?.components?.header?.components?.dummy_image || theme.images.dummies.businessHeader,
        businessLogo: orderingTheme?.theme?.business_view?.components?.header?.components?.logo?.dummy_image || theme.images.dummies.businessLogo,
        product: orderingTheme?.theme?.business_view?.components?.products?.components?.photo?.components?.dummy_image || theme.images.dummies.product
      },
      logos: {
        ...theme.images.logos,
        logotype: orderingTheme?.theme?.header?.components?.logo?.components?.image || theme.images.logos.logotype
      }
    }
  }), [theme, orderingTheme])

  const websiteThemeType = themeUpdated?.my_products?.components?.website_theme?.components?.type
  const websiteThemeBusinessSlug = themeUpdated?.my_products?.components?.website_theme?.components?.business_slug
  const updatedBusinessSlug = (websiteThemeType === 'single_store' && websiteThemeBusinessSlug) || settings?.businessSlug
  const unaddressedTypes = configs?.unaddressed_order_types_allowed?.value.split('|').map(value => Number(value)) || []
  const franchiseLayout = themeUpdated?.my_products?.components?.website_theme?.components?.franchise_slug
  const isAllowUnaddressOrderType = unaddressedTypes.includes(orderStatus?.options?.type)
  const isFranchiseOne = franchiseLayout === 'franchise_1'
  const businessesSlug = {
    marketplace: 'marketplace',
    kiosk: updatedBusinessSlug,
    business: updatedBusinessSlug
  }

  const singleBusinessConfig = {
    isActive: settings?.use_marketplace || updatedBusinessSlug || isKioskApp,
    businessSlug: businessesSlug[isKioskApp ? 'kiosk' : 'marketplace']
  }

  const signUpBusinesslayout = themeUpdated?.business_signup?.components?.layout?.type === 'old'
    ? 'old'
    : 'new'

  const signUpDriverlayout = themeUpdated?.driver_signup?.components?.layout?.type === 'old'
    ? 'old'
    : 'new'

  const orderTypeSearchParam = parseInt(new URLSearchParams(useLocation()?.search)?.get('order_type') ?? 0, 10)
  const configTypes = configs?.order_types_allowed?.value.split('|').map(value => Number(value)) || []

  const isWalletEnabled = (configs?.cash_wallet?.value && configs?.wallet_enabled?.value === '1' && (configs?.wallet_cash_enabled?.value === '1' || configs?.wallet_credit_point_enabled?.value === '1')) && !isKioskApp
  const isEmailVerifyRequired = auth && configs?.verification_email_required?.value === '1' && !user?.email_verified
  const isPhoneVerifyRequired = auth && configs?.verification_phone_required?.value === '1' && !user?.phone_verified
  const isUserVerifyRequired = (isEmailVerifyRequired || isPhoneVerifyRequired) && !isKioskApp
  const isHideFooter = themeUpdated?.footer?.hidden

  const guestCheckoutEnabled = false
  // configs?.guest_checkout_enabled?.value === '1' &&
  // (!orderTypeList[orderStatus?.options?.type - 1] || configs?.allowed_order_types_guest_checkout?.value?.includes(orderTypeList[orderStatus?.options?.type - 1]))

  const isHome = location.pathname === '/' || location.pathname === '/home'
  const isFooterPage = location.pathname === '/pages/footer' || isKioskApp || isHideFooter

  const closeAlert = () => {
    setAlertState({
      open: false,
      content: []
    })
  }

  const acceptAlert = () => {
    window.localStorage.setItem('front_version', configs?.front_version?.value)
    window.location.reload()
  }

  const handleSuccessSignup = (user) => {
    if (!user?.enabled && (configs?.business_signup_enabled_default?.value === '0' || configs?.driver_signup_enabled_default?.value === '0')) {
      signUpBusinesslayout === 'new'
        ? setBusinessSignUpSuccessed({
          open: true,
          content: {
            approvalType: 'no_automatic',
            businessType: user?.level,
            project: settings.project,
            dashboardUrl: settings.url_dashboard,
            dashboardLoginUrl: `${settings.url_dashboard}/login/?project=${settings.project}&token=${user?.session?.access_token}`,
            contactEmail: settings.contact_email
          }
        })
        : setAlertState({
          open: true,
          content: [t('BUSINESS_SIGNUP_MESSAGE', 'We will contact you as soon as possible')]
        })
      return
    }

    if (configs?.business_signup_enabled_default?.value === '1' || configs?.driver_signup_enabled_default?.value === '1') {
      signUpBusinesslayout === 'new'
        ? setBusinessSignUpSuccessed({
          open: true,
          content: {
            approvalType: 'automatic',
            businessType: user?.level,
            project: settings.project,
            dashboardUrl: settings.url_dashboard,
            dashboardLoginUrl: `${settings.url_dashboard}/login/?project=${settings.project}&token=${user?.session?.access_token}`,
            contactEmail: settings.contact_email
          }
        })
        : setAlertState({
          open: true,
          content: [
          `${t('PROJECT', 'Project')}: ${settings.project}`
          ],
          links: [
          <span key='url dashboard'>
            {`${t('DASHBOARD_WEBPAGE_MESSAGE', 'Dashboard webpage')}: `}
            <a
              target='blank'
              href={`${settings.url_dashboard}/login/?project=${settings.project}&token=${user?.session?.access_token}`}
            >
              <span style={{ color: theme.colors.links }}>{settings.url_dashboard}</span>
            </a>
          </span>
          ],
          isOnlyAlert: true
        })

      login({
        user,
        token: user?.session?.access_token
      })
    }
  }

  const goToPage = (page, params) => {
    events.emit('go_to_page', { page, params })
  }

  const _getLastOrderHasNoReview = async () => {
    const lastOrderHasNoReview = await getLastOrderHasNoReview()
    lastOrderHasNoReview && OrderReviewRequired(lastOrderHasNoReview)
  }

  const reviewModalTitle = () => {
    if (lastOrderReview?.reviewStatus?.trigger) return t('HOW_WAS_YOUR_ORDER', 'How was your order?')
    if (lastOrderReview?.reviewStatus?.order) return t('REVIEW_ORDER', 'Review order')
    if (lastOrderReview?.reviewStatus?.product) return t('REVIEW_PRODUCT', 'Review Product')
    return t('REVIEW_DRIVER', 'Review Driver')
  }

  const OrderReviewRequired = (order) => {
    setLastOrderReview({
      isReviewOpen: !!((location?.pathname === '/' || location?.pathname === '/search' || location?.pathname === '/home')),
      order,
      defaultStar: 5,
      reviewStatus: { trigger: true, order: false, product: false, driver: false },
      reviewed: { isOrderReviewed: false, isProductReviewed: false, isDriverReviewed: false }
    })
  }

  const handleOpenOrderReview = (star) => {
    setLastOrderReview({
      ...lastOrderReview,
      defaultStar: star,
      reviewStatus: { trigger: false, order: true, product: false, driver: false }
    })
  }

  const handleCloseReivew = () => {
    setLastOrderReview({
      ...lastOrderReview,
      isReviewOpen: false,
      reviewStatus: { trigger: false, order: false, product: false, driver: false }
    })
  }

  const setIsReviewed = (reviewType) => {
    const _reviewStatus = { ...lastOrderReview?.reviewed }
    setLastOrderReview({
      ...lastOrderReview,
      reviewed: { ..._reviewStatus, [reviewType]: true }
    })
  }

  const closeReviewOrder = () => {
    const enableProduct = lastOrderReview?.order?.products.some(product => !product?.deleted)
    if (!lastOrderReview?.reviewed?.isProductReviewed && enableProduct) setLastOrderReview({ ...lastOrderReview, reviewStatus: { order: false, product: true, driver: false } })
    else if ((lastOrderReview?.order?.driver || enableProduct) && !lastOrderReview?.order?.user_review && !lastOrderReview?.reviewed?.isDriverReviewed) setLastOrderReview({ ...lastOrderReview, reviewStatus: { order: false, product: false, driver: true } })
    else handleCloseReivew()
  }

  const closeReviewProduct = () => {
    if (lastOrderReview?.order?.driver && !lastOrderReview?.order?.user_review && !lastOrderReview?.reviewed?.isDriverReviewed) setLastOrderReview({ ...lastOrderReview, reviewStatus: { order: false, product: false, driver: true } })
    else {
      setIsReviewed('isDriverReviewed')
      handleCloseReivew()
    }
  }

  useEffect(() => {
    const hasThemeFavicon = themeUpdated?.general?.components?.favicon?.components.image
    if (hasThemeFavicon === undefined) return
    const favicon = document.getElementById('favicon')
    if (!favicon) {
      const link = document.createElement('link')
      link.id = 'favicon'
      link.rel = 'icon'
      link.type = 'image/png'
      link.href = hasThemeFavicon || '/favicon.png'
      document.head.appendChild(link)
    }

    const fonts = Object.entries(themeUpdated?.general?.components?.fonts || {})
    fonts.forEach(([name, fontFamily]) => {
      const fontElement = window.document.getElementById(`${name}-font-styles`)
      if (
        (fontElement?.name !== fontFamily.name && fontFamily.name) ||
        (fontElement?.href !== fontFamily?.href && fontFamily?.href) ||
        (JSON.stringify(fontElement?.weights) !== JSON.stringify(fontFamily?.weights) && fontFamily?.weights)
      ) {
        window.document.body.removeChild(window.document.getElementById(`${name}-font-styles`))
        const font = window.document.createElement('link')
        font.id = `${name}-font-styles`
        font.rel = 'stylesheet'
        font.async = true
        font.defer = true
        font.name = fontFamily.name
        const weights = typeof fontFamily?.weights === 'number' ? fontFamily?.weights : JSON.parse(fontFamily?.weights)?.join?.(';')
        font.href = fontFamily.href || `https://fonts.googleapis.com/css2?family=${fontFamily?.name}:wght@${weights || [400]}&display=swap`

        window.document.body.appendChild(font)
        if (name === 'primary') {
          window.document.body.style.fontFamily = fontFamily.name
        }
      }
    })
  }, [themeUpdated])

  useEffect(() => {
    if (!isShowReviewsPopupEnabled) return
    const _user = window.localStorage.getItem('user')
    const _token = window.localStorage.getItem('token')
    const _reviewRequired = window.sessionStorage.getItem('review-required')
    if (((_user || _token) && auth) && _reviewRequired !== '1') {
      window.sessionStorage.setItem('review-required', '1')
      _getLastOrderHasNoReview()
    }
    if (!(_user || _token)) {
      window.sessionStorage.removeItem('review-required')
    }
  }, [auth, isShowReviewsPopupEnabled])

  useEffect(() => {
    if (!loaded && !orderStatus.loading && !configLoading && !siteLoading && !orderingTheme?.loading) {
      if (orderTypeSearchParam && configTypes.includes(orderTypeSearchParam)) {
        changeType(parseInt(orderTypeSearchParam, 10))
        if (orderStatus?.options?.type === parseInt(orderTypeSearchParam, 10)) {
          setLoaded(true)
        }
        return
      }
      setLoaded(true)
    }
  }, [orderStatus, configLoading, siteLoading, orderingTheme])

  useEffect(() => {
    if (configs?.front_version?.value && loaded) {
      const localStorageFrontVersion = window.localStorage.getItem('front_version')
      if (localStorageFrontVersion && localStorageFrontVersion !== configs?.front_version?.value) {
        setAlertState({
          open: true,
          content: [t('RELOAD_FRONT_QUESTION', 'There is a new version of Ordering! Do you want to update it?')]
        })
      }
    }
  }, [configs, loaded])

  useEffect(() => {
    if (isHome && (settings?.use_marketplace || updatedBusinessSlug)) {
      goToPage('business', { store: settings?.use_marketplace ? 'marketplace' : updatedBusinessSlug })
    }
  }, [])

  useEffect(() => {
    if (!orderStatus.loading) {
      const localCountryCode = orderStatus?.options?.address?.country_code ??
        window.localStorage.getItem('country-code')

      if (localCountryCode) {
        ordering?.setCountryCode && ordering.setCountryCode(localCountryCode)
      }
    }
  }, [orderStatus])

  useEffect(() => {
    if (
      languageState?.error &&
      languageState?.error?.includes('This project does not exist') &&
      settings?.use_project_subdomain
    ) {
      window.open('https://www.orderingplus.com', '_self')
    }
  }, [languageState])

  const oneSignalSetup = () => {
    const OneSignal = window.OneSignal || []
    const hostname = window.location.hostname
    const initConfig = {
      appId: configs?.onesignal_orderingweb_id?.value,
      allowLocalhostAsSecureOrigin: hostname === 'localhost',
      notificationClickHandlerAction: 'navigate'
    }

    OneSignal.push(function () {
      OneSignal.SERVICE_WORKER_PARAM = { scope: '/push/onesignal/' }
      OneSignal.SERVICE_WORKER_PATH = 'push/onesignal/OneSignalSDKWorker.js'
      OneSignal.SERVICE_WORKER_UPDATER_PATH = 'push/onesignal/OneSignalSDKWorker.js'
      if (!OneSignal._initCalled) {
        OneSignal.init(initConfig)
      }

      const onNotificationClicked = function (data) {
        if (data?.data?.order_uuid) {
          history.push(`/orders/${data?.data?.order_uuid}`)
        }
      }
      const handler = function (data) {
        onNotificationClicked(data)
        if (typeof OneSignal.addListenerForNotificationOpened === 'function') {
          OneSignal.addListenerForNotificationOpened(handler)
        }
      }
      if (typeof OneSignal.addListenerForNotificationOpened === 'function') {
        OneSignal.addListenerForNotificationOpened(handler)
      }

      OneSignal.on('subscriptionChange', function (isSubscribed) {
        if (isSubscribed) {
          OneSignal.getUserId((userId) => {
            const data = {
              ...oneSignalState,
              notification_token: userId
            }
            setOneSignalState(data)
          })
        }
      })

      OneSignal.getUserId((userId) => {
        const data = {
          ...oneSignalState,
          notification_token: userId
        }
        setOneSignalState(data)
      })
    })
  }

  useEffect(() => {
    if (configLoading) return
    oneSignalSetup()
  }, [configLoading, events])

  return settings.isCancellation
    ? (
    <CancellationComponent
      ButtonComponent={Button}
      InputComponent={Input}
    />
      )
    : (
    <>
      <div style={{ marginBottom: windowSize.width < 576 && onlineStatus ? 80 : 0 }}>
        {(!!configs?.track_id_google_analytics?.value || !!settings?.store_google_analytics_id) && (
          <Analytics trackId={singleBusinessConfig?.isActive ? settings?.store_google_analytics_id : configs?.track_id_google_analytics?.value} />
        )}
        {(!!configs?.segment_track_id?.value || !!settings?.store_segment_id) && (
          <AnalyticsSegment writeKey={singleBusinessConfig?.isActive ? settings?.store_segment_id : configs?.segment_track_id?.value} />
        )}
        {(!!configs?.facebook_id?.value || !!settings?.store_facebook_pixel_id) && FacebookPixel && (
          <FacebookPixel trackId={singleBusinessConfig?.isActive ? settings?.store_facebook_pixel_id : configs?.facebook_id?.value} />
        )}
        {!loaded && <SpinnerLoader />}
        <SmartAppBanner
          storeAndroidId={themeUpdated?.smart_banner_settings?.android_id ?? settings?.store_android_id}
          storeAppleId={themeUpdated?.smart_banner_settings?.apple_id ?? settings?.store_apple_id}
        />
        {
          loaded && (
            <ThemeProvider
              theme={themeUpdated}
            >
              <ListenPageChanges />
              {!(isKioskApp && isHome) && (
                <Header
                  isHome={isHome}
                  location={location}
                  isCustomLayout={singleBusinessConfig.isActive}
                  singleBusinessConfig={singleBusinessConfig}
                  searchValue={searchValue}
                  setSearchValue={setSearchValue}
                  notificationState={oneSignalState}
                  businessSlug={updatedBusinessSlug}
                  useModalMode
                />
              )}
              <NotNetworkConnectivity />
              {onlineStatus && (
                <ScrollToTop>
                  <HelmetTags />
                  <Switch>
                    <Route exact path='/home'>
                      {isUserVerifyRequired && !guestCheckoutEnabled
                        ? (
                        <Redirect to='/verify' />
                          )
                        : (
                            isKioskApp || isFranchiseOne
                              ? <HomePage notificationState={oneSignalState} />
                              : (orderStatus.options?.address?.location || isAllowUnaddressOrderType)
                                  ? <Redirect to={singleBusinessConfig.isActive ? `/${singleBusinessConfig.businessSlug}` : '/search'} />
                                  : singleBusinessConfig.isActive
                                    ? <Redirect to={`/${singleBusinessConfig.businessSlug}`} />
                                    : <HomePage notificationState={oneSignalState} />
                          )}
                    </Route>
                    <Route exact path='/'>
                      {isUserVerifyRequired && !guestCheckoutEnabled
                        ? (
                        <Redirect to='/verify' />
                          )
                        : (
                            isKioskApp || isFranchiseOne
                              ? <HomePage notificationState={oneSignalState} />
                              : queryIntegrationToken && queryIntegrationCode === 'spoonity'
                                ? <QueryLoginSpoonity token={queryIntegrationToken} notificationState={oneSignalState} />
                                : (orderStatus.options?.address?.location || isAllowUnaddressOrderType)
                                    ? <Redirect to={singleBusinessConfig.isActive ? `/${singleBusinessConfig.businessSlug}` : '/search'} />
                                    : singleBusinessConfig.isActive
                                      ? <Redirect to={`/${singleBusinessConfig.businessSlug}`} />
                                      : <HomePage notificationState={oneSignalState} />
                          )}
                    </Route>
                    <Route exact path='/wallets'>
                      {auth
                        ? isUserVerifyRequired && !guestCheckoutEnabled
                          ? <Redirect to='/verify' />
                          : isWalletEnabled
                            ? <Wallets />
                            : <Redirect to={singleBusinessConfig.isActive ? `/${singleBusinessConfig.businessSlug}` : '/'} />
                        : <Redirect to={singleBusinessConfig.isActive ? `/${singleBusinessConfig.businessSlug}` : '/'} />}
                    </Route>
                    <Route exact path='/signup_business'>
                      {!auth && !isKioskApp
                        ? (
                        <SignUpBusiness
                          elementLinkToLogin={<Link to='/'>{t('LOGIN', 'Login')}</Link>}
                          useLoginByCellphone
                          useChekoutFileds
                          handleSuccessSignup={handleSuccessSignup}
                          layout={signUpBusinesslayout}
                          isRecaptchaEnable
                        />
                          )
                        : (
                        <Redirect to={singleBusinessConfig.isActive ? `/${singleBusinessConfig.businessSlug}` : '/'} />
                          )}
                    </Route>
                    <Route exact path='/signup-driver'>
                      {!auth && !isKioskApp
                        ? (
                        <SignUpDriver
                          layout={signUpDriverlayout}
                          elementLinkToLogin={<Link to='/'>{t('LOGIN', 'Login')}</Link>}
                          useLoginByCellphone
                          useChekoutFileds
                          handleSuccessSignup={handleSuccessSignup}
                          isRecaptchaEnable
                        />
                          )
                        : (
                        <Redirect to={singleBusinessConfig.isActive ? `/${singleBusinessConfig.businessSlug}` : '/'} />
                          )}
                    </Route>
                    <Route exact path='/password/reset'>
                      {auth
                        ? (
                        <Redirect to='/' />
                          )
                        : (
                            isKioskApp
                              ? <Redirect to={singleBusinessConfig.isActive ? `/${singleBusinessConfig.businessSlug}` : '/'} />
                              : <ResetPassword />
                          )}
                    </Route>
                    <Route exact path='/profile'>
                      {auth
                        ? isUserVerifyRequired && !guestCheckoutEnabled
                          ? <Redirect to='/verify' />
                          : (<Profile userId={user?.id} accessToken={user?.session?.access_token} useValidationFields />)
                        : <Redirect to={singleBusinessConfig.isActive ? `/${singleBusinessConfig.businessSlug}` : '/'} />}
                    </Route>
                    <Route exact path='/verify'>
                      {isUserVerifyRequired && !guestCheckoutEnabled
                        ? <UserVerification />
                        : <Redirect to={(auth || isKioskApp) ? singleBusinessConfig.isActive ? `/${singleBusinessConfig.businessSlug}` : '/search' : '/'} />}
                    </Route>
                    <Route exact path='/profile/orders'>
                      {auth
                        ? isUserVerifyRequired && !guestCheckoutEnabled
                          ? <Redirect to='/verify' />
                          : (<MyOrders />)
                        : queryIntegrationToken && queryIntegrationCode === 'spoonity'
                          ? <QueryLoginSpoonity token={queryIntegrationToken} notificationState={oneSignalState} />
                          : <Redirect to={singleBusinessConfig.isActive ? `/${singleBusinessConfig.businessSlug}` : '/'} />}
                    </Route>
                    <Route exact path='/profile/addresses'>
                      {auth
                        ? isUserVerifyRequired && !guestCheckoutEnabled
                          ? <Redirect to='/verify' />
                          : (<AddressList />)
                        : <Redirect to={singleBusinessConfig.isActive ? `/${singleBusinessConfig.businessSlug}` : '/'} />}
                    </Route>
                    <Route exact path='/messages'>
                      {auth
                        ? isUserVerifyRequired && !guestCheckoutEnabled
                          ? <Redirect to='/verify' />
                          : <MessagesList />
                        : (
                            isKioskApp
                              ? <Redirect to={singleBusinessConfig.isActive ? `/${singleBusinessConfig.businessSlug}` : '/'} />
                              : <Redirect to={{ pathname: '/search' }} />
                          )}
                    </Route>
                    <Route exact path='/help'>
                      {auth
                        ? isUserVerifyRequired && !guestCheckoutEnabled
                          ? <Redirect to='/verify' />
                          : (<Help />)
                        : <Redirect to={singleBusinessConfig.isActive ? `/${singleBusinessConfig.businessSlug}` : '/'} />}
                    </Route>
                    <Route exact path='/search'>
                      {
                        isKioskApp || businessesSlug?.business
                          ? <Redirect to={singleBusinessConfig.isActive ? `/${singleBusinessConfig.businessSlug}` : '/'} />
                          : queryIntegrationToken && queryIntegrationCode === 'spoonity'
                            ? <QueryLoginSpoonity token={queryIntegrationToken} notificationState={oneSignalState} />
                            : (
                                orderStatus.loading && !orderStatus.options?.address?.location
                                  ? (
                                <SpinnerLoader />
                                    )
                                  : (
                                      isUserVerifyRequired && !guestCheckoutEnabled
                                        ? (
                                  <Redirect to='/verify' />
                                          )
                                        : (
                                            (orderStatus.options?.address?.location || isAllowUnaddressOrderType || isFranchiseOne) && !singleBusinessConfig.isActive
                                              ? <BusinessesList searchValueCustom={searchValue} />
                                              : <Redirect to={singleBusinessConfig.isActive ? `/${singleBusinessConfig.businessSlug}` : '/'} />
                                          )
                                    )
                              )
                      }
                    </Route>
                    <Route exact path='/business_search'>
                      {isUserVerifyRequired && !guestCheckoutEnabled
                        ? (
                        <Redirect to='/verify' />
                          )
                        : (
                            (orderStatus.options?.address?.location || isAllowUnaddressOrderType) && !isKioskApp && !singleBusinessConfig.isActive
                              ? (
                          <BusinessListingSearch />
                                )
                              : (
                          <Redirect to={singleBusinessConfig.isActive ? `/${singleBusinessConfig.businessSlug}` : '/'} />
                                )
                          )}
                    </Route>
                    <Route exact path='/promotions'>
                      {orderStatus.loading && !orderStatus.options?.address?.location
                        ? (
                        <SpinnerLoader />
                          )
                        : (
                            isUserVerifyRequired && !guestCheckoutEnabled
                              ? (
                          <Redirect to='/verify' />
                                )
                              : (
                                  orderStatus.options?.address?.location && !isKioskApp
                                    ? <Promotions />
                                    : <Redirect to={singleBusinessConfig.isActive ? `/${singleBusinessConfig.businessSlug}` : '/'} />
                                )
                          )}
                    </Route>
                    <Route path='/checkout/:cartUuid?'>
                      {auth
                        ? isUserVerifyRequired && !guestCheckoutEnabled
                          ? <Redirect to='/verify' />
                          : <CheckoutPage />
                        : (
                          <Redirect to={{
                            pathname: singleBusinessConfig.isActive
                              ? `/${singleBusinessConfig.businessSlug}`
                              : '/',
                            state: { from: location.pathname || null }
                          }}
                          />
                          )}
                    </Route>
                    <Route exact path='/multi-checkout/:cartUuid?'>
                      {auth
                        ? isUserVerifyRequired && !guestCheckoutEnabled
                          ? <Redirect to='/verify' />
                          : <MultiCheckout />
                        : (
                          <Redirect to={{
                            pathname: singleBusinessConfig.isActive
                              ? `/${singleBusinessConfig.businessSlug}`
                              : '/',
                            state: { from: location.pathname || null }
                          }}
                          />
                          )}
                    </Route>
                    <Route exact path='/multi-cart'>
                      {auth
                        ? isUserVerifyRequired && !guestCheckoutEnabled
                          ? <Redirect to='/verify' />
                          : <MultiCart />
                        : (
                          <Redirect to={{
                            pathname: singleBusinessConfig.isActive
                              ? `/${singleBusinessConfig.businessSlug}`
                              : '/',
                            state: { from: location.pathname || null }
                          }}
                          />
                          )}
                    </Route>
                    <Route exact path='/multi-orders/:orderId'>
                      {auth
                        ? isUserVerifyRequired && !guestCheckoutEnabled
                          ? <Redirect to='/verify' />
                          : <MultiOrdersDetails />
                        : (
                          <Redirect to={{
                            pathname: singleBusinessConfig.isActive
                              ? `/${singleBusinessConfig.businessSlug}`
                              : '/',
                            state: { from: location.pathname || null }
                          }}
                          />
                          )}
                    </Route>
                    <Route exact path='/orders/:orderId'>
                      {(auth || hashKey)
                        ? isUserVerifyRequired && !guestCheckoutEnabled
                          ? <Redirect to='/verify' />
                          : <OrderDetailsPage />
                        : (
                          <Redirect to={{
                            pathname: singleBusinessConfig.isActive
                              ? `/${singleBusinessConfig.businessSlug}`
                              : '/',
                            state: { from: location.pathname || null }
                          }}
                          />
                          )}
                    </Route>
                    <Route exact path='/promotions'>
                      {(auth || hashKey)
                        ? isUserVerifyRequired && !guestCheckoutEnabled
                          ? <Redirect to='/verify' />
                          : <Promotions />
                        : (
                          <Redirect to={{
                            pathname: singleBusinessConfig.isActive
                              ? `/${singleBusinessConfig.businessSlug}`
                              : '/',
                            state: { from: location.pathname || null }
                          }}
                          />
                          )}
                    </Route>
                    <Route exact path='/pages/:pageSlug'>
                      {isUserVerifyRequired && !guestCheckoutEnabled
                        ? (
                        <Redirect to='/verify' />
                          )
                        : (
                        <Cms />
                          )}
                    </Route>
                    <Route exact path='/pages'>
                      {isUserVerifyRequired && !guestCheckoutEnabled
                        ? (
                        <Redirect to='/verify' />
                          )
                        : (
                        <PagesList />
                          )}
                    </Route>
                    <Route exact path='/favorite'>
                      {auth && !isKioskApp
                        ? <Favorite />
                        : (
                          <Redirect to='/' />
                          )}
                    </Route>
                    <Route exact path='/sessions'>
                      {auth && !isKioskApp
                        ? <SessionsList />
                        : (
                          <Redirect to='/' />
                          )}
                    </Route>
                    <Route exact path='/store'>
                      {queryIntegrationToken && queryIntegrationCode === 'spoonity'
                        ? <QueryLoginSpoonity token={queryIntegrationToken} notificationState={oneSignalState} />
                        : isUserVerifyRequired && !guestCheckoutEnabled
                          ? (
                          <Redirect to='/verify' />
                            )
                          : (
                          <BusinessProductsList />
                            )}
                    </Route>
                    <Route exact path='/store/:business_slug'>
                      {queryIntegrationToken && queryIntegrationCode === 'spoonity'
                        ? <QueryLoginSpoonity token={queryIntegrationToken} notificationState={oneSignalState} />
                        : isUserVerifyRequired && !guestCheckoutEnabled
                          ? (
                          <Redirect to='/verify' />
                            )
                          : (
                          <BusinessProductsList />
                            )}
                    </Route>
                    <Route exact path='/store/:business_slug/:category_slug/:product_slug'>
                      {queryIntegrationToken && queryIntegrationCode === 'spoonity'
                        ? <QueryLoginSpoonity token={queryIntegrationToken} notificationState={oneSignalState} />
                        : isUserVerifyRequired && !guestCheckoutEnabled
                          ? (
                          <Redirect to='/verify' />
                            )
                          : (
                          <BusinessProductsList />
                            )}
                    </Route>
                    <Route exact path='/store/:category_slug/:product_slug'>
                      {queryIntegrationToken && queryIntegrationCode === 'spoonity'
                        ? <QueryLoginSpoonity token={queryIntegrationToken} notificationState={oneSignalState} />
                        : isUserVerifyRequired && !guestCheckoutEnabled
                          ? (
                          <Redirect to='/verify' />
                            )
                          : (
                          <BusinessProductsList />
                            )}
                    </Route>
                    <Route exact path='/:business_slug'>
                      {queryIntegrationToken && queryIntegrationCode === 'spoonity'
                        ? <QueryLoginSpoonity token={queryIntegrationToken} notificationState={oneSignalState} />
                        : isUserVerifyRequired && !guestCheckoutEnabled
                          ? (
                          <Redirect to='/verify' />
                            )
                          : (
                          <BusinessProductsList />
                            )}
                    </Route>
                    <Route exact path='/:business_slug/:category_slug/:product_slug'>
                      {queryIntegrationToken && queryIntegrationCode === 'spoonity'
                        ? <QueryLoginSpoonity token={queryIntegrationToken} notificationState={oneSignalState} />
                        : isUserVerifyRequired && !guestCheckoutEnabled
                          ? (
                          <Redirect to='/verify' />
                            )
                          : (
                          <BusinessProductsList />
                            )}
                    </Route>
                    <Route exact path='/:business_slug/:category_slug'>
                      {queryIntegrationToken && queryIntegrationCode === 'spoonity'
                        ? <QueryLoginSpoonity token={queryIntegrationToken} notificationState={oneSignalState} />
                        : isUserVerifyRequired && !guestCheckoutEnabled
                          ? (
                          <Redirect to='/verify' />
                            )
                          : (
                          <BusinessProductsList />
                            )}
                    </Route>
                    <Route path='*'>
                      <PageNotFound />
                    </Route>
                  </Switch>
                </ScrollToTop>
              )}
              {!navigator.userAgent.match('CriOS') && (
                <PWAPrompt promptOnVisit={1} timesToShow={100} copyClosePrompt='Close' permanentlyHideOnDismiss={false} />
              )}
              {(!isFooterPage || enabledPoweredByOrdering) && (
                <Footer isFooterPage={isFooterPage} isHome={isHome} />
              )}
              {auth && (
                <WebsocketStatus useReconnectByLogin />
              )}
              {(windowSize.width < 576 && onlineStatus) && (
                <NavigationBar />
              )}
              <Alert
                title={t('INFORMATION', 'Information')}
                content={alertState.content}
                links={alertState.links}
                acceptText={t('ACCEPT', 'Accept')}
                open={alertState.open}
                onClose={() => closeAlert()}
                onCancel={() => closeAlert()}
                onAccept={() => alertState?.isOnlyAlert ? closeAlert() : acceptAlert()}
                closeOnBackdrop={false}
              />
              {lastOrderReview?.isReviewOpen && (
                <Modal
                  open={lastOrderReview?.isReviewOpen}
                  onClose={handleCloseReivew}
                  title={lastOrderReview?.order && reviewModalTitle()}
                  width={lastOrderReview?.reviewStatus?.trigger ? '680px' : null}
                >
                  <div>
                    {
                      lastOrderReview?.reviewStatus?.trigger
                        ? <ReviewTrigger order={lastOrderReview?.order} handleOpenOrderReview={handleOpenOrderReview} />
                        : lastOrderReview?.reviewStatus?.order
                          ? <ReviewOrder order={lastOrderReview?.order} defaultStar={lastOrderReview?.defaultStar} closeReviewOrder={closeReviewOrder} setIsReviewed={() => setIsReviewed('isOrderReviewed')} />
                          : (lastOrderReview?.reviewStatus?.product
                              ? <ReviewProduct order={lastOrderReview?.order} closeReviewProduct={closeReviewProduct} setIsProductReviewed={() => setIsReviewed('isProductReviewed')} />
                              : <ReviewDriver order={lastOrderReview?.order} closeReviewDriver={handleCloseReivew} setIsDriverReviewed={() => setIsReviewed('isDriverReviewed')} />)
                    }
                  </div>
                </Modal>
              )}
              {businessSignUpSuccessed?.open && (
                <Modal
                  open={businessSignUpSuccessed?.open}
                  onClose={() => setBusinessSignUpSuccessed({ open: false, content: {} })}
                  title={t('CONGRATULATIONS', 'Congratulations')}
                  width='990px'
                >
                  <SignUpApproval
                    content={businessSignUpSuccessed?.content}
                    onAccept={() => acceptAlert()}
                    onCancel={() => setBusinessSignUpSuccessed({ open: false, content: {} })}
                  />
                </Modal>
              )}
            </ThemeProvider>
          )
        }
      </div>
      {themeUpdated?.third_party_code?.body && parse(themeUpdated?.third_party_code?.body)}
    </>
      )
}
