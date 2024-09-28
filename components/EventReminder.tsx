import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import * as Notifications from 'expo-notifications';

// Configure notification settings
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const EventReminder = () => {
  const hardcodedEvent = {
    title: "MINDS activity",
    date: new Date().setHours(12, 12, 0, 0) // Today at 12 PM
  };

  useEffect(() => {
    requestPermissions();
    scheduleNotification();
  }, []);

  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Notification permissions are required to set reminders!');
    }
  };

  const scheduleNotification = async () => {
    const now = new Date();
    let notificationTime = new Date(hardcodedEvent.date);

    // If it's already past 12 PM today, schedule for tomorrow
    if (now > notificationTime) {
      notificationTime.setDate(notificationTime.getDate() + 1);
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Event Reminder',
        body: `Reminder for your event "${hardcodedEvent.title}"`,
      },
      trigger: {
        date: notificationTime,
      },
    });

    console.log(`Notification scheduled for ${notificationTime.toLocaleString()} for event "${hardcodedEvent.title}"`);
  };

  return (
    <View>
      <Text>Event: {hardcodedEvent.title}</Text>
      <Text>Date: {new Date(hardcodedEvent.date).toLocaleString()}</Text>
      <Button 
        title="Reschedule Reminder" 
        onPress={scheduleNotification} 
      />
    </View>
  );
};

export default EventReminder;