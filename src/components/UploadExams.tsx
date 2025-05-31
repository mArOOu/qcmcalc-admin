"use client";

import { db } from "../lib/firebase";
import { setDoc, doc } from "firebase/firestore";
import exams from "../../public/data/exams.json";

interface ExamAnswer {
  [key: string]: string[] | string[][] | undefined;
}

interface ExamData {
  id: string;
  name: string;
  correctAnswers: ExamAnswer;
  [key: string]: unknown;
}

function flattenCorrectAnswers(correctAnswers: ExamAnswer): ExamAnswer {
  const flatAnswers: ExamAnswer = {};
  for (const key in correctAnswers) {
    const value = correctAnswers[key];
    if (Array.isArray(value)) {
      // Only flatten if value is an array (string[] or string[][])
      flatAnswers[key] = (value as string[][]).flat();
    }
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
