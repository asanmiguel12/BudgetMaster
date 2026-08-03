import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { BudgetProvider, useBudget } from './src/context/BudgetContext';
import { PlaidProvider } from './src/context/PlaidContext';
import BudgetSetupModal from './src/components/BudgetSetupModal';
import FloatingTabBar from './src/components/FloatingTabBar';
import HomeScreen from './src/screens/HomeScreen';
import ActivityScreen from './src/screens/ActivityScreen';
import InsightsScreen from './src/screens/InsightsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 400, fade: true });

function AppContent() {
  const { isLoadingBudget, needsBudgetSetup } = useBudget();
  const { isAuthReady } = useAuth();
  const isAppReady = isAuthReady && !isLoadingBudget;

  useEffect(() => {
    if (isAppReady) {
      SplashScreen.hideAsync();
    }
  }, [isAppReady]);

  if (!isAppReady) {
    return null;
  }

  return (
    <>
      <NavigationContainer>
        <Tab.Navigator
          tabBar={(props) => <FloatingTabBar {...props} />}
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              position: 'absolute',
              backgroundColor: 'transparent',
              borderTopWidth: 0,
              elevation: 0,
              shadowOpacity: 0,
            },
          }}
        >
          <Tab.Screen name="Home" component={HomeScreen} />
          <Tab.Screen name="Activity" component={ActivityScreen} />
          <Tab.Screen name="Insights" component={InsightsScreen} />
          <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
      </NavigationContainer>
      {needsBudgetSetup && <BudgetSetupModal />}
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PlaidProvider>
          <BudgetProvider>
            <AppContent />
          </BudgetProvider>
        </PlaidProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
