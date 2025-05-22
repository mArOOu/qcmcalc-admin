import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

const getAllExamIDs = async () => {
  const snapshot = await getDocs(collection(db, "exams"));
  return snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() }));
};
