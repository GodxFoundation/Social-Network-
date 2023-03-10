import { StyleSheet, Dimensions } from 'react-native'
import { ifIphoneX } from 'react-native-iphone-x-helper'

const height = Dimensions.get('window').height
const imageContainerWidth = Math.floor(height * 0.076)
const imageWidth = imageContainerWidth - 6

const mentionItemContainerHeight = Math.floor(height * 0.066)
const mentionPhotoSize = Math.floor(mentionItemContainerHeight * 0.66)

const dynamicStyles = (theme, appearance) => {
  const colorSet = theme.colors[appearance]

  return new StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorSet.primaryBackground,
    },
    topContainer: {
      flex: 0.7,
    },
    headerContainer: {
      flexDirection: 'row',
      flex: 4.3,
      // backgroundColor: 'blue',
    },
    userIconContainer: {
      width: imageContainerWidth,
      height: imageContainerWidth,
      borderRadius: Math.floor(imageContainerWidth / 2),
    },
    userIcon: {
      width: imageWidth,
      height: imageWidth,
      borderRadius: Math.floor(imageWidth / 2),
    },
    titleContainer: {
      marginTop: 19,
    },
    title: {
      color: colorSet.primaryText,
      fontSize: 15,
      fontWeight: '600',
    },
    subtitle: {
      color: colorSet.primaryText,
      fontSize: 10,
    },
    postInputContainer: {
      flex: 6,
      alignItems: 'center',
    },
    postInput: {
      height: '90%',
      width: '90%',
      color: colorSet.primaryText,
      textAlignVertical: 'top',
      //
      // borderWidth: 0,
    },
    bottomContainer: {
      flex: 0.5,
      justifyContent: 'flex-end',
    },
    blankBottom: {
      ...ifIphoneX(
        {
          flex: 1.1,
        },
        {
          flex: 1.4,
        },
      ),
    },
    postImageAndLocationContainer: {
      width: '100%',
      backgroundColor: colorSet.grey0,
    },
    //users mention container
    usersMentionContainer: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colorSet.grey0,
    },
    usersMentionScrollContainer: {
      flex: 1,
    },
    mentionItemContainer: {
      width: ' 100%',
      height: mentionItemContainerHeight,
      alignSelf: 'center',
      padding: 10,
      alignItems: 'center',
      flexDirection: 'row',
    },
    mentionPhotoContainer: {
      flex: 0.8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    mentionPhoto: {
      height: mentionPhotoSize,
      borderRadius: mentionPhotoSize / 2,
      width: mentionPhotoSize,
    },
    mentionNameContainer: {
      flex: 6,
      height: '100%',
      justifyContent: 'center',
      borderBottomColor: colorSet.hairlineColor,
      borderBottomWidth: 0.5,
    },
    mentionName: {
      color: colorSet.primaryText,
      fontWeight: '400',
    },
    //
    imagesContainer: {
      width: '100%',
      marginBottom: 23,
    },
    imageItemcontainer: {
      width: 65,
      height: 65,
      margin: 3,
      marginTop: 5,
      borderRadius: 9,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'grey',
      overflow: 'hidden',
    },
    imageItem: {
      width: '100%',
      height: '100%',
    },
    addImageIcon: {
      width: '50%',
      height: '50%',
    },
    addTitleAndlocationIconContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    addTitleContainer: {
      flex: 5.8,
      justifyContent: 'center',
    },
    addTitle: {
      color: colorSet.primaryText,
      fontSize: 13,
      padding: 8,
    },
    iconsContainer: {
      flex: 3,
      flexDirection: 'row',
      justifyContent: 'center',
    },
    iconContainer: {
      height: 50,
      width: 50,
      marginHorizontal: 2,
    },
    icon: {
      height: 23,
      width: 23,
    },
    imageBackground: {
      backgroundColor: colorSet.primaryForeground,
    },
    cameraFocusTintColor: {
      tintColor: colorSet.primaryForeground,
    },
    cameraUnfocusTintColor: {
      tintColor: colorSet.primaryText,
    },
    pinpointTintColor: {
      tintColor: colorSet.primaryText,
    },
  })
}

export default dynamicStyles
