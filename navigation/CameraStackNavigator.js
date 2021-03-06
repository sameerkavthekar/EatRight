import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CameraScreen } from "../screens/CameraScreen";
const Stack = createNativeStackNavigator();
const CameraStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="CameraHome" component={CameraScreen} />
    </Stack.Navigator>
  );
};

export default CameraStackNavigator;
