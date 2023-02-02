import React, { useLayoutEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useTheme, useTranslations } from 'dopenative'
import { IMChatHomeComponent } from '../../Core/chat'
import { TNTouchableIcon } from '../../Core/truly-native'
import { useCurrentUser } from '../../Core/onboarding'
import { useSocialGraphFriends } from '../../Core/socialgraph/friendships'

const ChatScreen = props => {
  const { navigation, onFriendAction } = props

  const { localized } = useTranslations()
  const { theme, appearance } = useTheme()
  const currentUser = useCurrentUser()
  const { friends } = useSocialGraphFriends(currentUser?.id)

  const searchBarRef = useRef()
  const audioVideoChatConfig = useSelector(state => state.audioVideoChat)

  useLayoutEffect(() => {
    const colorSet = theme.colors[appearance]
    navigation.setOptions({
      headerTitle: localized('Conversations'),
      headerRight: () => (
        <TNTouchableIcon
          imageStyle={{ tintColor: colorSet.primaryText }}
          iconSource={theme.icons.inscription}
          onPress={() => navigation.navigate('CreateGroup')}
        />
      ),
      headerLeft: () =>
        Platform.OS === 'android' && (
          <TNTouchableIcon
            imageStyle={{ tintColor: colorSet.primaryText }}
            iconSource={theme.icons.menuHamburger}
            onPress={openDrawer}
          />
        ),
      headerStyle: {
        backgroundColor: colorSet.primaryBackground,
      },
      headerTintColor: colorSet.primaryText,
    })
  }, [])

  const openDrawer = () => {
    navigation.openDrawer()
  }

  const onFriendItemPress = friend => {
    const id1 = currentUser.id || currentUser.userID
    const id2 = friend.id || friend.userID
    if (id1 == id2) {
      return
    }
    const channel = {
      id: id1 < id2 ? id1 + id2 : id2 + id1,
      participants: [friend],
    }
    navigation.navigate('PersonalChat', { channel, isChatUserItemPress: true })
  }

  const onSearchButtonPress = async () => {
    navigation.navigate('UserSearchScreen', { followEnabled: false })
  }

  const onEmptyStatePress = () => {
    onSearchButtonPress()
  }
  const onSenderProfilePicturePress = item => {
    console.log(item)
  }

  return (
    <IMChatHomeComponent
      isChatUserItemPress={true}
      searchBarRef={searchBarRef}
      friends={friends}
      onFriendItemPress={onFriendItemPress}
      onSearchBarPress={onSearchButtonPress}
      onFriendAction={onFriendAction}
      navigation={navigation}
      onEmptyStatePress={onEmptyStatePress}
      onSenderProfilePicturePress={onSenderProfilePicturePress}
      audioVideoChatConfig={audioVideoChatConfig}
    />
  )
}

export default ChatScreen
