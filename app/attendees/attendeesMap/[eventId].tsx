import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  FlatList,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import Geocoder from "react-native-geocoding";
import { useLocalSearchParams } from "expo-router";
import { DocumentData } from "firebase/firestore";
import { fetchEvent } from "~/api/events";

// Initialize the geocoder with your Google Maps API key
Geocoder.init("AIzaSyBuTcv191asWrM2tL5X4VL5pPh-ApCRPQY");

interface Styles {
  container: ViewStyle;
  title: TextStyle;
  mapContainer: ViewStyle;
  map: ViewStyle;
  infoContainer: ViewStyle;
  infoTitle: TextStyle;
  infoItem: TextStyle;
  listContainer: ViewStyle;
  listTitle: TextStyle;
  listItem: ViewStyle;
  listItemText: TextStyle;
  emptyListText: TextStyle;
}

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

const AttendeesMap = () => {
  const [event, setEvent] = useState<Event>();
  const [address, setAddress] = useState("Boon keng MRT");
  const [region, setRegion] = useState<Region | null>(null);

  const { eventId } = useLocalSearchParams<{
    eventId: string;
  }>();

  const mapFirestoreToEvent = (eventDoc: DocumentData): Event => {
    return {
      name: eventDoc.name,
      location: eventDoc.location,
      information: eventDoc.information,
      datetime: eventDoc.datetime.toDate(),
      meetUpLocations: eventDoc.meetUpLocations || [],
      itemsToBring: eventDoc.itemsToBring || [],
      participants: eventDoc.participants || [],
      volunteers: eventDoc.volunteers || [],
    };
  };

  const fetchEventInfoFromDB = async () => {
    try {
      const eventdata = await fetchEvent(eventId);
      if (eventdata == null) {
        throw new Error("Event not found");
      }
      setEvent(mapFirestoreToEvent(eventdata));
      setAddress(eventdata.location);
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
    }
  };

  useEffect(() => {
    fetchEventInfoFromDB();

    Geocoder.from(address)
      .then((json) => {
        const location = json.results[0].geometry.location;
        setRegion({
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
      })
      .catch((error) => console.warn("Geocoding error:", error));
  }, [address]);

  const renderListItem = ({ item }: { item: string }) => (
    <View style={styles.listItem}>
      <Text style={styles.listItemText}>{item}</Text>
    </View>
  );

  const renderList = (title: string, data: string[] | undefined) => (
    <View style={styles.listContainer}>
      <Text style={styles.listTitle}>{title}</Text>
      {data && data.length > 0 ? (
        <FlatList
          data={data}
          renderItem={renderListItem}
          keyExtractor={(item, index) => `${title}-${index}`}
        />
      ) : (
        <Text style={styles.emptyListText}>No items to display</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{event?.name || "Event"}</Text>
      <View style={styles.mapContainer}>
        {region && (
          <MapView style={styles.map} region={region}>
            <Marker coordinate={region} />
          </MapView>
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Event Info:</Text>
        <Text style={styles.infoItem}>Location: {event?.location}</Text>
        <Text style={styles.infoItem}>
          Date: {event?.datetime.toLocaleString()}
        </Text>
      </View>
      {renderList("Items to Bring", event?.itemsToBring)}
      {renderList("Participants", event?.participants)}
      {renderList("Volunteers", event?.volunteers)}
    </View>
  );
};

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "white",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  mapContainer: {
    height: 300,
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  infoContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  infoItem: {
    fontSize: 16,
    marginBottom: 4,
  },
  listContainer: {
    marginTop: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  listItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  listItemText: {
    fontSize: 16,
  },
  emptyListText: {
    fontStyle: "italic",
    color: "#888",
  },
});

export default AttendeesMap;
