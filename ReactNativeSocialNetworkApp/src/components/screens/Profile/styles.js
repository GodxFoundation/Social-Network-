import { Dimensions, StyleSheet } from 'react-native'

const imageWidth = 110

const dynamicStyles = (theme, appearance) => {
  const colorSet = theme.colors[appearance]
  const windowWidth = Dimensions.get('window').width
  const windowHeight = Dimensions.get('window').height

  return new StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorSet.grey0,
    },
    progressBar: {
      backgroundColor: colorSet.primaryForeground,
      height: 3,
      shadowColor: '#000',
      width: 0,
    },
    subContainer: {
      flex: 1,
      backgroundColor: colorSet.grey0,
      alignItems: 'center',
    },
    userImage: {
      width: imageWidth,
      height: imageWidth,
      borderRadius: Math.floor(imageWidth / 2),
      borderWidth: 0,
    },
    userImageContainer: {
      width: imageWidth,
      height: imageWidth,
      borderWidth: 0,
      margin: 18,
    },
    userImageMainContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    userName: {
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
      color: colorSet.primaryText,
      paddingTop: 0,
    },
    profileSettingsButtonContainer: {
      width: '92%',
      height: 40,
      borderRadius: 8,
      backgroundColor: appearance === 'dark' ? '#062246' : '#e8f1fd',
      marginVertical: 9,
      justifyContent: 'center',
      alignItems: 'center',
    },
    profileSettingsTitle: {
      color: colorSet.primaryForeground,
      fontSize: 13,
      fontWeight: '600',
    },
    FriendsTitle: {
      color: colorSet.primaryText,
      fontSize: 20,
      fontWeight: '600',
      alignSelf: 'flex-start',
      padding: 10,
    },
    FriendsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      width: '98%',
    },
    friendCardContainer: {
      height: Math.floor(windowHeight * 0.18),
      width: Math.floor(windowWidth * 0.292),
      borderRadius: Math.floor(windowWidth * 0.013),
      backgroundColor: colorSet.primaryBackground,
      justifyContent: 'flex-start',
      overflow: 'hidden',
      margin: 5,
    },
    friendCardImage: {
      height: '75%',
      width: '100%',
    },
    friendCardTitle: {
      color: colorSet.primaryText,
      fontSize: 13,
      padding: 4,
    },
    subButtonColor: {
      backgroundColor: appearance === 'dark' ? '#20242d' : '#eaecf0',
    },
    titleStyleColor: { color: colorSet.primaryText },
  })
}

export default dynamicStyles
