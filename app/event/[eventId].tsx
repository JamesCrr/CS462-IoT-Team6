import { router, useLocalSearchParams } from "expo-router";
import { DocumentData } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { fetchEvent } from "~/api/events";
import { Button } from "~/components/ui/button";

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

  // The route parameter, An optional search parameter.
  const { eventId, tab } = useLocalSearchParams<{
    eventId: string;
    tab?: string;
  }>();
  // console.log({ eventId, tab });

  useEffect(() => {
    fetchEventInfoFromDB();
  }, []);

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
                    <Text className="">{event.information}</Text>
                  </View>

                  <View className="mt-7">
                    <Text className="text-2xl font-bold">Things to bring</Text>
                    {event.itemsToBring?.map((item) => (
                      <View className="mb-7">
                        <Text className="my-2" key={item}>
                          {item}
                        </Text>
                        <Button variant="outline" className="shadow shadow-foreground/5" onPress={() => {}}>
                          <Text>See Location</Text>
                        </Button>
                      </View>
                    ))}
                  </View>

                  <View className="mt-7">
                    <Text className="text-2xl font-bold">Where to meet</Text>
                    {event.meetUpLocations?.map((location) => (
                      <Text key={location}>{location}</Text>
                    ))}
                  </View>

                  <View className="mt-7">
                    <Text className="text-2xl font-bold">Participants</Text>
                    {event.participants?.map((participant) => (
                      <Text key={participant}>{participant}</Text>
                    ))}
                  </View>

                  {/* Need to change depending on Staff / Caregiver */}
                  <Button variant="outline" className="mt-7 shadow shadow-foreground/5" onPress={() => {}}>
                    <Text>Default</Text>
                  </Button>

                  <Button
                    variant="outline"
                    className="mt-7 mb-7 shadow shadow-foreground/5"
                    onPress={() => router.push(`./editEvent/${eventId}`)}
                  >
                    <Text>edit</Text>
                  </Button>
                </ScrollView>
              </View>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>

    // <View style={styles.container}>
    //   <Text style={styles.title}>Event Records</Text>
    //   <TextInput
    //     style={styles.input}
    //     placeholder="Search by User ID"
    //     value={userId}
    //     onChangeText={setUserId}
    //   />
    //   <TextInput
    //     style={styles.input}
    //     placeholder="Search by Event ID"
    //     value={eventId}
    //     onChangeText={setEventId}
    //   />
    //   <Button title="Search" onPress={handleSearch} />
    //   {loading ? (
    //     <ActivityIndicator size="large" color="#0000ff" />
    //   ) : (
    //     <ScrollView style={styles.recordsContainer}>
    //       {eventRecords.map((record) => (
    //         <View key={record.id} style={styles.record}>
    //           <Text>User ID: {record.userId}</Text>
    //           <Text>Event ID: {record.eventId}</Text>
    //           <Text>Performance:</Text>
    //           <Text>  Achievements: {record.performance?.achievements?.length ? record.performance.achievements.join(", ") : "N/A"}</Text>
    //           <Text>  Completion Percentage: {record.performance?.completionPercentage !== undefined ? record.performance.completionPercentage * 100 : "N/A"}%</Text>
    //           <Text>  Rank: {record.performance?.rank !== undefined ? record.performance.rank : "N/A"}</Text>
    //           <Text>  Score: {record.performance?.score !== undefined ? record.performance.score : "N/A"}</Text>
    //           <Text>Remarks:</Text>
    //           <Text>  Caregiver: {record.remarks?.caregiver || "N/A"}</Text>
    //           <Text>  Community Worker: {record.remarks?.communityWorker || "N/A"}</Text>
    //         </View>
    //       ))}
    //     </ScrollView>
    //   )}
    // </View>
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
