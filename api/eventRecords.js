import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc, query, where} from "firebase/firestore"; 
import { db } from "../config/firebaseConfig";

// Function to add a new event record
export async function addEventRecord(userId, eventId, performance, remarks) {
  try {
    const docRef = await addDoc(collection(db, 'eventRecords'), {
      userId: userId,
      eventId: eventId,
      performance: performance,
      remarks: remarks
    });
    console.log("Document successfully written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

// export async function fetchEventRecords() {
//   try {
//     const querySnapshot = await getDocs(collection(db, "eventRecords"));
//     querySnapshot.forEach((doc) => {
//       console.log(`${doc.id} =>`, doc.data());
//     });
//   } catch (e) {
//     console.error("Error fetching documents: ", e);
//   }
// }

export async function fetchEventRecords(userId = "", eventId = "") {
  try {
    let q = collection(db, "eventRecords");

    if (userId) {
      q = query(q, where("userId", "==", userId));
    }

    if (eventId) {
      q = query(q, where("eventId", "==", eventId));
    }

    const querySnapshot = await getDocs(q);
    const records = [];
    querySnapshot.forEach((doc) => {
      console.log("Document data:", doc.data());
      records.push({ id: doc.id, ...doc.data() });
    });
    console.log("Fetched event records:", records);
    return records; // Return the fetched records
  } catch (e) {
    console.error("Error fetching documents: ", e.message);
    throw new Error("Failed to fetch event records");
  }
}

export async function updateEventRecord(docId, updatedPerformance, remarks) {
  try {
    const recordRef = doc(db, 'eventRecords', docId);
    await updateDoc(recordRef, {
      performance: updatedPerformance,
      remarks: remarks
    });
    console.log("Document successfully updated!");
  } catch (e) {
    console.error("Error updating document: ", e);
  }
}

export async function deleteEventRecord(docId) {
  try {
    await deleteDoc(doc(db, 'eventRecords', docId));
    console.log("Document successfully deleted!");
  } catch (e) {
    console.error("Error deleting document: ", e);
  }
}


