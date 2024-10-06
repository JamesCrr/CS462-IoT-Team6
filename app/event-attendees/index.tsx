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
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { fetchAllEvents } from "../../api/events"; // Adjust the import path as needed
import { router } from "expo-router";

interface Event {
  eventId: string;
  name: string;
  eventParticipants: string[];
}

interface Attendee {
  userId: string;
}

type RootStackParamList = {
  "event-record": { eventId: string | null; userId: string }; 
};

export default function EventRecords() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const fetchedEvents = await fetchAllEvents();
      // console.log("FetchEvents:", fetchedEvents);
      if (fetchedEvents == null) {
        console.log("Failed to fetch events");
        throw new Error("Failed to fetch events");
      } else {
        fetchedEvents.map((event) => {
          console.log("Event:", event, "\n");
        });
        setEvents(
          fetchedEvents.map((event) => ({
            eventId: event.eventId,
            name: event.name,
            eventParticipants: event.participants,
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectEvent = async (eventId: string) => {
    setLoading(true);
    try {
      const selectedEvent = events.find((event) => event.eventId === eventId);
      console.log("Selected Event:", selectedEvent);
      setSelectedEvent(eventId);

      if (selectedEvent?.eventParticipants) {
        setAttendees(
          selectedEvent.eventParticipants.map((userId) => ({ userId }))
        );
      } else {
        setAttendees([]);
      }
    } catch (error) {
      console.error("Failed to select event or fetch attendees:", error);
    } finally {
      setLoading(false);
    }
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
            onPress={() => selectEvent(event.eventId)}
          >
            <Text style={styles.eventText}>{event.name}</Text>
          </TouchableOpacity>
        ))}
        <View style={styles.attendeeContainer}>
          {attendees.map((attendee) => (
            <TouchableOpacity
              key={attendee.userId}
              style={styles.attendee}
              onPress={() =>
              selectedEvent && router.push({
                pathname: "/event-record",
                params: { eventId: selectedEvent, userId: attendee.userId },
              })
              }
            >
              <Text style={styles.attendeeText}>{attendee.userId}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
  attendeeContainer: {
    marginTop: 20,
  },
  attendee: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#fff",
    marginBottom: 5,
  },
  attendeeText: {
    fontSize: 16,
    color: "#555",
  },
});
