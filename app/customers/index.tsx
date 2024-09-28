import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { fetchEventRecords } from "../../api/eventRecords"; // Adjust the import path as needed

interface Performance {
  achievements: string[];
  completionPercentage: number;
  rank: number;
  score: number;
}

interface Remarks {
  caregiver: string;
  communityWorker: string;
}

interface EventRecord {
  id: string;
  userId: string;
  eventId: string;
  performance?: Performance;
  remarks?: Remarks;
}

export default function EventRecords() {
  const navigation = useNavigation();
  const [eventRecords, setEventRecords] = useState<EventRecord[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [eventId, setEventId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const normalizeKeys = (records: any[]) => {
    return records.map(record => ({
      ...record,
      performance: record.Performance,
      remarks: record.Remarks,
    }));
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const records = await fetchEventRecords(userId, eventId);
      console.log("Recordssss:", records);
      const normalizedRecords = normalizeKeys(records);
      setEventRecords(normalizedRecords);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Failed to fetch event records:", error.message);
      } else {
        console.error("Failed to fetch event records:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchRecords();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Event Records</Text>
      <TextInput
        style={styles.input}
        placeholder="Search by User ID"
        value={userId}
        onChangeText={setUserId}
      />
      <TextInput
        style={styles.input}
        placeholder="Search by Event ID"
        value={eventId}
        onChangeText={setEventId}
      />
      <Button title="Search" onPress={handleSearch} />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <ScrollView style={styles.recordsContainer}>
          {eventRecords.map((record) => (
            <View key={record.id} style={styles.record}>
              <Text>User ID: {record.userId}</Text>
              <Text>Event ID: {record.eventId}</Text>
              <Text>Performance:</Text>
              <Text>  Achievements: {record.performance?.achievements?.length ? record.performance.achievements.join(", ") : "N/A"}</Text>
              <Text>  Completion Percentage: {record.performance?.completionPercentage !== undefined ? record.performance.completionPercentage * 100 : "N/A"}%</Text>
              <Text>  Rank: {record.performance?.rank !== undefined ? record.performance.rank : "N/A"}</Text>
              <Text>  Score: {record.performance?.score !== undefined ? record.performance.score : "N/A"}</Text>
              <Text>Remarks:</Text>
              <Text>  Caregiver: {record.remarks?.caregiver || "N/A"}</Text>
              <Text>  Community Worker: {record.remarks?.communityWorker || "N/A"}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
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