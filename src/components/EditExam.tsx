"use client";

import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import Calculator from "./Calculator";
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

const getAllExamIDs = async () => {
  if (!db) {
    console.error("Firebase not initialized");
    return [];
  }
  const snapshot = await getDocs(collection(db, "exams"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    data: doc.data() as ExamData,
  }));
};

export default function EditExam() {
  const [exams, setExams] = useState<Array<{ id: string; data: ExamData }>>([]);
  const [selectedExam, setSelectedExam] = useState<string>("");
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const examsList = await getAllExamIDs();
        setExams(examsList);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading exams:", error);
        setIsLoading(false);
      }
    };

    fetchExams();
  }, []); // Only run once on mount

  const handleExamSelect = async (examId: string) => {
    if (!db) {
      console.error("Firebase not initialized");
      return;
    }
    setSelectedExam(examId);
    if (!examId) {
      setExamData(null);
      return;
    }

    try {
      const examDoc = await getDoc(doc(db, "exams", examId));
      if (examDoc.exists()) {
        const data = examDoc.data() as ExamData;
        setExamData(data);
      }
    } catch (error) {
      console.error("Error loading exam:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    if (!examData) return;

    setExamData({
      ...examData,
      [e.target.name]: e.target.value,
    });
  };
  const handleNumQuestionsChange = (value: number) => {
    if (!examData) return;

    setExamData({
      ...examData,
      numQuestions: value.toString(),
    });
  };

  const handleTestTypeChange = (value: string) => {
    if (!examData) return;

    setExamData({
      ...examData,
      testType: value,
    });
  };

  const handleAnswersChange = (answers: Record<number, string[]>) => {
    if (!examData) return;

    setExamData({
      ...examData,
      correctAnswers: answers,
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam || !examData || !db) return;

    try {
      setIsSaving(true);
      const examRef = doc(db, "exams", selectedExam);

      // Validate required fields
      const requiredFields = [
        "name",
        "description",
        "subject",
        "speciality",
        "grade",
        "year",
        "session",
        "rotation",
        "type",
        "numQuestions",
        "testType",
      ] as const;

      const missingFields = requiredFields.filter((field) => !examData[field]);
      if (missingFields.length > 0) {
        alert(
          `Please fill in all required fields: ${missingFields.join(", ")}`
        );
        return;
      }

      // Extract everything except id for update
      const {
        name,
        description,
        subject,
        speciality,
        grade,
        year,
        session,
        rotation,
        type,
        numQuestions,
        testType,
        correctAnswers,
      } = examData;

      await updateDoc(examRef, {
        name,
        description,
        subject,
        speciality,
        grade,
        year,
        session,
        rotation,
        type,
        numQuestions,
        testType,
        correctAnswers,
      });
      alert("✅ Exam updated successfully!");
    } catch (error) {
      console.error("Error updating exam:", error);
      alert("❌ Failed to update exam");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-background p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Edit Exam</h2>

      <div className="max-w-2xl mx-auto">
        <select
          value={selectedExam}
          onChange={(e) => handleExamSelect(e.target.value)}
          className="w-full p-3 rounded-md border border-border bg-background text-foreground mb-6">
          <option value="">Select an exam to edit</option>
          {exams.map((exam) => (
            <option key={exam.id} value={exam.id}>
              {exam.data.name} - {exam.data.subject} ({exam.data.year})
            </option>
          ))}
        </select>

        {examData && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="bg-card p-6 rounded-lg shadow-lg space-y-4">
              <h3 className="text-xl font-semibold mb-4">Basic Information</h3>
              <input
                name="name"
                value={examData.name}
                onChange={handleChange}
                placeholder="Exam Name"
                className="w-full p-3 rounded-md border border-border bg-background text-foreground"
                required
              />
              <textarea
                name="description"
                value={examData.description}
                onChange={handleChange}
                placeholder="Description"
                className="w-full p-3 rounded-md border border-border bg-background text-foreground min-h-[100px]"
                required
              />
              <input
                name="subject"
                value={examData.subject}
                onChange={handleChange}
                placeholder="Subject"
                className="w-full p-3 rounded-md border border-border bg-background text-foreground"
                required
              />
            </div>

            {/* Course Information Section */}
            <div className="bg-card p-6 rounded-lg shadow-lg space-y-4">
              <h3 className="text-xl font-semibold mb-4">Course Information</h3>
              <select
                name="speciality"
                value={examData.speciality}
                onChange={handleChange}
                className="w-full p-3 rounded-md border border-border bg-background text-foreground"
                required>
                <option value="">Select Speciality</option>
                <option value="medecine">Médecine</option>
                <option value="pharmacie">Pharmacie</option>
                <option value="chirdent">Chirurgie Dentaire</option>
              </select>

              <select
                name="grade"
                value={examData.grade}
                onChange={handleChange}
                className="w-full p-3 rounded-md border border-border bg-background text-foreground"
                required>
                <option value="">Select Grade</option>
                <option value="1ere">1ère Année</option>
                <option value="2eme">2ème Année</option>
                <option value="3eme">3ème Année</option>
                <option value="4eme">4ème Année</option>
                <option value="5eme">5ème Année</option>
                <option value="6eme">6ème Année</option>
              </select>

              <select
                name="year"
                value={examData.year}
                onChange={handleChange}
                className="w-full p-3 rounded-md border border-border bg-background text-foreground"
                required>
                <option value="2025">2025</option>
              </select>

              <select
                name="session"
                value={examData.session}
                onChange={handleChange}
                className="w-full p-3 rounded-md border border-border bg-background text-foreground"
                required>
                <option value="Normal">Session Normale</option>
                <option value="Rattrapage">Session de Rattrapage</option>
              </select>

              <input
                name="rotation"
                value={examData.rotation}
                onChange={handleChange}
                placeholder="Rotation"
                className="w-full p-3 rounded-md border border-border bg-background text-foreground"
                required
              />

              <select
                name="type"
                value={examData.type}
                onChange={handleChange}
                className="w-full p-3 rounded-md border border-border bg-background text-foreground"
                required>
                <option value="Théorique">Théorique</option>
                <option value="Clinique">Clinique</option>
              </select>
            </div>

            {/* Exam Setup Section */}
            <div className="bg-card p-6 rounded-lg shadow-lg space-y-4">
              <h3 className="text-xl font-semibold mb-4">Exam Setup</h3>
              <NumberOfQuestions onChange={handleNumQuestionsChange} />
              <TypeOfCorrection onChange={handleTestTypeChange} />
            </div>

            {/* Answer Input Section */}
            <div className="bg-card p-6 rounded-lg shadow-lg">
              <Calculator
                numQuestions={Number(examData.numQuestions)}
                testType={examData.testType}
                onAnswersChange={handleAnswersChange}
              />
            </div>

            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
