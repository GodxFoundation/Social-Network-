import React from 'react'
import { Text, View } from 'react-native'
import { useTheme } from 'dopenative'
import FastImage from 'react-native-fast-image'
import PropTypes from 'prop-types'
import dynamicStyles from './styles'

function CommentItem(props) {
  const { item } = props
  const { theme, appearance } = useTheme()
  const styles = dynamicStyles(theme, appearance)

  return (
    <View style={styles.commentItemContainer}>
      <View style={styles.commentItemImageContainer}>
        <FastImage
          style={styles.commentItemImage}
          source={{
            uri: item?.author?.profilePictureURL,
          }}
        />
      </View>
      <View style={styles.commentItemBodyContainer}>
        <View style={styles.commentItemBodyRadiusContainer}>
          <Text style={styles.commentItemBodyTitle}>
            {item?.author?.username?.length > 0
              ? item?.author?.username
              : `${item?.author?.firstName} ${item?.author?.lastName} `}
          </Text>
          <Text style={styles.commentItemBodySubtitle}>{item.commentText}</Text>
        </View>
      </View>
    </View>
  )
}

CommentItem.propTypes = {
  item: PropTypes.object,
}

export default CommentItem
