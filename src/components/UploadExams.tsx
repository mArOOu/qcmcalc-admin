"use client";

import { db } from "../lib/firebase";
import { collection, setDoc, doc } from "firebase/firestore";
import exams from "../../public/data/exams.json";

function flattenCorrectAnswers(correctAnswers: any) {
  const flatAnswers: Record<string, any> = {};
  for (const key in correctAnswers) {
    // If it's an array of arrays, flatten the first level
    flatAnswers[key] = correctAnswers[key].flat();
  }
  return flatAnswers;
}

export default function UploadExams() {
  const handleUpload = async () => {
    console.log("Upload started");
    try {
      for (const exam of exams.exams) {
        const fixedExam = {
          ...exam,
          correctAnswers: flattenCorrectAnswers(exam.correctAnswers),
        };

        const examRef = doc(db, "exams", fixedExam.id);
        await setDoc(examRef, fixedExam);
        console.log(`✅ Uploaded: ${fixedExam.name}`);
      }
      alert("All exams uploaded!");
    } catch (error) {
      console.error("❌ Upload error:", error);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={handleUpload}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
        Upload Exams to Firebase
      </button>
    </div>
  );
}
