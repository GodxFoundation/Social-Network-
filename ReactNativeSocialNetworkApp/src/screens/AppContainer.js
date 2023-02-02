import { NavigationContainer } from '@react-navigation/native'
import RootNavigator from '../navigators/RootNavigator'
import React from 'react'

const AppContainer = () => {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  )
}

export default AppContainer
