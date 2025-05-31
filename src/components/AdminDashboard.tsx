"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { setDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase"; // Adjust path if needed
import Calculator from "./Calculator";
import { v4 as uuidv4 } from "uuid";
import NumberOfQuestions from "./NumberOfQuestions";
import TypeOfCorrection from "./TypeOfCorrection";

interface ExamData {
  id: string;
  name: string;
  description: string;
  speciality: string;
  grade: string;
  year: string;
  subject: string;
  numQuestions: string;
  testType: string;
  correctAnswers: Record<number, string[]>;
  session: "Normal" | "Rattrapage";
  rotation: string;
  type: "Clinique" | "Théorique";
}

const handleAddExam = async (exam: ExamData) => {
  try {
    const examRef = doc(db, "exams", exam.id);
    await setDoc(examRef, exam);
    alert("✅ Controle Ajouté");
  } catch (error) {
    console.error("❌ Erreur", error);
  }
};

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [exam, setExam] = useState({
    id: uuidv4(),
    name: "",
    description: "",
    speciality: "",
    grade: "",
    year: "2025",
    subject: "",
    numQuestions: "",
    testType: "QCSs",
    correctAnswers: {} as Record<number, string[]>,
    session: "Normal" as "Normal" | "Rattrapage",
    rotation: "",
    type: "Théorique" as "Clinique" | "Théorique",
  });
  const router = useRouter();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/login");
      else setUser(user);
    });

    return () => unsubscribe();
  }, [router]);
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setExam({ ...exam, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Validate that we have answers for all questions
    const numQuestions = Number(exam.numQuestions);
    const hasAllAnswers = Array.from(
      { length: numQuestions },
      (_, i) => i + 1
    ).every((qNum) => exam.correctAnswers[qNum]?.length > 0);

    if (!hasAllAnswers) {
      alert("Please provide answers for all questions");
      return;
    }

    handleAddExam({
      ...exam,
      id: exam.id || uuidv4(),
    });
  };

  const handleNumQuestionsChange = (value: number) => {
    setExam((prev) => ({ ...prev, numQuestions: value.toString() }));
  };

  const handleTestTypeChange = (value: string) => {
    setExam((prev) => ({ ...prev, testType: value }));
  };

  const handleAnswersChange = (answers: Record<number, string[]>) => {
    setExam((prev) => ({
      ...prev,
      correctAnswers: answers,
    }));
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-primary">
        Admin Dashboard
      </h1>
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        {/* Basic Information Section */}
        <div className="bg-card p-6 rounded-lg shadow-lg space-y-4">
          <h2 className="text-xl font-semibold mb-4">
            Informations du Controle
          </h2>

          <div className="space-y-4">
            <input
              name="name"
              value={exam.name}
              onChange={handleChange}
              placeholder="Nom du Controle"
              className="w-full p-3 rounded-md border border-border bg-background text-foreground"
              required
            />
            <textarea
              name="description"
              value={exam.description}
              onChange={handleChange}
              placeholder="Description"
              className="w-full p-3 rounded-md border border-border bg-background text-foreground min-h-[100px]"
              required
            />
            <input
              name="subject"
              value={exam.subject}
              onChange={handleChange}
              placeholder="Module"
              className="w-full p-3 rounded-md border border-border bg-background text-foreground"
              required
            />
            <select
              name="speciality"
              value={exam.speciality}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-border bg-background text-foreground"
              required>
              <option value="Médecine">Médecine</option>
              <option value="Pharmacie">Pharmacie</option>
              <option value="Chirurgie Dentaire">Chirurgie Dentaire</option>
            </select>
            <select
              name="grade"
              value={exam.grade}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-border bg-background text-foreground"
              required>
              <option value="1ère année">1ère Année</option>
              <option value="2ème année">2ème Année</option>
              <option value="3ème année">3ème Année</option>
              <option value="4ème année">4ème Année</option>
              <option value="5ème année">5ème Année</option>
              <option value="6ème année">6ème Année</option>
            </select>{" "}
            <select
              name="year"
              value={exam.year}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-border bg-background text-foreground"
              required>
              <option value="2025">2025</option>
            </select>
            <select
              name="session"
              value={exam.session}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-border bg-background text-foreground"
              required>
              <option value="Normal">Session Normale</option>
              <option value="Rattrapage">Session de Rattrapage</option>
            </select>
            <input
              name="rotation"
              value={exam.rotation}
              onChange={handleChange}
              placeholder="Rotation"
              className="w-full p-3 rounded-md border border-border bg-background text-foreground"
              required
            />
            <select
              name="type"
              value={exam.type}
              onChange={handleChange}
              className="w-full p-3 rounded-md border border-border bg-background text-foreground"
              required>
              <option value="Théorique">Théorique</option>
              <option value="Clinique">Clinique</option>
            </select>
            <NumberOfQuestions onChange={handleNumQuestionsChange} />
            <TypeOfCorrection onChange={handleTestTypeChange} />
          </div>
        </div>

        {/* Answer Input Section */}
        <div className="bg-card p-6 rounded-lg shadow-lg">
          <Calculator
            numQuestions={Number(exam.numQuestions)}
            testType={exam.testType}
            onAnswersChange={handleAnswersChange}
          />
        </div>

        <div className="flex justify-center pt-6">
          <button
            type="submit"
            className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity hover:cursor-pointer">
            Ajouter Le controle
          </button>
        </div>
      </form>
    </div>
  );
}
