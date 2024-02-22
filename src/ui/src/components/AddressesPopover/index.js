import React, { useRef, useEffect } from 'react'
import { usePopper } from 'react-popper'
import FaMapMarkerAlt from '@meronex/icons/fa/FaMapMarkerAlt'

import { HeaderItem, PopoverBody, PopoverArrow, Container, Title } from './styles'

import { useOrder, useLanguage, useEvent } from '~components'
import { AddressList, AddressForm } from '~ui'

export const AddressesPopover = (props) => {
  const {
    open,
    auth,
    addressState,
    isCustomerMode
  } = props

  const [events] = useEvent()
  const [orderState] = useOrder()
  const [, t] = useLanguage()
  const referenceElement = useRef()
  const popperElement = useRef()
  const arrowElement = useRef()
  const testElement = useRef()
  const popper = usePopper(referenceElement.current, popperElement.current, {
    placement: 'auto',
    modifiers: [
      { name: 'arrow', options: { element: arrowElement.current } },
      {
        name: 'offset',
        options: {
          offset: [0, 12]
        }
      }
    ]
  })

  const userCustomer = JSON.parse(window.localStorage.getItem('user-customer'))

  const { styles, attributes } = popper

  const popStyle = { ...styles.popper, visibility: open ? 'visible' : 'hidden', width: '450px', maxHeight: '70vh', overflowY: 'auto' }
  if (!open) {
    popStyle.transform = 'translate3d(0px, 0px, 0px)'
  }

  const handleMapDragging = (value) => (testElement.current = { isMapDragging: value })

  const handleClickOutside = (e) => {
    if (!open) return
    const outsidePopover = !popperElement.current?.contains(e.target)
    const outsidePopoverMenu = !referenceElement.current?.contains(e.target)
    const outsideModal = !window.document.getElementById('app-modals') ||
      !window.document.getElementById('app-modals').contains(e.target)
    if (outsidePopover && outsidePopoverMenu && outsideModal && !testElement.current?.isMapDragging) {
      props.onClose && props.onClose()
    }
    handleMapDragging(false)
  }

  const handleKeyDown = (e) => {
    if (e.keyCode === 27) {
      props.onClose && props.onClose()
    }
  }

  useEffect(() => {
    window.addEventListener('mouseup', handleClickOutside)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('mouseup', handleClickOutside)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  useEffect(() => {
    // forceUpdate && forceUpdate()
  }, [open, orderState])

  useEffect(() => {
    events.on('map_is_dragging', handleMapDragging)
    return () => events.off('map_is_dragging', handleMapDragging)
  }, [])

  return (
    <div className='address-popover' style={{ overflow: 'hidden' }}>
      <HeaderItem ref={referenceElement} onClick={props.onClick} isHome={props.isHome}>
        <FaMapMarkerAlt /> {orderState.options?.address?.address?.split(',')?.[0] || t('SELECT_AN_ADDRESS', 'Select an address')}
      </HeaderItem>
      <PopoverBody className='form_edit' ref={popperElement} style={popStyle} {...attributes.popper}>
        {open && (
          <Container>
            {auth && (
              <>
                <Title>{t('ADDRESSES', 'Addresses')}</Title>
                <AddressList
                  isPopover
                  changeOrderAddressWithDefault
                  userId={isNaN(userCustomer?.id) ? null : userCustomer?.id}
                  onClosePopover={props.onClose}
                  isCustomerMode={isCustomerMode}
                />
              </>)}
            {!auth && (
              <>
                <Title>{t('ADDRESS', 'Address')}</Title>
                <AddressForm
                  useValidationFileds
                  address={addressState || {}}
                  onClose={() => props.onClose && props.onClose()}
                  onCancel={() => props.onClose && props.onClose()}
                  onSaveAddress={() => props.onClose && props.onClose()}
                />
              </>)}
          </Container>
        )}
        <PopoverArrow key='arrow' ref={arrowElement} style={styles.arrow} />
      </PopoverBody>
    </div>
  )
}
