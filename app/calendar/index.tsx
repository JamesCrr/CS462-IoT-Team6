import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";

import { Input } from "~/components/ui/input";
import DateTimePicker from "@react-native-community/datetimepicker";
import Modal from "react-native-modal";
import ItemList from "~/components/itemList";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addDays,
} from "date-fns";

import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  DocumentData,
  Timestamp,
} from "firebase/firestore";
import { db } from "config/firebaseConfig.js";
import { router } from "expo-router";

interface Event {
  name: string;
  location: string;
  information: string;
  datetime: Date;
  id?: string;
  meetUpLocations?: string[];
  itemsToBring?: string[];
  participants?: string[];
  volunteers?: string[];
}

export default function ThirtyDayCalendar() {
  const [events, setEvents] = useState<Event[]>([]);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [todayDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");

  const retrieveAllEvents = async () => {
    var events: Event[] = [];
    const querySnapshot = await getDocs(collection(db, "events"));
    querySnapshot.forEach((doc) => {
      const date = new Date(
        doc.data().datetime.seconds * 1000 +
          doc.data().datetime.nanoseconds / 1000000
      );
      var event: Event = {
        id: doc.id,
        name: doc.data().name,
        location: doc.data().location,
        information: doc.data().information,
        datetime: doc.data().datetime.toDate(), // Convert Firestore Timestamp to JavaScript Date
        meetUpLocations: doc.data().meetUpLocations || [],
        itemsToBring: doc.data().itemsToBring || [],
        participants: doc.data().participants || [],
        volunteers: doc.data().volunteers || [],
      };

      events.push(event);
    });
    console.log(events, "ALL EVENTS");
    setEvents(events);
  };

  useEffect(() => {
    const retrieveData = async () => {
      const res = await retrieveAllEvents();
    };
    retrieveData();
    setCurrentDate(new Date());
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "yyyy-MM-dd");
  };

  const renderMonthView = () => {
    const getDaysInMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getMonthDays = () => {
      const days: (Date | null)[] = [];
      const daysInMonth = getDaysInMonth(currentDate);
      const firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      ).getDay();

      for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
      }

      for (let i = 1; i <= daysInMonth; i++) {
        days.push(
          new Date(currentDate.getFullYear(), currentDate.getMonth(), i)
        );
      }

      return days;
    };

    const monthDays = getMonthDays();

    return (
      <View style={styles.monthGrid}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <View key={day} style={styles.dayHeader}>
            <Text style={styles.dayHeaderText}>{day}</Text>
          </View>
        ))}
        {monthDays.map((day, index) => (
          <View key={index} style={styles.dayCell}>
            {day && (
              <>
                <Text style={styles.dayNumber}>{day.getDate()}</Text>
                <ScrollView>
                  {events
                    .filter((event) => {
                      return (
                        formatDate(event.datetime.toISOString()) ==
                        formatDate(day.toISOString())
                      );
                    })
                    .map((event) => (
                      <TouchableOpacity
                        key={event.id}
                        onPress={() => router.push(`/event/${event.id}`)}
                      >
                        <View style={styles.event}>
                          <Text style={styles.eventTitle}>{event.name}</Text>
                          <Text style={styles.eventTime}>
                            {String(event.datetime.getHours()).padStart(2, "0")}
                            :
                            {String(event.datetime.getMinutes()).padStart(
                              2,
                              "0"
                            )}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </>
            )}
          </View>
        ))}
      </View>
    );
  };

  // const renderWeekView = () => {
  //   const weekStart = startOfWeek(currentDate);
  //   const weekEnd = endOfWeek(currentDate);
  //   const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  //   return (
  //     <ScrollView horizontal>
  //       <View style={styles.weekGrid}>
  //         {days.map((day) => (
  //           <View key={day.toISOString()} style={styles.weekDay}>
  //             <Text style={styles.weekDayHeader}>{format(day, "EEE dd")}</Text>
  //             <ScrollView>
  //               {events
  //                 .filter(
  //                   (event) => event.date === formatDate(day.toISOString())
  //                 )
  //                 .map((event) => (
  //                   <View key={event.id} style={styles.event}>
  //                     <Text style={styles.eventTitle}>{event.title}</Text>
  //                     <Text style={styles.eventTime}>{event.time}</Text>
  //                   </View>
  //                 ))}
  //             </ScrollView>
  //           </View>
  //         ))}
  //       </View>
  //     </ScrollView>
  //   );
  // };

  // const renderDayView = () => {
  //   const hours = Array.from({ length: 24 }, (_, i) => i);

  //   return (
  //     <ScrollView>
  //       {hours.map((hour) => (
  //         <View key={hour} style={styles.hourRow}>
  //           <Text style={styles.hourText}>
  //             {format(new Date().setHours(hour), "HH:mm")}
  //           </Text>
  //           <View style={styles.hourEvents}>
  //             {events
  //               .filter(
  //                 (event) =>
  //                   event.date === formatDate(currentDate.toISOString()) &&
  //                   parseInt(event.time.split(":")[0]) === hour
  //               )
  //               .map((event) => (
  //                 <View key={event.id} style={styles.event}>
  //                   <Text style={styles.eventTitle}>{event.title}</Text>
  //                   <Text style={styles.eventTime}>{event.time}</Text>
  //                 </View>
  //               ))}
  //           </View>
  //         </View>
  //       ))}
  //     </ScrollView>
  //   );
  // };

  const nextPeriod = () => {
    switch (view) {
      case "month":
        setCurrentDate(
          new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
        );
        break;
      case "week":
        setCurrentDate(addDays(currentDate, 7));
        break;
      case "day":
        setCurrentDate(addDays(currentDate, 1));
        break;
    }
  };

  const prevPeriod = () => {
    switch (view) {
      case "month":
        setCurrentDate(
          new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
        );
        break;
      case "week":
        setCurrentDate(addDays(currentDate, -7));
        break;
      case "day":
        setCurrentDate(addDays(currentDate, -1));
        break;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Calendar</Text>
          {/* <View style={styles.viewButtons}>
            <Button
              style={styles.buttons}
              onPress={() => setView("month")}
              // color={view === "month" ? "primary" : "default"}
            >
              <Text>Month</Text>
            </Button>
            <Button
              style={styles.buttons}
              onPress={() => setView("week")}
              // color={view === "week" ? "primary" : "default"}
            >
              <Text>Week</Text>
            </Button>
            <Button
              style={styles.buttons}
              onPress={() => setView("day")}
              // color={view === "day" ? "primary" : "default"}
            >
              <Text>Day</Text>
            </Button>
          </View> */}
          <View style={styles.navigationButtons}>
            <Button style={styles.buttons} onPress={prevPeriod}>
              <Text>&lt;</Text>
            </Button>
            <Text>{format(currentDate, "MMMM yyyy")}</Text>
            <Button style={styles.buttons} onPress={nextPeriod}>
              <Text>&gt;</Text>
            </Button>
          </View>
        </View>
        {view === "month" && renderMonthView()}
        {/* {view === "week" && renderWeekView()}
        {view === "day" && renderDayView()} */}
        <Button
          style={styles.buttons}
          onPress={() => router.push("/event/addEvent")}
        >
          <Text>Add event</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  viewButtons: {
    flexDirection: "row",
  },
  navigationButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayHeader: {
    width: "14.28%",
    padding: 5,
    alignItems: "center",
  },
  dayHeaderText: {
    fontWeight: "bold",
  },
  dayCell: {
    width: "14.28%",
    height: 100,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 5,
  },
  dayNumber: {
    fontWeight: "bold",
  },
  event: {
    backgroundColor: "green",
    padding: 2,
    marginBottom: 2,
    borderRadius: 3,
  },
  eventTitle: {
    color: "white",
    fontSize: 10,
  },
  eventTime: {
    color: "white",
    fontSize: 8,
  },
  weekGrid: {
    flexDirection: "row",
  },
  weekDay: {
    width: 150,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 5,
  },
  weekDayHeader: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  hourRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    padding: 5,
  },
  hourText: {
    width: 50,
    fontWeight: "bold",
  },
  hourEvents: {
    flex: 1,
  },
  buttons: {
    margin: 5,
  },
  modal: {
    backgroundColor: "black",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
});
