import React, { useState, useRef, useEffect, memo, useCallback } from 'react'
import PropTypes from 'prop-types'
import { Text, View, TouchableOpacity, Platform, Image } from 'react-native'
import Swiper from 'react-native-swiper'
import { useTheme, useTranslations } from 'dopenative'
import ActionSheet from 'react-native-actionsheet'
import TruncateText from 'react-native-view-more-text'
import { Viewport } from '@skele/components'
import FeedMedia from './FeedMedia'
import { TNTouchableIcon, TNStoryItem } from '../../Core/truly-native'
import IMRichTextView from '../../Core/mentions/IMRichTextView/IMRichTextView'
import dynamicStyles from './styles'
import { timeFormat } from '../../Core'

const ViewportAwareSwiper = Viewport.Aware(Swiper)

const reactionIcons = ['like', 'love', 'laugh', 'surprised', 'cry', 'angry']

const FeedItem = memo(props => {
  const {
    item,
    isLastItem,
    onCommentPress,
    containerStyle,
    onUserItemPress,
    onMediaPress,
    onReaction,
    onSharePost,
    onDeletePost,
    onUserReport,
    user,
    willBlur,
    onTextFieldUserPress,
    onTextFieldHashTagPress,
    playVideoOnLoad,
  } = props

  if (!item) {
    alert('There is no feed item to display. You must fix this error.')
    return null
  }

  const { localized } = useTranslations()
  const { theme, appearance } = useTheme()
  const styles = dynamicStyles(theme, appearance)

  const defaultReactionIcon = 'thumbsupUnfilled'
  const [postMediaIndex, setPostMediaIndex] = useState(0)
  const [inViewPort, setInViewPort] = useState(false)
  const [otherReactionsVisible, setOtherReactionsVisible] = useState(false)

  const moreRef = useRef()
  const moreArray = useRef([localized('Share Post')])

  const selectedIconName = item?.myReaction
    ? item.myReaction
    : defaultReactionIcon
  const reactionCount = item.reactionsCount

  useEffect(() => {
    if (item.authorID === user.id) {
      moreArray.current.push(localized('Delete Post'))
    } else {
      moreArray.current.push(localized('Block User'))
      moreArray.current.push(localized('Report Post'))
    }

    moreArray.current.push(localized('Cancel'))
  }, [item?.authorID])

  const onReactionPress = async reaction => {
    if (reaction == null) {
      // this was a single tap on the inline icon, therefore a like or unlike
      const tempReaction = item.myReaction ? null : 'like'
      onReaction(tempReaction, item)
      setOtherReactionsVisible(false)
      return
    }
    // this was a reaction on the reactions tray, coming after a long press + one tap
    if (item.myReaction && item.myReaction == reaction) {
      // Nothing changes, since this is the same reaction as before
      setOtherReactionsVisible(false)
      return
    }

    setOtherReactionsVisible(false)
    onReaction(reaction, item)
  }

  const onReactionLongPress = useCallback(() => {
    setOtherReactionsVisible(!otherReactionsVisible)
  }, [setOtherReactionsVisible, otherReactionsVisible])

  const onMorePress = useCallback(() => {
    if (otherReactionsVisible) {
      setOtherReactionsVisible(false)
      return
    }
    moreRef.current.show()
  }, [setOtherReactionsVisible, otherReactionsVisible, moreRef?.current])

  const didPressComment = useCallback(() => {
    if (otherReactionsVisible) {
      setOtherReactionsVisible(false)
      return
    }
    onCommentPress(item)
  }, [onCommentPress, setOtherReactionsVisible, otherReactionsVisible])

  const onMoreDialogDone = useCallback(
    index => {
      if (index === moreArray.current.indexOf(localized('Share Post'))) {
        onSharePost(item)
      }

      if (
        index === moreArray.current.indexOf(localized('Report Post')) ||
        index === moreArray.current.indexOf(localized('Block User'))
      ) {
        onUserReport(item, moreArray.current[index])
      }

      if (index === moreArray.current.indexOf(localized('Delete Post'))) {
        onDeletePost(item)
      }
    },
    [onSharePost, onDeletePost, onUserReport, moreArray],
  )

  const inactiveDot = () => <View style={styles.inactiveDot} />

  const activeDot = () => <View style={styles.activeDot} />

  const renderTouchableIconIcon = (src, tappedIcon, index) => {
    return (
      <TNTouchableIcon
        key={index + 'icon'}
        containerStyle={styles.reactionIconContainer}
        iconSource={src}
        imageStyle={styles.reactionIcon}
        onPress={() => onReactionPress(tappedIcon)}
      />
    )
  }

  const renderViewMore = onPress => {
    return (
      <Text onPress={onPress} style={styles.moreText}>
        {localized('more')}
      </Text>
    )
  }

  const renderViewLess = onPress => {
    return (
      <Text onPress={onPress} style={styles.moreText}>
        {localized('less')}
      </Text>
    )
  }

  const renderPostText = item => {
    if (item.postText) {
      return (
        <TruncateText
          numberOfLines={2}
          renderViewMore={renderViewMore}
          renderViewLess={renderViewLess}
          textStyle={styles.body}>
          <IMRichTextView
            defaultTextStyle={styles.body}
            onUserPress={onTextFieldUserPress}
            onHashTagPress={onTextFieldHashTagPress}>
            {item.postText || ' '}
          </IMRichTextView>
        </TruncateText>
      )
    }
    return null
  }

  const renderMedia = item => {
    if (
      item &&
      item.postMedia &&
      item.postMedia.length &&
      item.postMedia.length > 0
    ) {
      return (
        <View style={styles.bodyImageContainer}>
          <ViewportAwareSwiper
            removeClippedSubviews={false}
            containerStyle={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            dot={inactiveDot()}
            activeDot={activeDot()}
            paginationStyle={{
              bottom: 20,
            }}
            onIndexChanged={swiperIndex => setPostMediaIndex(swiperIndex)}
            loop={false}
            onViewportEnter={() => setInViewPort(true)}
            onViewportLeave={() => setInViewPort(false)}
            preTriggerRatio={-0.4}>
            {item.postMedia.map((media, index) => (
              <FeedMedia
                key={index + 'feedMedia'}
                inViewPort={inViewPort}
                index={index}
                postMediaIndex={postMediaIndex}
                media={media}
                item={item}
                isLastItem={isLastItem}
                onImagePress={onMediaPress}
                willBlur={willBlur}
                playVideoOnLoad={playVideoOnLoad}
              />
            ))}
          </ViewportAwareSwiper>
        </View>
      )
    }
    return null
  }

  const inlineActionIconStyle =
    Platform.OS === 'ios'
      ? selectedIconName == defaultReactionIcon
        ? [styles.inlineActionIconDefault]
        : [styles.inlineActionIcon]
      : [styles.inlineActionIcon]

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={didPressComment}
      style={[styles.container, containerStyle]}>
      <View style={styles.headerContainer}>
        {item.author && (
          <TNStoryItem
            imageContainerStyle={styles.userImageContainer}
            item={item.author}
            onPress={onUserItemPress}
          />
        )}
        <View style={styles.titleContainer}>
          {item.author && (
            <View style={styles.verifiedContainer}>
              <Text style={styles.title}>
                {item.author.firstName +
                  (item.author.lastName ? ' ' + item.author.lastName : '')}
              </Text>
              {item.author.isVerified && (
                <Image
                  style={styles.verifiedIcon}
                  source={require('../../assets/icons/verified.png')}
                />
              )}
            </View>
          )}
          <View style={styles.mainSubtitleContainer}>
            <View style={styles.subtitleContainer}>
              <Text style={styles.subtitle}>{timeFormat(item.createdAt)}</Text>
            </View>
            <View style={[styles.subtitleContainer, { flex: 2 }]}>
              <Text style={styles.subtitle}>{item.location}</Text>
            </View>
          </View>
        </View>
        <TNTouchableIcon
          onPress={onMorePress}
          imageStyle={styles.moreIcon}
          containerStyle={styles.moreIconContainer}
          iconSource={theme.icons.more}
        />
      </View>
      {renderPostText(item)}
      {renderMedia(item)}
      {otherReactionsVisible && (
        <View style={styles.reactionContainer}>
          {reactionIcons.map((icon, index) =>
            renderTouchableIconIcon(theme.icons[icon], icon, index),
          )}
        </View>
      )}
      <View style={styles.footerContainer}>
        <TNTouchableIcon
          containerStyle={styles.footerIconContainer}
          iconSource={theme.icons[selectedIconName]}
          imageStyle={inlineActionIconStyle}
          renderTitle={true}
          title={reactionCount < 1 ? ' ' : reactionCount}
          onLongPress={() => onReactionLongPress()}
          onPress={() => onReactionPress(null)}
        />
        <TNTouchableIcon
          containerStyle={styles.footerIconContainer}
          iconSource={theme.icons.commentUnfilled}
          imageStyle={[styles.inlineActionIconDefault]}
          renderTitle={true}
          title={item.commentCount < 1 ? ' ' : item.commentCount}
          onPress={didPressComment}
        />
      </View>
      <ActionSheet
        ref={moreRef}
        title={localized('More')}
        options={moreArray.current}
        destructiveButtonIndex={moreArray.current.indexOf('Delete Post')}
        cancelButtonIndex={moreArray.current.length - 1}
        onPress={onMoreDialogDone}
      />
    </TouchableOpacity>
  )
})

FeedItem.propTypes = {
  onPress: PropTypes.func,
  onOtherReaction: PropTypes.func,
  onLikeReaction: PropTypes.func,
  onUserItemPress: PropTypes.func,
  onCommentPress: PropTypes.func,
  onMediaPress: PropTypes.func,
  item: PropTypes.object,
  iReact: PropTypes.bool,
  containerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
}

export default FeedItem
