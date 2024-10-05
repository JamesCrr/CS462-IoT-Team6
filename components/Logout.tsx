import AsyncStorage from "@react-native-async-storage/async-storage";
import { Pressable, View } from "react-native";
import { LogOut } from "~/lib/icons/Logout";
import { router } from "expo-router";

export function Logout() {
  // const { isDarkColorScheme, setColorScheme } = useColorScheme();
  return (
    <Pressable
      onPress={() => {
        router.replace("/");
      }}
    >
      <LogOut className="text-foreground" size={24} strokeWidth={1.25} />
    </Pressable>
  );
}
