import { router, useLocalSearchParams } from "expo-router";
import { DocumentData } from "firebase/firestore";
import { useState, useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { fetchEvent, userJoinEvent } from "~/api/events";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Checkbox } from "~/components/ui/checkbox";

interface Event {
  name: string;
  location: string;
  information: string;
  datetime: Date;
  meetUpLocations?: string[];
  itemsToBring?: string[];
  participants?: string[];
  volunteers?: string[];
}

export default function EventRecords() {
  const navigation = useNavigation();
  const [event, setEvent] = useState<Event>();
  const [loading, setLoading] = useState<boolean>(false);
  const [meetLocation, setMeetLocation] = useState<string>("");
  const [comingWithCaregiver, setComingWithCaregiver] = useState<boolean>(false);

  // The route parameter, An optional search parameter
  const { eventId, tab } = useLocalSearchParams<{
    eventId: string;
    tab?: string;
  }>();

  // Map Firestore document to the Event type
  const mapFirestoreToEvent = (eventDoc: DocumentData): Event => {
    return {
      name: eventDoc.name,
      location: eventDoc.location,
      information: eventDoc.information,
      datetime: eventDoc.datetime.toDate(), // Convert Firestore Timestamp to JavaScript Date
      meetUpLocations: eventDoc.meetUpLocations || [],
      itemsToBring: eventDoc.itemsToBring || [],
      participants: eventDoc.participants || [],
      volunteers: eventDoc.volunteers || [],
    };
  };

  const fetchEventInfoFromDB = async () => {
    setLoading(true);
    try {
      const event = await fetchEvent(eventId);
      if (event == null) {
        throw new Error("");
      }
      setEvent(mapFirestoreToEvent(event));
      setTitle("Joining " + event.name);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error(error);
      }
      setEvent(undefined);
    } finally {
      setLoading(false);
    }
  };

  const setTitle = (newTitle: any) => {
    navigation.setOptions({ title: newTitle });
  };

  const onMeetLocationPress = (label: string) => {
    return () => {
      setMeetLocation(label);
    };
  };

  /**
   * Function to join event
   */
  const joinEvent = async () => {
    try {
      await userJoinEvent(eventId, "username", meetLocation, comingWithCaregiver ? "yes" : "no");

      // Success, return to event page
      router.replace(`/event/${eventId}`);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchEventInfoFromDB();
  }, []);

  return (
    <SafeAreaView>
      <View className="px-3 min-h-full bg-secondary/30">
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <View>
            {event == undefined ? (
              <View className="flex-1 justify-center items-center">
                <Text className="text-foreground">An error occurred</Text>
                <Text className="text-foreground">Please try again</Text>
              </View>
            ) : (
              <View>
                <ScrollView>
                  {/* <Text className="text-3xl font-bold">{event.name}</Text> */}
                  <View className="mt-5">
                    <Text className="text-2xl font-bold">Event Info</Text>
                    <Text className="p-6">{event.information}</Text>
                  </View>

                  <View className="mt-7">
                    <Text className="text-2xl font-bold">Things to bring</Text>
                    {event.itemsToBring?.map((item) => (
                      <View key={item} className="">
                        <Text className="ml-6 my-2">{item}</Text>
                      </View>
                    ))}
                  </View>

                  <View className="mt-7">
                    <Text className="text-2xl font-bold">Where do you want to meet us?</Text>
                    <View className="flex-1 justify-center p-6">
                      <RadioGroup value={meetLocation} onValueChange={setMeetLocation} className="gap-3">
                        {event.meetUpLocations?.map((location) => (
                          <RadioGroupItemWithLabel
                            key={location}
                            value={location}
                            onLabelPress={onMeetLocationPress(location)}
                          />
                        ))}
                      </RadioGroup>
                    </View>
                  </View>

                  <View className="mt-7">
                    <Text className="text-2xl font-bold">Coming with Caregiver?</Text>
                    <View className="flex-1 justify-start p-6">
                      <View className="flex-1 flex-row justify-start items-center">
                        <Checkbox checked={comingWithCaregiver} onCheckedChange={setComingWithCaregiver} />{" "}
                        <Text className="ml-2">Yes I am!</Text>
                      </View>
                    </View>
                  </View>

                  {/* Need to change depending on Staff / Caregiver */}
                  <Button variant="outline" className="mt-7 shadow shadow-foreground/5" onPress={joinEvent}>
                    <Text>Join Event</Text>
                  </Button>
                </ScrollView>
              </View>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    color: "blue",
    fontSize: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  recordsContainer: {
    marginTop: 20,
  },
  record: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});
