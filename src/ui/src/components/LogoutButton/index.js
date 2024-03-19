import React from 'react'
import FaSignOutAlt from '@meronex/icons/fa/FaSignOutAlt'

import {
  MenuLink,
  WrappContent,
  MenuLinkIcon,
  MenuLinkText,
  TextInfo,
  MenuLinkSeparator
} from '../SidebarMenu/styles'

import { LogoutAction, useLanguage } from '~components'

const LogoutButtonUI = (props) => {
  const { onCustomClick, hideText } = props
  const [, t] = useLanguage()

  const handleLogOutClick = () => {
    window.FB.getLoginStatus((response) => {
      if (response.status === 'connected') {
        window.FB.logout()
      }
    })

    const GoogleAuth = window?.gapi?.auth2?.getAuthInstance()
    if (GoogleAuth) {
      const signedIn = GoogleAuth.isSignedIn.get()
      if (signedIn) {
        GoogleAuth.signOut().then(() => {
          GoogleAuth.disconnect()
        })
      }
    }

    props.handleLogoutClick()
    onCustomClick && onCustomClick()
  }

  return (
    <MenuLink id='logoutbtn' onClick={handleLogOutClick} style={props.styleContainer}>
      <WrappContent style={props.styleWrappContent}>
        <MenuLinkIcon>
          <FaSignOutAlt />
        </MenuLinkIcon>
        {!hideText && (
          <MenuLinkText>
            <TextInfo>
              {t('LOGOUT', 'Logout')}
            </TextInfo>
          </MenuLinkText>
        )}
        <MenuLinkSeparator>
          <div>
            <hr />
          </div>
        </MenuLinkSeparator>
      </WrappContent>
    </MenuLink>
  )
}

export const LogoutButton = (props) => {
  const logoutButtonProps = {
    ...props,
    UIComponent: LogoutButtonUI
  }
  return (
    <LogoutAction {...logoutButtonProps} />
  )
}
