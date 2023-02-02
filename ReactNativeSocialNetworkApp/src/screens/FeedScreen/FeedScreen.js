import React, {
  useEffect,
  useState,
  useRef,
  useLayoutEffect,
  useCallback,
} from 'react'
import { Alert, Platform, View, Share, Image } from 'react-native'
import { useDispatch } from 'react-redux'
import ImagePicker from 'react-native-image-crop-picker'
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu'
import { Camera } from 'expo-camera'
import * as FacebookAds from 'expo-ads-facebook'
import { useTheme, useTranslations } from 'dopenative'
import { Feed } from '../../components'
import styles from './styles'
import { TNActivityIndicator, TNTouchableIcon } from '../../Core/truly-native'
import { useUserReportingMutations } from '../../Core/user-reporting'
import { setLocallyDeletedPost } from '../../Core/socialgraph/feed/redux'
import { useConfig } from '../../config'
import { useCurrentUser } from '../../Core/onboarding'
import {
  useHomeFeedPosts,
  useStories,
  useStoryMutations,
  usePostMutations,
} from '../../Core/socialgraph/feed'

const FeedScreen = props => {
  const { navigation } = props
  const config = useConfig()
  const currentUser = useCurrentUser()

  const { localized } = useTranslations()
  const { theme, appearance } = useTheme()

  const dispatch = useDispatch()

  const {
    posts,
    refreshing,
    isLoadingBottom,
    subscribeToHomeFeedPosts,
    loadMorePosts,
    pullToRefresh,
    addReaction,
    ingestAdSlots,
    batchSize,
  } = useHomeFeedPosts()
  const { groupedStories, myStories, subscribeToStories, loadMoreStories } =
    useStories()
  const loading = posts === null
  const { addStory } = useStoryMutations()
  const { deletePost } = usePostMutations()
  const { markAbuse } = useUserReportingMutations()

  const [isUploadingStory, setIsUploadingStory] = useState(false)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [isMediaViewerOpen, setIsMediaViewerOpen] = useState(false)
  const [selectedFeedItems, setSelectedFeedItems] = useState([])
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(null)
  const [willBlur, setWillBlur] = useState(false)
  const [adsManager, setAdsManager] = useState(null)
  const [adsLoaded, setAdsLoaded] = useState(false)
  const navMenuRef = useRef()

  useLayoutEffect(() => {
    const colorSet = theme.colors[appearance]

    const androidNavIconOptions = [
      {
        key: 'camera',
        onSelect: openCamera,
        iconSource: theme.icons.camera,
      },
      {
        key: 'video',
        onSelect: openVideoRecorder,
        iconSource: theme.icons.videoCamera,
      },
      {
        key: 'picker',
        onSelect: openMediaPicker,
        iconSource: theme.icons.libraryLandscape,
      },
    ]
    navigation.setOptions({
      headerTitle: localized('Home'),
      headerLeft: () => (
        <TNTouchableIcon
          imageStyle={{ tintColor: colorSet.primaryText }}
          iconSource={
            Platform.OS === 'ios'
              ? theme.icons.camera
              : theme.icons.menuHamburger
          }
          onPress={Platform.OS === 'ios' ? toggleCamera : openDrawer}
        />
      ),
      headerRight: () => (
        <View style={styles.doubleNavIcon}>
          {Platform.OS === 'android' && (
            <Menu ref={navMenuRef}>
              <MenuTrigger>
                <Image
                  style={[
                    {
                      tintColor: colorSet.primaryText,
                      marginRight: -5,
                    },
                    styles.navIcon,
                  ]}
                  source={theme.icons.camera}
                />
              </MenuTrigger>
              <MenuOptions
                customStyles={{
                  optionsContainer: {
                    ...styles.navIconMenuOptions,
                    backgroundColor: colorSet.primaryBackground,
                  },
                }}>
                {androidNavIconOptions.map(option => (
                  <MenuOption onSelect={option.onSelect}>
                    <Image
                      style={[
                        {
                          tintColor: colorSet.primaryText,
                        },
                        styles.navIcon,
                      ]}
                      source={option.iconSource}
                    />
                  </MenuOption>
                ))}
              </MenuOptions>
            </Menu>
          )}
          <TNTouchableIcon
            imageStyle={{ tintColor: colorSet.primaryText }}
            iconSource={theme.icons.inscription}
            onPress={() => navigation.navigate('CreatePost')}
          />
        </View>
      ),
      headerStyle: {
        backgroundColor: colorSet.primaryBackground,
        borderBottomColor: colorSet.hairline,
      },
      headerTintColor: colorSet.primaryText,
    })
  }, [])

  useEffect(() => {
    if (!currentUser?.id) {
      return
    }
    const postsUnsubscribe = subscribeToHomeFeedPosts(currentUser?.id)
    const storiesUnsubscribe = subscribeToStories(currentUser?.id)
    return () => {
      postsUnsubscribe && postsUnsubscribe()
      storiesUnsubscribe && storiesUnsubscribe()
    }
  }, [currentUser?.id])

  useEffect(() => {
    // FacebookAds.InterstitialAdManager.showAd("834318260403282_834371153731326")//"834318260403282_834319513736490")
    //   .then(didClick => {})
    //   .catch(error => {
    //     alert(error);
    //   });
    const placementID =
      config.adsConfig && config.adsConfig.facebookAdsPlacementID
    if (placementID) {
      const manager = new FacebookAds.NativeAdsManager(placementID, 5)
      manager.onAdsLoaded(onAdsLoaded)
      setAdsManager(manager)
    }
  }, [1])

  useEffect(() => {
    const { adsConfig } = config
    if (adsConfig && adsLoaded) {
      ingestAdSlots(adsConfig.adSlotInjectionInterval)
    }
  }, [adsLoaded])

  const onAdsLoaded = useCallback(() => {
    setAdsLoaded(true)
  }, [setAdsLoaded])

  const onStoriesListEndReached = useCallback(() => {
    loadMoreStories(currentUser?.id)
  }, [loadMoreStories, currentUser?.id])

  const onCommentPress = useCallback(
    item => {
      navigation.navigate('FeedDetailPost', {
        item: item,
        lastScreenTitle: 'Feed',
      })
    },
    [navigation],
  )

  const runIfCameraPermissionGranted = async callback => {
    const { status } = await Camera.requestPermissionsAsync()
    if (status === 'granted') {
      callback && callback()
    } else {
      Alert.alert(
        localized('Camera permission denied'),
        localized(
          'You must enable camera permissions in order to take photos.',
        ),
      )
    }
  }

  const toggleCamera = useCallback(() => {
    runIfCameraPermissionGranted(() => {
      if (Platform.OS === 'ios') {
        setIsCameraOpen(!isCameraOpen)
      } else {
        if (navMenuRef.current) {
          navMenuRef.current.open()
        }
      }
    })
  }, [
    runIfCameraPermissionGranted,
    setIsCameraOpen,
    isCameraOpen,
    navMenuRef?.current,
  ])

  const openVideoRecorder = useCallback(() => {
    runIfCameraPermissionGranted(() => {
      ImagePicker.openCamera({
        mediaType: 'video',
      }).then(image => {
        if (image.path) {
          onPostStory(image)
        }
      })
    })
  }, [onPostStory, ImagePicker, runIfCameraPermissionGranted])

  const openCamera = useCallback(() => {
    runIfCameraPermissionGranted(() => {
      ImagePicker.openCamera({
        mediaType: 'photo',
      }).then(image => {
        if (image.path) {
          onPostStory(image)
        }
      })
    })
  }, [runIfCameraPermissionGranted, onPostStory, ImagePicker])

  const openMediaPicker = useCallback(() => {
    ImagePicker.openPicker({
      mediaType: 'any',
    }).then(image => {
      if (image.path) {
        onPostStory(image)
      }
    })
  }, [ImagePicker, onPostStory])

  const openDrawer = useCallback(() => {
    navigation.openDrawer()
  }, [navigation])

  const onCameraClose = useCallback(() => {
    setIsCameraOpen(false)
  }, [setIsCameraOpen])

  const onUserItemPress = useCallback(
    shouldOpenCamera => {
      if (shouldOpenCamera) {
        toggleCamera()
      }
    },
    [toggleCamera],
  )

  const onFeedUserItemPress = useCallback(
    async item => {
      if (item.id === currentUser.id) {
        navigation.navigate('FeedProfile', {
          stackKeyTitle: 'FeedProfile',
          lastScreenTitle: 'Feed',
        })
      } else {
        navigation.navigate('FeedProfile', {
          user: item,
          stackKeyTitle: 'FeedProfile',
          lastScreenTitle: 'Feed',
        })
      }
    },
    [navigation, currentUser?.id],
  )

  const onMediaClose = useCallback(() => {
    setIsMediaViewerOpen(false)
    navigation.setOptions({
      headerShown: true,
    })
  }, [setIsMediaViewerOpen, navigation])

  const onMediaPress = useCallback(
    (media, mediaIndex) => {
      setSelectedFeedItems(media)
      setSelectedMediaIndex(mediaIndex)
      setIsMediaViewerOpen(true)
      navigation.setOptions({
        headerShown: false,
      })
    },
    [
      setSelectedFeedItems,
      setSelectedMediaIndex,
      setIsMediaViewerOpen,
      navigation,
    ],
  )

  const onPostStory = useCallback(
    async file => {
      // We close down the camera modal, before uploading the story, to make the UX faster
      toggleCamera()

      setIsUploadingStory(true)
      const res = await addStory(file, currentUser)
      // TODO: handle errors
      setIsUploadingStory(false)
    },
    [toggleCamera, addStory, localized, currentUser],
  )

  const onReaction = useCallback(
    async (reaction, post) => {
      await addReaction(post, currentUser, reaction)
    },
    [addReaction, currentUser],
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
      await deletePost(item.id, currentUser?.id)
    },
    [deletePost, currentUser],
  )

  const onUserReport = useCallback(
    async (item, type) => {
      markAbuse(currentUser.id, item.authorID, type)
    },
    [currentUser?.id, markAbuse],
  )

  const handleOnEndReached = useCallback(() => {
    if (posts.length >= batchSize) {
      loadMorePosts(currentUser?.id)
    }
  }, [currentUser?.id, posts, loadMorePosts])

  const onFeedScroll = () => {}

  const onEmptyStatePress = useCallback(() => {
    navigation.navigate('Friends')
  }, [navigation])

  const emptyStateConfig = {
    title: localized('Welcome'),
    description: localized(
      'Go ahead and follow a few friends. Their posts will show up here.',
    ),
    buttonName: localized('Find Friends'),
    onPress: onEmptyStatePress,
  }

  const pullToRefreshConfig = {
    refreshing: refreshing,
    onRefresh: () => {
      pullToRefresh(currentUser?.id)
    },
  }

  return (
    <View style={styles.container}>
      {isUploadingStory && <TNActivityIndicator />}
      <Feed
        loading={loading}
        posts={posts}
        onCommentPress={onCommentPress}
        user={currentUser}
        isCameraOpen={isCameraOpen}
        onCameraClose={onCameraClose}
        onUserItemPress={onUserItemPress}
        onFeedUserItemPress={onFeedUserItemPress}
        isMediaViewerOpen={isMediaViewerOpen}
        feedItems={selectedFeedItems}
        onMediaClose={onMediaClose}
        onMediaPress={onMediaPress}
        selectedMediaIndex={selectedMediaIndex}
        storiesEnabled={true}
        stories={groupedStories || []}
        userStories={myStories}
        onStoriesListEndReached={onStoriesListEndReached}
        onPostStory={onPostStory}
        onReaction={onReaction}
        handleOnEndReached={handleOnEndReached}
        isLoadingBottom={isLoadingBottom}
        onSharePost={onSharePost}
        onDeletePost={onDeletePost}
        onUserReport={onUserReport}
        onFeedScroll={onFeedScroll}
        shouldReSizeMedia={true}
        displayStories={true}
        willBlur={willBlur}
        onEmptyStatePress={onEmptyStatePress}
        adsManager={adsManager}
        emptyStateConfig={emptyStateConfig}
        navigation={navigation}
        pullToRefreshConfig={pullToRefreshConfig}
      />
    </View>
  )
}
export default FeedScreen
