import React from 'react'
import PropTypes from 'prop-types'
import { ScrollView, ActivityIndicator } from 'react-native'
import { KeyboardAwareView } from 'react-native-keyboard-aware-view'
import { useTheme } from 'dopenative'
import FeedItem from '../../FeedItem/FeedItem'
import CommentItem from './CommentItem'
import CommentInput from './CommentInput'
import TNMediaViewerModal from '../../../Core/truly-native/TNMediaViewerModal'
import dynamicStyles from './styles'

function DetailPost(props) {
  const {
    feedItem,
    feedItems,
    commentItems,
    onCommentSend,
    onMediaPress,
    onReaction,
    onOtherReaction,
    onMediaClose,
    isMediaViewerOpen,
    selectedMediaIndex,
    onFeedUserItemPress,
    onSharePost,
    onDeletePost,
    onUserReport,
    user,
    commentsLoading,
    navigation,
  } = props
  const { theme, appearance } = useTheme()
  const styles = dynamicStyles(theme, appearance)

  const onCommentPress = () => {
    console.log('comment')
  }

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

  return (
    <KeyboardAwareView style={styles.detailPostContainer}>
      <ScrollView>
        <FeedItem
          item={feedItem}
          isLastItem={true}
          onUserItemPress={onFeedUserItemPress}
          onCommentPress={onCommentPress}
          onMediaPress={onMediaPress}
          onReaction={onReaction}
          onSharePost={onSharePost}
          onDeletePost={onDeletePost}
          onUserReport={onUserReport}
          user={user}
          onTextFieldHashTagPress={onTextFieldHashTagPress}
          onTextFieldUserPress={onTextFieldUserPress}
          playVideoOnLoad={true}
        />
        {commentsLoading ? (
          <ActivityIndicator style={{ marginVertical: 7 }} size="small" />
        ) : (
          commentItems &&
          commentItems.map(comment => (
            <CommentItem item={comment} key={comment.id} />
          ))
        )}
      </ScrollView>
      <CommentInput onCommentSend={onCommentSend} />
      <TNMediaViewerModal
        mediaItems={feedItems}
        isModalOpen={isMediaViewerOpen}
        onClosed={onMediaClose}
        selectedMediaIndex={selectedMediaIndex}
      />
    </KeyboardAwareView>
  )
}

export default DetailPost
