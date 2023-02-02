import React from 'react'
import PropTypes from 'prop-types'
import { Text, TouchableOpacity } from 'react-native'
import { useTheme } from 'dopenative'
import dynamicStyles from './styles'
import FastImage from 'react-native-fast-image'

const Image = FastImage

function FriendCard(props) {
  const { theme, appearance } = useTheme()
  const styles = dynamicStyles(theme, appearance)

  const {
    onPress,
    containerStyle,
    imageStyle,
    item,
    titleStyle,
    activeOpacity,
  } = props

  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      onPress={onPress}
      style={[styles.friendCardContainer, containerStyle]}>
      <Image
        style={[styles.friendCardImage, imageStyle]}
        source={{ uri: item.profilePictureURL }}
      />
      {!!item.firstName && (
        <Text style={[styles.friendCardTitle, titleStyle]}>
          {item.firstName}
        </Text>
      )}
    </TouchableOpacity>
  )
}

FriendCard.propTypes = {
  onPress: PropTypes.func,
  imageStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  imageContainerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  containerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  titleStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  item: PropTypes.object,
  activeOpacity: PropTypes.number,
}

export default FriendCard
