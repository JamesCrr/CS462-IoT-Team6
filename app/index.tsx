// import AsyncStorage from "@react-native-async-storage/async-storage";
// import * as React from "react";
// import { View, Text } from "react-native";
// import { Button } from "~/components/ui/button";
// import { Card, CardContent } from "~/components/ui/card";
// import { router } from "expo-router";
// import { Label } from "~/components/ui/label";
// import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";

// export default function Screen() {
//   const [type, setType] = React.useState("");

//   function onLabelPress(label: string) {
//     return () => {
//       setType(label);
//     };
//   }
//   const signIn = async () => {
//     if (type === "") return;

//     if (type === "Caregiver") {
//       router.replace("/caregivers");
//     } else {
//       router.replace("/home");
//     }

//     // Store in AsyncStorage
//     try {
//       await AsyncStorage.setItem("identity", type);
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   return (
//     <View className="flex-1 justify-center items-center gap-5 p-6 bg-secondary/30">
//       <Card className="w-full max-w-sm p-6 rounded-2xl">
//         <CardContent>
//           <View className="mb-5">
//             <RadioGroup value={type} onValueChange={setType} className="gap-3">
//               <RadioGroupItemWithLabel value="Staff" onLabelPress={onLabelPress("Staff")} />
//               <RadioGroupItemWithLabel value="Caregiver" onLabelPress={onLabelPress("Caregiver")} />
//             </RadioGroup>
//           </View>

//           <Button disabled={type == ""} onPress={signIn} variant={"outline"} className={"shadow shadow-foreground/5"}>
//             <Text>Sign In</Text>
//           </Button>
//         </CardContent>
//       </Card>
//     </View>
//   );
// }

// function RadioGroupItemWithLabel({ value, onLabelPress }: { value: string; onLabelPress: () => void }) {
//   return (
//     <View className={"flex-row gap-2 items-center"}>
//       <RadioGroupItem aria-labelledby={`label-for-${value}`} value={value} />
//       <Label nativeID={`label-for-${value}`} onPress={onLabelPress}>
//         {value}
//       </Label>
//     </View>
//   );
  // }

  import AsyncStorage from "@react-native-async-storage/async-storage";
  import * as React from "react";
  import { View, Text, TextInput, Alert } from "react-native";
  import { Button } from "~/components/ui/button";
  import { Card, CardContent } from "~/components/ui/card";
  import { router } from "expo-router";
  import { Label } from "~/components/ui/label";
  import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
  import * as firebase from 'firebase/app';
  import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
  import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
  import { db } from '~/config/firebaseConfig'; // Import db from your config file
  
  // Get auth instance
  const auth = getAuth();
  
  export default function Screen() {
    const [userData, setUserData] = React.useState({
      type: "",
      email: "",
      password: "",
      displayName: ""
    });
    const [isRegistering, setIsRegistering] = React.useState(false);
  
    const updateUserData = (field: string, value: string) => {
      setUserData(prevData => ({ ...prevData, [field]: value }));
    };
  
    function onLabelPress(label: string) {
      return () => {
        updateUserData("type", label);
      };
    }
  
    const authenticate = async () => {
      if (isRegistering && (userData.type === "" || userData.displayName === "")) {
        Alert.alert("Error", "Please fill in all fields and select a user type.");
        return;
      }
      if (!isRegistering && (userData.email === "" || userData.password === "")) {
        Alert.alert("Error", "Please fill in all fields.");
        return;
      }
  
      try {
        let userCredential;
        let userType = userData.type;
  
        if (isRegistering) {
          userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
          // Store user type and display name in Firestore
          await setDoc(doc(db, "users", userCredential.user.uid), {
            type: userType,
            email: userData.email,
            displayName: userData.displayName
          });
        } else {
          userCredential = await signInWithEmailAndPassword(auth, userData.email, userData.password);
          // Fetch user type and display name from Firestore
          const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
          if (userDoc.exists()) {
            userType = userDoc.data().type;
            userData.displayName = userDoc.data().displayName;
          } else {
            throw new Error("User data not found");
          }
        }
  
        // Store user info in AsyncStorage
        const user = { email: userCredential.user.email, type: userType, displayName: userData.displayName, uid: userCredential.user.uid };
        await AsyncStorage.setItem("user", JSON.stringify(user));
  
        if (userType === "Caregiver") {
          router.replace("/caregivers");
        } else {
          router.replace("/home");
        }
      } catch (error) {
        console.error(error);
        Alert.alert("Authentication Error", error.message);
      }
    };
  
    const toggleMode = () => {
      setIsRegistering(!isRegistering);
      setUserData(prevData => ({
        ...prevData,
        type: "",
        displayName: ""
      }));
    };
  
    return (
      <View className="flex-1 justify-center items-center gap-5 p-6 bg-secondary/30">
        <Card className="w-full max-w-sm p-6 rounded-2xl">
          <CardContent>
            <Text className="text-center font-bold mb-4">
              {isRegistering ? "Register" : "Sign In"}
            </Text>
            
            {isRegistering && (
              <TextInput
                placeholder="Display Name"
                value={userData.displayName}
                onChangeText={(value) => updateUserData("displayName", value)}
                className="border border-gray-300 rounded-md p-2 mb-2"
              />
            )}
            
            <TextInput
              placeholder="Email"
              value={userData.email}
              onChangeText={(value) => updateUserData("email", value)}
              className="border border-gray-300 rounded-md p-2 mb-2"
            />
            <TextInput
              placeholder="Password"
              value={userData.password}
              onChangeText={(value) => updateUserData("password", value)}
              secureTextEntry
              className="border border-gray-300 rounded-md p-2 mb-4"
            />
            
            {isRegistering && (
              <RadioGroup value={userData.type} onValueChange={(value) => updateUserData("type", value)} className="gap-3 mb-4">
                <RadioGroupItemWithLabel value="Staff" onLabelPress={onLabelPress("Staff")} />
                <RadioGroupItemWithLabel value="Caregiver" onLabelPress={onLabelPress("Caregiver")} />
              </RadioGroup>
            )}
  
            <Button 
              disabled={(isRegistering && (userData.type === "" || userData.displayName === "")) || userData.email === "" || userData.password === ""} 
              onPress={authenticate} 
              variant={"outline"} 
              className={"shadow shadow-foreground/5 mb-2"}
            >
              <Text>{isRegistering ? "Register" : "Sign In"}</Text>
            </Button>
  
            <Button 
              onPress={toggleMode} 
              variant={"outline"} 
              className={"shadow shadow-foreground/5"}
            >
              <Text>{isRegistering ? "Have an account? Sign In" : "Need an account? Register"}</Text>
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