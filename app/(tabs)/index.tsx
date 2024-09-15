import React, { createContext, useContext, useState } from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { Dimensions, useColorScheme, View, Text, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import ContactScreen from "../../screens/Contact";
import ProfileScreen from "../../screens/Profile";
import FavoritesScreen from "../../screens/Favorites";
import UserScreen from "../../screens/User";
import CallScreen from "../../screens/Call";
import BlockedUsersScreen from "../../screens/BlockedUsersScreen";
import { colors } from '@/utility/colors';

const Stack = createStackNavigator();
const Tab = createMaterialBottomTabNavigator();

const lightTheme = {
  background: 'white',
  text: 'black',
  primary: 'white',
};

const darkTheme = {
  background: 'black',
  text: 'white',
  primary: 'coral',
};

const headerStyle: any = (theme: any) => {
  const { width } = Dimensions.get('window');
  return {
    headerTintColor: theme.text,
    headerStyle: {
      backgroundColor: theme.primary,
      height: width > 600 ? 100 : 50,
    },
    headerTitleAlign: 'center',
    headerTitleStyle: {
      fontWeight: 'bold',
      fontSize: 25,
      height: 25,
      alignItems: 'center',
    },
  };
};

const ThemeContext = createContext({
  theme: lightTheme,
  toggleTheme: () => {},
});

const getTabBarIcon = (iconName: string) => {
  return ({ color }: { color: string }) => (
    <MaterialIcons name={iconName} color={color} size={26} />
  );
};

const ContactScreens = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <Stack.Navigator initialRouteName="Contacts" screenOptions={headerStyle(theme)}>
      <Stack.Screen
        name="Contacts"
        component={ContactScreen}
        options={{ title: 'Contacts' }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={({ route }: { route: any }) => {
          const { contact } = route.params;
          const name = `${contact.name.title} ${contact.name.first} ${contact.name.last}`;
          return {
            title: name,
            headerTintColor: theme.text,
            headerStyle: { backgroundColor: theme.primary },
          };
        }}
      />
      <Stack.Screen
        name="Call"
        component={CallScreen}
        options={{
          headerTintColor: theme.text,
          headerStyle: { backgroundColor: theme.primary },
          header: () => <View />,
        }}
      />
      <Stack.Screen
        name="BlockedUsers"
        component={BlockedUsersScreen}
        options={{ title: 'Blocked Users' }}
      />
    </Stack.Navigator>
  );
};


export default function AppNavigator() {
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  const theme = isDarkMode ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <NavigationContainer independent={true}>
        <Tab.Navigator
          initialRouteName="ContactScreens"
          barStyle={{
            backgroundColor: theme.primary,
            height: 65,
            alignContent: 'center',
          }}
          labeled={false}
          activeColor={theme.text}
          inactiveColor={colors.gray}
        >
          <Tab.Screen
            name="ContactScreens"
            component={ContactScreens}
            options={{
              tabBarIcon: getTabBarIcon('list'),
            }}
          />
          <Tab.Screen
            name="FavoritesScreens"
            component={FavoritesScreen}
            options={{
              tabBarIcon: getTabBarIcon('star'),
            }}
          />
          <Tab.Screen
            name="UserScreens"
            component={UserScreen}
            options={{
              tabBarIcon: getTabBarIcon('person'),
            }}
          />
          <Tab.Screen
            name="BlockedScreens"
            component={BlockedUsersScreen}
            options={{
              tabBarIcon: getTabBarIcon('block'),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </ThemeContext.Provider>
  );
}	