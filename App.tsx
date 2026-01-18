import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { RootStackParamList } from './src/navigation/types';
import HomeScreen from './src/screens/HomeScreen';
import CreateListScreen from './src/screens/CreateListScreen';
import EditListScreen from './src/screens/EditListScreen';
import ListDetailScreen from './src/screens/ListDetailScreen';
import AddItemScreen from './src/screens/AddItemScreen';
import EditItemScreen from './src/screens/EditItemScreen';
import AuthScreen from './src/screens/AuthScreen';
import { useAuthStore } from './src/stores/authStore';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const { user, initialized, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CreateList"
          component={CreateListScreen}
          options={{ title: 'Create Collection' }}
        />
        <Stack.Screen
          name="EditList"
          component={EditListScreen}
          options={{ title: 'Edit Collection' }}
        />
        <Stack.Screen
          name="ListDetail"
          component={ListDetailScreen}
          options={{ title: 'Collection Details' }}
        />
        <Stack.Screen
          name="AddItem"
          component={AddItemScreen}
          options={{ title: 'Add Item' }}
        />
        <Stack.Screen
          name="EditItem"
          component={EditItemScreen}
          options={{ title: 'Edit Item' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}