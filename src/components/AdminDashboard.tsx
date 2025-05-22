"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { setDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase"; // Adjust path if needed
import Calculator from "./Calculator";

const handleAddExam = async (exam: any) => {
  try {
    const examRef = doc(db, "exams", exam.id);
    await setDoc(examRef, exam);
    alert("✅ Exam added!");
  } catch (error) {
    console.error("❌ Error adding exam:", error);
  }
};

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [exam, setExam] = useState({
    id: "",
    name: "",
    description: "",
    speciality: "",
    grade: "",
    year: "",
    subject: "",
    numQuestions: "",
    testType: "",
  });
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/login");
      else setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e: any) => {
    setExam({ ...exam, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    handleAddExam(exam);
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <form onSubmit={handleSubmit}>
        <input
          name="id"
          value={exam.id}
          onChange={handleChange}
          placeholder="Exam ID"
          required
        />
        <input
          name="name"
          value={exam.name}
          onChange={handleChange}
          placeholder="Exam Name"
          required
        />
        <input
          name="description"
          value={exam.description}
          onChange={handleChange}
          placeholder="Description"
          required
        />
        <input
          name="speciality"
          value={exam.speciality}
          onChange={handleChange}
          placeholder="Speciality"
          required
        />
        <input
          name="grade"
          value={exam.grade}
          onChange={handleChange}
          placeholder="Grade"
          required
        />
        <input
          name="year"
          value={exam.year}
          onChange={handleChange}
          placeholder="Year"
          required
        />
        <input
          name="subject"
          value={exam.subject}
          onChange={handleChange}
          placeholder="Subject"
          required
        />
        <input
          type="number"
          name="numQuestions"
          value={exam.numQuestions}
          onChange={handleChange}
          placeholder="Number of Questions"
          min="1"
          required
        />
        <input
          name="testType"
          value={exam.testType}
          onChange={handleChange}
          placeholder="Test Type"
          required
        />
        <Calculator
          numQuestions={Number(exam.numQuestions)}
          testType={exam.testType}
        />
        <button type="submit">Add Exam</button>
      </form>
    </div>
  );
}
