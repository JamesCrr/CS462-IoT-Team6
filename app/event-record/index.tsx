import { useLocalSearchParams } from "expo-router";
import { DocumentData } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { fetchEvent } from "~/api/events";
import { Button } from "~/components/ui/button";
import { fetchEventRecord } from "~/api/eventRecords";
import { useRoute } from "@react-navigation/native";

interface EventRecords {
  eventId: string;
  records: Record[];
}

interface Record {
  userId: EventUserRecords[];
}

interface EventUserRecords {
  photoArray: string[];
  achievements: string[]; 
  completion: number;
  rank: number;
  remarks: string;
  score: number;
}


export default function EventRecords() {
  const navigation = useNavigation();
  const [event, setEvent] = useState<Event>();
  const [loading, setLoading] = useState<boolean>(false);

  const route = useRoute();

  const { eventId, userId } = route.params as { eventId: string; userId: string };


  useEffect(() => {
    console.log("EventId:", eventId);
    console.log("UserId:", userId);
    fetchEvent();
  }, []);


  const fetchEvent = async () => {
    setLoading(true);

    try {
      const event = await fetchEventRecord(eventId, userId);
      if (event == null) {
        throw new Error("");
      }

    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView>
      <Text>Event Record</Text>
    </SafeAreaView>
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
