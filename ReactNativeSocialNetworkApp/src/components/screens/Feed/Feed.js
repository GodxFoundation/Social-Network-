import React, { useRef, useCallback } from 'react'
import { FlatList, View, ActivityIndicator, Dimensions } from 'react-native'
import { Viewport } from '@skele/components'
import { useTheme } from 'dopenative'
import FeedItem from '../../FeedItem/FeedItem'
import dynamicStyles from './styles'
import IMCameraModal from '../../../Core/camera/IMCameraModal'
import TNMediaViewerModal from '../../../Core/truly-native/TNMediaViewerModal'
import FullStories from '../../../Core/stories/FullStories'
import { TNEmptyStateView } from '../../../Core/truly-native'
import { IMNativeFBAdComponentView } from '../../../Core/ads/facebook'
import { useConfig } from '../../../config'

const HEIGHT = Dimensions.get('window').height

function Feed(props) {
  const {
    onCommentPress,
    posts,
    user,
    isCameraOpen = false,
    onCameraClose,
    onUserItemPress,
    onFeedUserItemPress,
    isMediaViewerOpen,
    feedItems,
    onMediaClose,
    onMediaPress,
    selectedMediaIndex,
    stories,
    onPostStory,
    userStories,
    onStoriesListEndReached,
    onReaction,
    onLikeReaction,
    onOtherReaction,
    loading,
    handleOnEndReached,
    isLoadingBottom,
    onSharePost,
    onDeletePost,
    onUserReport,
    onFeedScroll,
    willBlur,
    displayStories,
    selectedFeedIndex,
    shouldReSizeMedia,
    onEmptyStatePress,
    adsManager,
    emptyStateConfig,
    navigation,
    pullToRefreshConfig,
  } = props

  const { onRefresh, refreshing } = pullToRefreshConfig

  const config = useConfig()
  const { theme, appearance } = useTheme()
  const styles = dynamicStyles(theme, appearance)
  const fullStoryRef = useRef()
  const mediaLayouts = useRef([])

  const onImagePost = source => {
    onPostStory(source)

    // fullStoryRef.current.postStory(story);
    // console.log(source);
  }

  const getItemLayout = (data, index) => ({
    length: posts?.length ?? 0,
    offset: HEIGHT * 0.55 * index,
    index,
  })

  const onTextFieldUserPress = userInfo => {
    navigation.navigate('MainProfile', {
      user: userInfo,
      stackKeyTitle: 'MainProfile',
      lastScreenTitle: 'MainProfile',
    })
  }

  const onTextFieldHashTagPress = hashtag => {
    navigation.push('FeedSearch', { hashtag })
  }

  const renderItem = ({ item, index }) => {
    const isLastItem = index === posts?.length - 1
    let shouldUpdate = false
    if (item.shouldUpdate) {
      shouldUpdate = item.shouldUpdate
    }
    if (item.isAd) {
      return (
        <IMNativeFBAdComponentView key={index + 'ad'} adsManager={adsManager} />
      )
    }
    return (
      <FeedItem
        key={index + 'feeditem'}
        onUserItemPress={onFeedUserItemPress}
        item={item}
        isLastItem={isLastItem}
        feedIndex={index}
        onCommentPress={onCommentPress}
        onMediaPress={onMediaPress}
        shouldReSizeMedia={shouldReSizeMedia}
        onReaction={onReaction}
        onLikeReaction={onLikeReaction}
        onOtherReaction={onOtherReaction}
        iReact={item.iReact}
        shouldUpdate={shouldUpdate}
        userReactions={item.userReactions}
        onSharePost={onSharePost}
        onDeletePost={onDeletePost}
        onUserReport={onUserReport}
        user={user}
        willBlur={willBlur}
        shouldDisplayViewAllComments={true}
        onTextFieldUserPress={onTextFieldUserPress}
        onTextFieldHashTagPress={onTextFieldHashTagPress}
        onLayout={event => {
          if (
            event &&
            event.nativeEvent &&
            mediaLayouts &&
            mediaLayouts.current
          ) {
            const layout = event.nativeEvent.layout
            mediaLayouts.current[index] = layout.x
          }
        }}
      />
    )
  }

  const renderListHeader = useCallback(() => {
    if (displayStories) {
      return (
        <FullStories
          ref={fullStoryRef}
          user={user}
          onUserItemPress={onUserItemPress}
          stories={stories}
          userStories={userStories}
          onStoriesListEndReached={onStoriesListEndReached}
        />
      )
    }
    return null
  }, [displayStories, stories, userStories])

  const renderListFooter = () => {
    if (isLoadingBottom) {
      return <ActivityIndicator style={{ marginVertical: 7 }} size="small" />
    }
    return null
  }

  const renderEmptyComponent = () => {
    return (
      <TNEmptyStateView
        style={styles.emptyStateView}
        emptyStateConfig={emptyStateConfig}
      />
    )
  }

  if (loading) {
    return (
      <View style={styles.feedContainer}>
        <ActivityIndicator style={{ marginTop: 15 }} size="small" />
      </View>
    )
  }

  return (
    <View style={styles.feedContainer}>
      <Viewport.Tracker>
        <FlatList
          scrollEventThrottle={16}
          onScroll={onFeedScroll}
          showsVerticalScrollIndicator={false}
          getItemLayout={getItemLayout}
          ListHeaderComponent={renderListHeader}
          ListFooterComponent={renderListFooter}
          ListEmptyComponent={renderEmptyComponent}
          data={posts}
          renderItem={renderItem}
          onEndReachedThreshold={0.3}
          onEndReached={handleOnEndReached}
          onRefresh={onRefresh}
          refreshing={refreshing}
          removeClippedSubviews={true}
        />
      </Viewport.Tracker>
      <IMCameraModal
        isCameraOpen={isCameraOpen}
        onImagePost={onImagePost}
        onCameraClose={onCameraClose}
        maxDuration={config.videoMaxDuration}
      />
      <TNMediaViewerModal
        mediaItems={feedItems}
        isModalOpen={isMediaViewerOpen}
        onClosed={onMediaClose}
        selectedMediaIndex={selectedMediaIndex}
      />
    </View>
  )
  // }
}

export default Feed
