import { StyleSheet } from 'react-native'
import { ifIphoneX } from 'react-native-iphone-x-helper'

const dynamicStyles = (theme, appearance) => {
  const colorSet = theme.colors[appearance]

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorSet.primaryBackground,
    },
    searchBarContainer: {
      width: '100%',
      paddingVertical: 5,
      ...ifIphoneX(
        {
          marginTop: 45,
        },
        {
          marginTop: 12,
        },
      ),
      borderBottomWidth: 0.5,
      borderBottomColor: colorSet.hairlineColor,
    },
  })
}

export default dynamicStyles
