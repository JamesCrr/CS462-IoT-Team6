import { router, useLocalSearchParams } from "expo-router";
import { DocumentData } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { InsertEvent, updateEvent } from "~/api/events";

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Input } from "~/components/ui/input";
import DateTimePicker from "@react-native-community/datetimepicker";

import { fetchEvent } from "~/api/events";
import { Button } from "~/components/ui/button";
import ItemList from "~/components/itemList";

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
interface Item {
  id: string;
  text: string;
}

export default function EventRecords() {
  const [newEvent, setNewEvent] = useState<Event>({
    name: "",
    location: "",
    information: "",
    datetime: new Date(), // Initialize with current date
    meetUpLocations: [],
    itemsToBring: [],
    participants: [],
    volunteers: [],
  });
  const [isModalVisible, setModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [meetUpLocations, setMeetUpLocations] = useState<Item[]>([]);
  const [newMeetUpLocation, setNewMeetUpLocation] = useState("");
  const [itemsToBring, setItemsToBring] = useState<Item[]>([]);
  const [newItemsToBring, setNewItemsToBring] = useState("");
  const navigation = useNavigation();

  const addMeetupLocation = () => {
    if (newMeetUpLocation) {
      setMeetUpLocations([
        ...meetUpLocations,
        { id: Date.now().toString(), text: newMeetUpLocation },
      ]);
      setNewMeetUpLocation("");
    }
  };

  const removeMeetUpLocation = (id: string) => {
    setMeetUpLocations(meetUpLocations.filter((item) => item.id !== id));
  };

  const addItemToBring = () => {
    if (newItemsToBring) {
      setItemsToBring([
        ...itemsToBring,
        { id: Date.now().toString(), text: newItemsToBring },
      ]);
      setNewItemsToBring("");
    }
  };

  const removeItemToBring = (id: string) => {
    setItemsToBring(itemsToBring.filter((item) => item.id !== id));
  };
  const addEvent = async () => {
    const filteredMeetUp = meetUpLocations.reduce((acc: string[], current) => {
      acc.push(current.text);
      return acc;
    }, []);
    const filteredItemstoBring = itemsToBring.reduce(
      (acc: string[], current) => {
        acc.push(current.text);
        return acc;
      },
      []
    );
    const eventPayload = {
      ...newEvent,
      meetUpLocations: filteredMeetUp,
      itemsToBring: filteredItemstoBring,
    };
    try {
      const res = await InsertEvent(eventPayload);
      console.log("Event added successfully:", res);
      setNewEvent({
        name: "",
        location: "",
        information: "",
        datetime: new Date(), // Initialize with current date
        meetUpLocations: [],
        itemsToBring: [],
        participants: [],
        volunteers: [],
      });
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  return (
    <SafeAreaView>
      <View>
        <Text>Add New Event</Text>
        <Input
          placeholder="Add New Event"
          value={newEvent.name}
          onChangeText={(text: string) =>
            setNewEvent({ ...newEvent, name: text })
          }
          aria-labelledby="inputLabel"
          aria-errormessage="inputError"
        />
        <Text>Add New Location</Text>
        <Input
          placeholder="Location"
          value={newEvent.location}
          onChangeText={(text: string) =>
            setNewEvent({ ...newEvent, location: text })
          }
          aria-labelledby="inputLabel"
          aria-errormessage="inputError"
        />
        <Text>Add information about event</Text>
        <Input
          placeholder="Information"
          value={newEvent.information}
          onChangeText={(text: string) =>
            setNewEvent({ ...newEvent, information: text })
          }
          aria-labelledby="inputLabel"
          aria-errormessage="inputError"
        />
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <Text style={styles.text}>
            Date: {newEvent.datetime.toLocaleDateString() || "Select Date"}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={newEvent.datetime}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setNewEvent({
                  ...newEvent,
                  datetime: selectedDate,
                });
              }
            }}
          />
        )}
        <TouchableOpacity onPress={() => setShowTimePicker(true)}>
          <Text style={styles.text}>
            Time: {newEvent.datetime.toLocaleTimeString() || "Select Time"}
          </Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={newEvent.datetime}
            mode="time"
            display="default"
            onChange={(event, selectedTime) => {
              setShowTimePicker(false);
              if (selectedTime) {
                setNewEvent({
                  ...newEvent,
                  datetime: selectedTime,
                });
              }
            }}
          />
        )}
        <ItemList
          items={meetUpLocations}
          addItem={addMeetupLocation}
          removeItem={removeMeetUpLocation}
          newItem={newMeetUpLocation}
          setNewItem={setNewMeetUpLocation}
          itemType="meet up location"
        />
        <ItemList
          items={itemsToBring}
          addItem={addItemToBring}
          removeItem={removeItemToBring}
          newItem={newItemsToBring}
          setNewItem={setNewItemsToBring}
          itemType="Items to bring"
        />

        <Button style={styles.buttons} onPress={addEvent}>
          <Text>Add Event</Text>
        </Button>
        <Button style={styles.buttons} onPress={() => setModalVisible(false)}>
          <Text>Cancel</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  buttons: {
    margin: 5,
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
  text: {
    color: "white",
  },
  record: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});
