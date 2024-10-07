import AsyncStorage from "@react-native-async-storage/async-storage";
import * as React from "react";
import { View, Text } from "react-native";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { router } from "expo-router";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";

export default function Screen() {
  const [type, setType] = React.useState("");

  function onLabelPress(label: string) {
    return () => {
      setType(label);
    };
  }
  const signIn = async () => {
    if (type == "") return;
    router.replace("/home");

    // Store in AsyncStorage
    try {
      await AsyncStorage.setItem("identity", type);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View className="flex-1 justify-center items-center gap-5 p-6 bg-secondary/30">
      <Card className="w-full max-w-sm p-6 rounded-2xl">
        <CardContent>
          <View className="mb-5">
            <RadioGroup value={type} onValueChange={setType} className="gap-3">
              <RadioGroupItemWithLabel value="Staff" onLabelPress={onLabelPress("Staff")} />
              <RadioGroupItemWithLabel value="Caregiver" onLabelPress={onLabelPress("Caregiver")} />
            </RadioGroup>
          </View>

          <Button disabled={type == ""} onPress={signIn} variant={"outline"} className={"shadow shadow-foreground/5"}>
            <Text>Sign In</Text>
          </Button>
        </CardContent>
      </Card>
    </View>
  );
}

function RadioGroupItemWithLabel({ value, onLabelPress }: { value: string; onLabelPress: () => void }) {
  return (
    <View className={"flex-row gap-2 items-center"}>
      <RadioGroupItem aria-labelledby={`label-for-${value}`} value={value} />
      <Label nativeID={`label-for-${value}`} onPress={onLabelPress}>
        {value}
      </Label>
    </View>
  );
}
