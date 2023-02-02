import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react'
import { Platform, Share } from 'react-native'
import { useDispatch } from 'react-redux'
import { useTheme, useTranslations } from 'dopenative'
import { Profile } from '../../components'
import { storageAPI } from '../../Core/media'
import { updateUser } from '../../Core/users'
import { setUserData } from '../../Core/onboarding/redux/auth'
import { TNTouchableIcon } from '../../Core/truly-native'
import { useCurrentUser } from '../../Core/onboarding'
import {
  useProfile,
  usePostMutations,
  fetchProfile,
} from '../../Core/socialgraph/feed'
import { setLocallyDeletedPost } from '../../Core/socialgraph/feed/redux'
import { useSocialGraphMutations } from '../../Core/socialgraph/friendships'

const defaultAvatar =
  'https://www.iosapptemplates.com/wp-content/uploads/2019/06/empty-avatar.jpg'

const ProfileScreen = props => {
  const { navigation, route } = props
  const otherUser = route?.params?.user
  const lastScreenTitle = route?.params?.lastScreenTitle ?? 'Profile'
  const stackKeyTitle = route?.params?.stackKeyTitle ?? 'Profile'

  const { localized } = useTranslations()
  const { theme, appearance } = useTheme()
  const currentUser = useCurrentUser()

  const {
    profile,
    posts,
    refreshing,
    isLoadingBottom,
    subscribeToProfileFeedPosts,
    loadMorePosts,
    pullToRefresh,
    addReaction,
    batchSize,
  } = useProfile(otherUser?.id ?? currentUser?.id, currentUser?.id)
  const { user, friends, moreFriendsAvailable, actionButtonType } =
    profile ?? {}

  const { addEdge } = useSocialGraphMutations()
  const { deletePost } = usePostMutations()

  const dispatch = useDispatch()

  const [localActionButtonType, setLocalActionButtonType] = useState(
    !otherUser ? 'settings' : null,
  )
  const [isMediaViewerOpen, setIsMediaViewerOpen] = useState(false)
  const [selectedFeedItems, setSelectedFeedItems] = useState([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(null)

  useLayoutEffect(() => {
    const colorSet = theme.colors[appearance]
    navigation.setOptions({
      headerTitle: localized('Profile'),
      headerRight: () =>
        !otherUser && (
          <TNTouchableIcon
            imageStyle={{ tintColor: colorSet.primaryForeground }}
            iconSource={theme.icons.bell}
            onPress={navigateToNotifications}
          />
        ),
      headerStyle: {
        backgroundColor: colorSet.primaryBackground,
        borderBottomColor: colorSet.hairline,
      },
      headerTintColor: colorSet.primaryText,
    })

    if (!otherUser && Platform.OS === 'android') {
      navigation.setOptions({
        headerLeft: () => (
          <TNTouchableIcon
            imageStyle={{ tintColor: colorSet.primaryText }}
            iconSource={theme.icons.menuHamburger}
            onPress={openDrawer}
          />
        ),
      })
    }
  }, [lastScreenTitle])

  useEffect(() => {
    const postsUnsubscribe = subscribeToProfileFeedPosts(
      otherUser?.id ?? currentUser?.id,
    )
    return () => {
      postsUnsubscribe && postsUnsubscribe()
    }
  }, [currentUser?.id])

  const navigateToNotifications = useCallback(() => {
    navigation.navigate(lastScreenTitle + 'Notification', {
      lastScreenTitle,
    })
  }, [navigation, lastScreenTitle])

  const openDrawer = useCallback(() => {
    navigation.openDrawer()
  }, [navigation])

  const onMainButtonPress = useCallback(() => {
    const actionType = localActionButtonType
      ? localActionButtonType
      : actionButtonType
    if (actionType === 'add') {
      addFriend()
      return
    }
    if (actionType === 'message') {
      onMessage()
      return
    }
    if (actionType === 'settings') {
      const settingsScreen = lastScreenTitle
        ? lastScreenTitle + 'ProfileSettings'
        : 'ProfileProfileSettings'
      navigation.navigate(settingsScreen, {
        lastScreenTitle,
      })
    }
  }, [
    localActionButtonType,
    actionButtonType,
    addFriend,
    onMessage,
    navigation,
  ])

  const onMessage = useCallback(() => {
    const viewerID = currentUser.id
    const friendID = otherUser.id
    let channel = {
      id: viewerID < friendID ? viewerID + friendID : friendID + viewerID,
      participants: [otherUser],
    }
    navigation.navigate('PersonalChat', { channel })
  }, [navigation, currentUser, otherUser])

  const onMediaClose = useCallback(() => {
    setIsMediaViewerOpen(false)
  }, [setIsMediaViewerOpen])

  const startUpload = useCallback(
    async source => {
      dispatch(
        setUserData({
          user: {
            ...currentUser,
            profilePictureURL: source?.path || source.uri,
          },
          profilePictureURL: source?.path || source.uri,
        }),
      )

      storageAPI.processAndUploadMediaFileWithProgressTracking(
        source,
        async snapshot => {
          const uploadProgress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setUploadProgress(uploadProgress)
        },
        async url => {
          const data = {
            profilePictureURL: url,
          }
          dispatch(
            setUserData({
              user: { ...currentUser, profilePictureURL: url },
            }),
          )

          updateUser(currentUser.id, data)
          setUploadProgress(0)
        },
        error => {
          setUploadProgress(0)
          console.log(error)
          alert(
            localized(
              'Oops! An error occured while trying to update your profile picture. Please try again.',
            ),
          )
          console.log(error)
        },
      )
    },
    [dispatch, setUploadProgress, setUserData, storageAPI, localized],
  )

  const removePhoto = useCallback(async () => {
    const res = await updateUser(currentUser.id, {
      profilePictureURL: defaultAvatar,
    })
    if (res.success) {
      dispatch(
        setUserData({
          user: { ...currentUser, profilePictureURL: defaultAvatar },
        }),
      )
    } else {
      alert(
        localized(
          'Oops! An error occured while trying to remove your profile picture. Please try again.',
        ),
      )
    }
  }, [updateUser, currentUser, localized])

  const addFriend = useCallback(async () => {
    if (!currentUser || !user) {
      return
    }
    setLocalActionButtonType('message')
    await addEdge(currentUser, user)
  }, [currentUser, user, addEdge, setLocalActionButtonType])

  const onEmptyStatePress = useCallback(() => {
    navigation.navigate('CreatePost')
  }, [navigation])

  const handleOnEndReached = useCallback(
    distanceFromEnd => {
      if (posts.length >= batchSize) {
        loadMorePosts(otherUser?.id ?? currentUser?.id)
      }
    },
    [loadMorePosts, posts],
  )

  const pullToRefreshConfig = {
    refreshing: refreshing,
    onRefresh: () => {
      pullToRefresh(otherUser?.id ?? currentUser?.id)
    },
  }

  const onReaction = useCallback(
    async (reaction, item) => {
      await addReaction(item, currentUser, reaction)
    },
    [currentUser, addReaction],
  )

  const onSharePost = useCallback(
    async item => {
      let url = ''
      if (item.postMedia?.length > 0) {
        url = item.postMedia[0]?.url || item.postMedia[0]
      }
      try {
        const result = await Share.share(
          {
            title: 'Share SocialNetwork post.',
            message: item.postText,
            url,
          },
          {
            dialogTitle: 'Share SocialNetwork post.',
          },
        )
      } catch (error) {
        alert(error.message)
      }
    },
    [Share],
  )

  const onDeletePost = useCallback(
    async item => {
      dispatch(setLocallyDeletedPost(item.id))
      const res = await deletePost(item.id, currentUser?.id)
      if (res.error) {
        alert(res.error)
      }
    },
    [deletePost],
  )

  const onFriendItemPress = useCallback(
    item => {
      if (item.id === currentUser.id) {
        navigation.push(stackKeyTitle, {
          stackKeyTitle: stackKeyTitle,
        })
      } else {
        navigation.push(stackKeyTitle, {
          user: item,
          stackKeyTitle: stackKeyTitle,
        })
      }
    },
    [navigation, currentUser?.id],
  )

  const onSubButtonTitlePress = useCallback(() => {
    navigation.push(lastScreenTitle + 'AllFriends', {
      lastScreenTitle: lastScreenTitle,
      title: localized('Friends'),
      stackKeyTitle: stackKeyTitle,
      otherUser: otherUser,
      includeReciprocal: true,
      followEnabled: false,
    })
  }, [navigation, lastScreenTitle, stackKeyTitle])

  const onFeedUserItemPress = useCallback(
    async author => {
      if ((otherUser?.id || currentUser?.id) === author?.id) {
        return
      }

      navigation.navigate(lastScreenTitle + 'Profile', {
        stackKeyTitle: stackKeyTitle,
        lastScreenTitle: 'Profile',
      })
    },
    [navigation, lastScreenTitle, stackKeyTitle],
  )

  const onMediaPress = useCallback(
    (media, mediaIndex) => {
      setSelectedMediaIndex(mediaIndex)
      setSelectedFeedItems(media)
      setIsMediaViewerOpen(true)
    },
    [setSelectedMediaIndex, setSelectedFeedItems, setIsMediaViewerOpen],
  )

  const onCommentPress = useCallback(
    item => {
      navigation.navigate(`${stackKeyTitle}PostDetails`, {
        item: item,
        lastScreenTitle: 'Profile',
      })
    },
    [navigation],
  )

  const actionType = localActionButtonType
    ? localActionButtonType
    : actionButtonType
  const mainButtonTitle =
    actionType === 'settings'
      ? localized('Profile Settings')
      : actionType === 'message'
      ? localized('Send Message')
      : actionType === 'add'
      ? localized('Add Friend')
      : null

  const subButtonTitle = moreFriendsAvailable
    ? localized('See All Friends')
    : null

  return (
    <Profile
      uploadProgress={uploadProgress}
      user={otherUser ? { ...otherUser, ...(user ?? {}) } : currentUser}
      loggedInUser={currentUser}
      mainButtonTitle={mainButtonTitle}
      subButtonTitle={subButtonTitle}
      friends={friends}
      recentUserFeeds={posts}
      onFriendItemPress={onFriendItemPress}
      onMainButtonPress={onMainButtonPress}
      selectedMediaIndex={selectedMediaIndex}
      onSubButtonTitlePress={onSubButtonTitlePress}
      onCommentPress={onCommentPress}
      onFeedUserItemPress={onFeedUserItemPress}
      isMediaViewerOpen={isMediaViewerOpen}
      feedItems={selectedFeedItems}
      onMediaClose={onMediaClose}
      onReaction={onReaction}
      onMediaPress={onMediaPress}
      removePhoto={removePhoto}
      startUpload={startUpload}
      handleOnEndReached={handleOnEndReached}
      isFetching={isLoadingBottom}
      isOtherUser={otherUser}
      onSharePost={onSharePost}
      onDeletePost={onDeletePost}
      onEmptyStatePress={onEmptyStatePress}
      pullToRefreshConfig={pullToRefreshConfig}
      navigation={navigation}
    />
  )
}

export default ProfileScreen
