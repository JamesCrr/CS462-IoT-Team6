import { collection, doc, addDoc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../config/firebaseConfig";

export async function fetchEvent(eventId = "") {
  try {
    const docRef = doc(db, "events", eventId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log(docSnap.data());
      return docSnap.data();
    }
    // docSnap.data() will be undefined in this case
  } catch (e) {
    console.error("Error fetching documents: ", e.message);
    throw new Error("Failed to fetch event records");
  }
  return null;
}

// export async function updateEventRecord(docId, updatedPerformance, remarks) {
//   try {
//     const recordRef = doc(db, 'eventRecords', docId);
//     await updateDoc(recordRef, {
//       performance: updatedPerformance,
//       remarks: remarks
//     });
//     console.log("Document successfully updated!");
//   } catch (e) {
//     console.error("Error updating document: ", e);
//   }
// }

// export async function deleteEventRecord(docId) {
//   try {
//     await deleteDoc(doc(db, 'eventRecords', docId));
//     console.log("Document successfully deleted!");
//   } catch (e) {
//     console.error("Error deleting document: ", e);
//   }
// }
