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
import Carousel from 'react-native-snap-carousel';

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
  const [eventRecord, setEventRecord] = useState<EventUserRecords | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const route = useRoute();
  const { eventId, userId } = route.params as { eventId: string; userId: string };

  const [entries, setEntries] = React.useState<CarouselPhotos[]>([
    { title: 'Photo 1', text: 'Description of photo 1' },
    { title: 'Photo 2', text: 'Description of photo 2' },
    { title: 'Photo 3', text: 'Description of photo 3' }
  ]);

  useEffect(() => {
    console.log("UserId:", userId);
    console.log("EventId:", eventId);
    fetchEvent();
  }, []);

  const fetchEvent = async () => {
    setLoading(true);

    try {
      const eventRecord = await fetchEventRecord(eventId, userId);
      console.log("EventRecord:", eventRecord); 
      if (eventRecord == null) {
        throw new Error("Event Records not found");
      } else {
        setEventRecord(eventRecord);
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Jonathan</Text>
      </View>
      {/* <Carousel
        data={entries}
        renderItem={renderItem}
        sliderWidth={Dimensions.get('window').width}
        itemWidth={300}
        loop={true}
      /> */}
      <View style={styles.details}>
        {eventRecord && (
          <>
            <Text style={styles.detailText}>Achievements: {eventRecord.achievements.join(', ')}</Text>
            <Text style={styles.detailText}>Score: {eventRecord.score}/100</Text>
            <Text style={styles.detailText}>Completion %: {eventRecord.completion}%</Text>
            <Text style={styles.detailText}>Rank: {eventRecord.rank}</Text>
            <Text style={styles.detailText}>Remarks: {eventRecord.remarks}</Text>
            <TextInput style={styles.input} placeholder="Leave Remarks" />
          </>
        )}
      </View>
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
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    margin: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  slide: {
    backgroundColor: 'white',
    borderRadius: 8,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 280,
    height: 150,
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
  },
  details: {
    marginTop: 20,
  },
  detailText: {
    fontSize: 18,
    marginVertical: 4,
  },
  input: {
    height: 40,
    width: '100%',
    marginVertical: 10,
    borderWidth: 1,
    padding: 10,
  }
});