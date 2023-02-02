import { Platform } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { useTranslations } from 'dopenative'
import DrawerNavigator from './DrawerNavigator'
import BottomTabNavigator from './BottomTabNavigator'
import {
  IMEditProfileScreen,
  IMUserSettingsScreen,
  IMContactUsScreen,
  IMProfileSettingsScreen,
} from '../Core/profile'
import { IMAllFriendsScreen } from '../Core/socialgraph/friendships'
import { IMNotificationScreen } from '../Core/notifications'
import { FeedSearchScreen, DetailPostScreen, ProfileScreen } from '../screens'
import { IMChatScreen, IMViewGroupMembersScreen } from '../Core/chat'
import useNotificationOpenedApp from '../Core/helpers/notificationOpenedApp'

const MainStack = createStackNavigator()
const MainStackNavigator = () => {
  useNotificationOpenedApp()
  const { localized } = useTranslations()
  return (
    <MainStack.Navigator
      screenOptions={{
        headerBackTitleVisible: false,
        headerBackTitle: localized('Back'),
      }}
      initialRouteName="NavStack">
      <MainStack.Screen
        name="NavStack"
        options={{ headerShown: false }}
        component={Platform.OS === 'ios' ? BottomTabNavigator : DrawerNavigator}
      />
      <MainStack.Screen name="FeedSearch" component={FeedSearchScreen} />
      <MainStack.Screen name="MainDetailPost" component={DetailPostScreen} />
      <MainStack.Screen name="MainProfile" component={ProfileScreen} />
      <MainStack.Screen name="Notification" component={IMNotificationScreen} />
      <MainStack.Screen
        name="ProfileSettings"
        component={IMProfileSettingsScreen}
      />
      <MainStack.Screen name="EditProfile" component={IMEditProfileScreen} />
      <MainStack.Screen name="AppSettings" component={IMUserSettingsScreen} />
      <MainStack.Screen name="ContactUs" component={IMContactUsScreen} />
      <MainStack.Screen name="AllFriends" component={IMAllFriendsScreen} />
      <MainStack.Screen
        name="MainProfilePostDetails"
        component={DetailPostScreen}
      />
      <MainStack.Screen name="PersonalChat" component={IMChatScreen} />
      <MainStack.Screen
        name="ViewGroupMembers"
        component={IMViewGroupMembersScreen}
      />
    </MainStack.Navigator>
  )
}

export default MainStackNavigator
