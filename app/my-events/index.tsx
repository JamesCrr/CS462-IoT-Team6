import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { fetchAllEventsOfUser } from "../../api/events"; // Adjust the import path as needed
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from "@react-navigation/native";

interface Event {
  eventId: string;
  name: string;
}

// type RootStackParamList = {
//   "event-record": { eventId: string | null; userId: string }; 
// };

// const { userId, tab } = useLocalSearchParams<{
//   userId: string;
//   tab?: string;
// }>();

type RootStackParamList = {
  "my-events": { userId: string }; 
};

export default function EventRecords() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [identity, setIdentity] = useState<string>("");
  const route = useRoute();
  const { userId } = route.params as { userId: string };

  const retrieveIdentity = async () => {
    try {
      const value = await AsyncStorage.getItem("identity");
      if (value !== null) {
        setIdentity(value);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    console.log("userId:", userId)
    retrieveIdentity();
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      console.log("UserId:", userId);
      const fetchedEvents = await fetchAllEventsOfUser(userId);
      if (fetchedEvents == null) {
        console.log("Failed to fetch events");
        throw new Error("Failed to fetch events");
      } else {
        setEvents(
          fetchedEvents.map((event) => ({
            eventId: event.eventId,
            name: event.name,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToEventRecord = (eventId: string) => {
    router.push({
      pathname: "/event-record",
      params: { eventId: eventId, userId: userId }, // Using the retrieved identity as userId
    });
  };

  if (loading) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.header}>Events</Text>
        {events.map((event) => (
          <TouchableOpacity
            key={event.eventId}
            style={styles.eventItem}
            onPress={() => navigateToEventRecord(event.eventId)} // Navigate to event-record page on event click
          >
            <Text style={styles.eventText}>{event.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#333",
  },
  eventItem: {
    padding: 15,
    backgroundColor: "#f0f0f0",
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2, // for Android
    shadowColor: "#000", // for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
  },
  eventText: {
    fontSize: 16,
    color: "#333",
  },
});
