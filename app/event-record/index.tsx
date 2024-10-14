import { useLocalSearchParams } from "expo-router";
import { DocumentData } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Image, TextInput, Dimensions } from "react-native";
import { ViewStyle, TextStyle, ImageStyle } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { fetchEvent } from "~/api/events";
import { Button } from "~/components/ui/button";
import { fetchEventRecord } from "~/api/eventRecords";
import { useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import Carousel from 'react-native-snap-carousel';

interface CarouselPhotos {
  title: string;
  text: string;
}

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
  const route = useRoute();
  const { eventId, userId } = route.params as { eventId: string; userId: string };

  const [eventRecord, setEventRecord] = useState<EventUserRecords | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [identity, setIdentity] = useState<String>("");

  const retrieveIdentity = async () => {
    try {
      const value = await AsyncStorage.getItem("identity");
      console.log("Identity:", identity)
      if (value !== null) {
        setIdentity(value);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    retrieveIdentity();
  });


  useEffect(() => {
    fetchEvent();
  }, []);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const record = await fetchEventRecord(eventId, userId);
      setEventRecord(record);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Jonathan</Text>
      </View>
      <ScrollView contentContainerStyle={styles.details}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : eventRecord ? (
          <>
            <Text style={styles.detailText}>Achievements: {eventRecord.achievements.join(', ')}</Text>
            <Text style={styles.detailText}>Score: {eventRecord.score}/100</Text>
            <Text style={styles.detailText}>Completion %: {eventRecord.completion}%</Text>
            <Text style={styles.detailText}>Rank: {eventRecord.rank}</Text>
            {identity=="Staff" ? (<><Text style={styles.detailText}>Reviews:</Text><TextInput style={styles.input} placeholder="Leave Remarks" defaultValue={eventRecord.remarks} /></>) : (
              <Text style={styles.detailText}>Reviews: {eventRecord.remarks}</Text>
            )}
            <Button
              variant="outline"
              style={styles.input}
              className="shadow shadow-foreground/5"
            >
              <Text>Save</Text>
            </Button>
          </>
        ) : (
          <Text style={styles.noRecordText}>No Record Found</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

interface Styles {
  container: ViewStyle;
  header: ViewStyle;
  headerText: TextStyle;
  slide: ViewStyle;
  image: ImageStyle;
  title: TextStyle;
  details: ViewStyle;
  detailText: TextStyle;
  input: TextStyle;
  noRecordText: TextStyle;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    width: '100%',
    padding: 20,
    backgroundColor: '#f0f0f0', // Adjust the header background color as needed
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333', // Adjust for better visibility
  },
  details: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  detailText: {
    fontSize: 16,
    color: '#666', // Softer text color
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  noRecordText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
});
