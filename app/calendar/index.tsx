import React, { useState, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Button } from "~/components/ui/button";
import { Text } from "~/components/ui/text";

import { Input } from "~/components/ui/input";
import DateTimePicker from "@react-native-community/datetimepicker";
import Modal from "react-native-modal";
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
  id: string;
  title: string;
  date: string;
  time: string;
}

export default function ThirtyDayCalendar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [newEvent, setNewEvent] = useState<Event>({
    id: "",
    title: "",
    date: "",
    time: "",
  });

  const [currentDate, setCurrentDate] = useState(new Date());
  const [todayDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [isModalVisible, setModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const retrieveAllEvents = async () => {
    var events: Event[] = [];
    const querySnapshot = await getDocs(collection(db, "events"));
    querySnapshot.forEach((doc) => {
      console.log(doc.data().datetime);
      const date = new Date(
        doc.data().datetime.seconds * 1000 +
          doc.data().datetime.nanoseconds / 1000000
      );
      var event: Event = {
        id: doc.id,
        title: doc.data().name,
        date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(date.getDate()).padStart(2, "0")}`,
        time: `${String(date.getHours()).padStart(2, "0")}:${String(
          date.getMinutes()
        ).padStart(2, "0")}`,
      };
      events.push(event);
    });
    console.log(events);
    setEvents(events);
  };

  useEffect(() => {
    const retrieveData = async () => {
      const res = await retrieveAllEvents();
    };
    retrieveData();
    setCurrentDate(new Date());
  }, []);

  const addEvent = () => {
    if (newEvent.title && newEvent.date && newEvent.time) {
      setEvents([...events, { ...newEvent, id: Date.now().toString() }]);
      setNewEvent({ id: "", title: "", date: "", time: "" });
      setModalVisible(false);
    }
  };

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
                    .filter(
                      (event) => event.date === formatDate(day.toISOString())
                    )
                    .map((event) => (
                      <TouchableOpacity
                        key={event.id}
                        onPress={() => router.push(`/event/${event.id}`)}
                      >
                        <View style={styles.event}>
                          <Text style={styles.eventTitle}>{event.title}</Text>
                          <Text style={styles.eventTime}>{event.time}</Text>
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
            <Text>Week</Text>
          </Button>
        </View> */}
        <View style={styles.navigationButtons}>
          <Button style={styles.buttons} onPress={prevPeriod}>
            <Text>Previous</Text>
          </Button>
          <Text>{format(currentDate, "MMMM yyyy")}</Text>
          <Button style={styles.buttons} onPress={nextPeriod}>
            <Text>Next period</Text>
          </Button>
        </View>
      </View>
      {view === "month" && renderMonthView()}
      {/* {view === "week" && renderWeekView()}
      {view === "day" && renderDayView()} */}
      <Button style={styles.buttons} onPress={() => setModalVisible(true)}>
        <Text>Add event</Text>
      </Button>
      <Modal isVisible={isModalVisible}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Add New Event</Text>
          <Input
            placeholder="Write some stuff..."
            value={newEvent.title}
            onChangeText={(text: string) =>
              setNewEvent({ ...newEvent, title: text })
            }
            aria-labelledby="inputLabel"
            aria-errormessage="inputError"
          />
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <Text>Date: {newEvent.date || "Select Date"}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={new Date(newEvent.date || Date.now())}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setNewEvent({
                    ...newEvent,
                    date: format(selectedDate, "yyyy-MM-dd"),
                  });
                }
              }}
            />
          )}
          <TouchableOpacity onPress={() => setShowTimePicker(true)}>
            <Text>Time: {newEvent.time || "Select Time"}</Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={new Date(`2000-01-01T${newEvent.time || "00:00"}`)}
              mode="time"
              display="default"
              onChange={(event, selectedTime) => {
                setShowTimePicker(false);
                if (selectedTime) {
                  setNewEvent({
                    ...newEvent,
                    time: format(selectedTime, "HH:mm"),
                  });
                }
              }}
            />
          )}
          <Button style={styles.buttons} onPress={addEvent}>
            <Text>Add Event</Text>
          </Button>
          <Button style={styles.buttons} onPress={() => setModalVisible(false)}>
            <Text>Cancel</Text>
          </Button>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
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
    fontSize: 24,
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
