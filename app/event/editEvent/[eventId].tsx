import { router, useLocalSearchParams } from "expo-router";
import { doc, DocumentData, setDoc } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { fetchEvent, updateEvent } from "~/api/events";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { format } from "date-fns";

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
  const [newItem, setNewItem] = useState<string>();
  const [newLocation, setNewLocation] = useState<string>();
  const [newParticipant, setNewParticipant] = useState<string>();
  const [newVolunteer, setNewVolunteer] = useState<string>();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  //for popover
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };
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
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = async () => {
    // Add a new document in collection "cities"
    try {
      const res = await updateEvent(eventId, event);
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  const editEventName = (text: string) => {
    setEvent((event) => {
      if (!event) return event; // Handle undefined case

      return {
        ...event, // Spread the current event properties
        name: text, // Update the 'information' property
      };
    });
  };
  const editEventInfo = (text: string) => {
    setEvent((event) => {
      if (!event) return event; // Handle undefined case

      return {
        ...event, // Spread the current event properties
        information: text, // Update the 'information' property
      };
    });
  };

  const deleteItem = (deleteItem: string) => {
    setEvent((event) => {
      if (!event) return event; // Handle undefined case
      const filtered = event.itemsToBring?.filter((item) => item != deleteItem);

      return {
        ...event, // Spread the current event properties
        itemsToBring: filtered, // Update the 'information' property
      };
    });
  };

  const onChangeTextAddItem = (text: string) => {
    setNewItem(text);
  };
  const addItem = () => {
    setEvent((event) => {
      if (!event) return event; // Handle undefined case
      if (!newItem) return event;
      const newItems = [...(event.itemsToBring ?? []), newItem];

      return {
        ...event, // Spread the current event properties
        itemsToBring: newItems, // Update the 'information' property
      };
    });
    setNewItem("");
  };

  const onChangeTextAddLocation = (text: string) => {
    setNewLocation(text);
  };

  const addLocation = () => {
    setEvent((event) => {
      if (!event) return event; // Handle undefined case
      if (!newLocation) return event;
      const newLocations = [...(event.meetUpLocations ?? []), newLocation];

      return {
        ...event, // Spread the current event properties
        meetUpLocations: newLocations, // Update the 'information' property
      };
    });
    setNewItem("");
  };

  const deleteLocation = (deleteLocation: string) => {
    setEvent((event) => {
      if (!event) return event; // Handle undefined case
      const filtered = event.meetUpLocations?.filter(
        (item) => item != deleteLocation
      );

      return {
        ...event, // Spread the current event properties
        meetUpLocations: filtered, // Update the 'information' property
      };
    });
  };

  const onChangeTextAddParticipant = (text: string) => {
    setNewParticipant(text);
  };

  const addParticipant = () => {
    setEvent((event) => {
      if (!event) return event; // Handle undefined case
      if (!newParticipant) return event;
      const newParticipants = [...(event.participants ?? []), newParticipant];

      return {
        ...event, // Spread the current event properties
        participants: newParticipants, // Update the 'information' property
      };
    });
    setNewItem("");
  };

  const deleteParticipant = (deleteParticipant: string) => {
    setEvent((event) => {
      if (!event) return event; // Handle undefined case
      const filtered = event.participants?.filter(
        (item) => item != deleteParticipant
      );

      return {
        ...event, // Spread the current event properties
        participants: filtered, // Update the 'information' property
      };
    });
  };

  const onChangeTextAddVolunteer = (text: string) => {
    setNewVolunteer(text);
  };

  const addVolunteer = () => {
    setEvent((event) => {
      if (!event) return event; // Handle undefined case
      if (!newVolunteer) return event;
      const newVolunteers = [...(event.volunteers ?? []), newVolunteer];

      return {
        ...event, // Spread the current event properties
        volunteers: newVolunteers, // Update the 'information' property
      };
    });
    setNewItem("");
  };

  const deleteVolunteer = (deleteVolunteer: string) => {
    setEvent((event) => {
      if (!event) return event; // Handle undefined case
      const filtered = event.volunteers?.filter(
        (item) => item != deleteVolunteer
      );

      return {
        ...event, // Spread the current event properties
        volunteers: filtered, // Update the 'information' property
      };
    });
  };
  const changeTime = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowTimePicker(false);
    console.log(selectedTime?.toLocaleDateString());
    console.log(selectedTime?.toLocaleTimeString());
    if (selectedTime) {
      setEvent((event) => {
        if (!event) return event; // Handle undefined case

        return {
          ...event, // Spread the current event properties
          datetime: selectedTime, // Update the 'information' property
        };
      });
    }
  };

  const changeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    console.log(selectedDate?.toLocaleDateString());
    console.log(selectedDate?.toLocaleTimeString());

    setShowDatePicker(false);
    if (selectedDate) {
      setEvent((event) => {
        if (!event) return event; // Handle undefined case

        return {
          ...event, // Spread the current event properties
          datetime: selectedDate, // Update the 'information' property
        };
      });
    }
  };

  return (
    <SafeAreaView>
      <View className="p-6 min-h-full bg-secondary/30">
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <View>
            {event == null ? (
              <View className="flex-1 justify-center items-center">
                <Text className="text-foreground">An error occurred</Text>
                <Text className="text-foreground">Please try again</Text>
              </View>
            ) : (
              <View>
                <ScrollView>
                  {/* <Text className="text-3xl font-bold">{event.name}</Text> */}
                  <View className="">
                    <Text className="text-2xl font-bold">Edit Event Name</Text>
                    <Input
                      placeholder="Edit Event Name"
                      value={event.name}
                      onChangeText={editEventName}
                      aria-labelledby="inputLabel"
                      aria-errormessage="inputError"
                    />
                    <Text>{event.name}</Text>
                    <Text className="text-2xl font-bold">Edit Event Info</Text>
                    <Input
                      placeholder="Edit Event Info"
                      value={event.information}
                      onChangeText={editEventInfo}
                      aria-labelledby="inputLabel"
                      aria-errormessage="inputError"
                    />
                    <Text>{event.information}</Text>
                  </View>
                  <View className="mt-7">
                    <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                      <Text>{`${event.datetime.getFullYear()}-${String(
                        event.datetime.getMonth() + 1
                      ).padStart(2, "0")}-${String(
                        event.datetime.getDate()
                      ).padStart(2, "0")}`}</Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                      <DateTimePicker
                        value={event.datetime}
                        mode="date"
                        display="default"
                        onChange={changeDate}
                      />
                    )}
                    <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                      <Text>Time:{event.datetime.getTime()}</Text>
                    </TouchableOpacity>
                    {showTimePicker && (
                      <DateTimePicker
                        value={event.datetime}
                        mode="time"
                        display="default"
                        onChange={changeTime}
                      />
                    )}
                  </View>

                  <View className="mt-7">
                    <Text className="text-2xl font-bold">Things to bring</Text>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline">
                          <Text>Add Item</Text>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        side={Platform.OS === "web" ? "bottom" : "top"}
                        insets={contentInsets}
                        className="w-80"
                      >
                        <Text className="font-medium leading-none native:text-xl">
                          Add item
                        </Text>
                        <Input
                          placeholder="New Item"
                          value={newItem}
                          onChangeText={onChangeTextAddItem}
                          aria-labelledby="inputLabel"
                          aria-errormessage="inputError"
                        />
                        <Button variant="outline" onPress={addItem}>
                          <Text>Add</Text>
                        </Button>
                      </PopoverContent>
                    </Popover>

                    {event.itemsToBring?.map((item) => (
                      <View className="mb-7">
                        <Text className="my-2" key={item}>
                          {item}
                        </Text>
                        <Button
                          variant="outline"
                          className="shadow shadow-foreground/5"
                          onPress={() => {
                            deleteItem(item);
                          }}
                        >
                          <Text>Delete item</Text>
                        </Button>
                      </View>
                    ))}
                  </View>

                  <View className="mt-7">
                    <Text className="text-2xl font-bold">Where to meet</Text>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline">
                          <Text>Add Location</Text>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        side={Platform.OS === "web" ? "bottom" : "top"}
                        insets={contentInsets}
                        className="w-80"
                      >
                        <Text className="font-medium leading-none native:text-xl">
                          Add New Location
                        </Text>
                        <Input
                          placeholder="New Item"
                          value={newLocation}
                          onChangeText={onChangeTextAddLocation}
                          aria-labelledby="inputLabel"
                          aria-errormessage="inputError"
                        />
                        <Button variant="outline" onPress={addLocation}>
                          <Text>Add</Text>
                        </Button>
                      </PopoverContent>
                    </Popover>
                    {event.meetUpLocations?.map((location) => (
                      <View className="mb-7">
                        <Text key={location}>{location}</Text>

                        <Button
                          variant="outline"
                          className="shadow shadow-foreground/5"
                          onPress={() => {
                            deleteLocation(location);
                          }}
                        >
                          <Text>Delete Location</Text>
                        </Button>
                      </View>
                    ))}
                  </View>

                  <View className="mt-7">
                    <Text className="text-2xl font-bold">Participants</Text>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline">
                          <Text>Add Particpant</Text>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        side={Platform.OS === "web" ? "bottom" : "top"}
                        insets={contentInsets}
                        className="w-80"
                      >
                        <Text className="font-medium leading-none native:text-xl">
                          Add New Participant
                        </Text>
                        <Input
                          placeholder="New Item"
                          value={newParticipant}
                          onChangeText={onChangeTextAddParticipant}
                          aria-labelledby="inputLabel"
                          aria-errormessage="inputError"
                        />
                        <Button variant="outline" onPress={addParticipant}>
                          <Text>Add</Text>
                        </Button>
                      </PopoverContent>
                    </Popover>
                    {event.participants?.map((participant) => (
                      <View className="mb-7">
                        <Text key={participant}>{participant}</Text>

                        <Button
                          variant="outline"
                          className="shadow shadow-foreground/5"
                          onPress={() => {
                            deleteParticipant(participant);
                          }}
                        >
                          <Text>Delete Participant</Text>
                        </Button>
                      </View>
                    ))}
                  </View>

                  <View className="mt-7">
                    <Text className="text-2xl font-bold">Volunteers</Text>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline">
                          <Text>Add Volunteer</Text>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        side={Platform.OS === "web" ? "bottom" : "top"}
                        insets={contentInsets}
                        className="w-80"
                      >
                        <Text className="font-medium leading-none native:text-xl">
                          Add New Volunteer
                        </Text>
                        <Input
                          placeholder="New Item"
                          value={newVolunteer}
                          onChangeText={onChangeTextAddVolunteer}
                          aria-labelledby="inputLabel"
                          aria-errormessage="inputError"
                        />
                        <Button variant="outline" onPress={addVolunteer}>
                          <Text>Add</Text>
                        </Button>
                      </PopoverContent>
                    </Popover>
                    {event.volunteers?.map((volunteer) => (
                      <View className="mb-7">
                        <Text key={volunteer}>{volunteer}</Text>

                        <Button
                          variant="outline"
                          className="shadow shadow-foreground/5"
                          onPress={() => {
                            deleteVolunteer(volunteer);
                          }}
                        >
                          <Text>Delete Volunteer</Text>
                        </Button>
                      </View>
                    ))}
                  </View>

                  {/* Need to change depending on Staff / Caregiver */}
                  <Button
                    variant="outline"
                    className="mt-7 shadow shadow-foreground/5"
                    onPress={() => {}}
                  >
                    <Text>Default</Text>
                  </Button>
                  <Button variant="outline" onPress={saveChanges}>
                    <Text>Save</Text>
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
    color: "white",
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
