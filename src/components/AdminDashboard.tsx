"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase-client";
import { useRouter } from "next/navigation";
import { setDoc, doc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import AdminAnswerGrille from "./AdminAnswerGrille";
import { CheckCircle2, AlertCircle, PlusCircle, Save, Loader2 } from "lucide-react";

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

const YEARS = ["2026", "2025", "2024", "2023", "2022", "2021", "2020"];
const QUESTION_PRESETS = [20, 30, 40, 50, 60];

export default function AdminDashboard({ onExamAdded }: { onExamAdded?: () => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [exam, setExam] = useState<ExamData>({
    id: uuidv4(),
    name: "",
    description: "",
    speciality: "Médecine",
    grade: "1ère année",
    year: "2025",
    subject: "",
    numQuestions: "30",
    testType: "partiallyNegative",
    correctAnswers: {},
    session: "Normal",
    rotation: "1",
    type: "Théorique",
  });

  const router = useRouter();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    if (auth) {
      unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (!currentUser) router.push("/login");
        else setUser(currentUser);
      });
    } else {
      router.push("/login");
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setExam({ ...exam, [e.target.name]: e.target.value });
  };

  const handleAnswersChange = (answers: Record<number, string[]>) => {
    setExam((prev) => ({
      ...prev,
      correctAnswers: answers,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!exam.name.trim() || !exam.subject.trim()) {
      setStatusMessage({ type: "error", text: "Veuillez renseigner le nom de l'examen et la matière/module." });
      return;
    }

    const answeredCount = Object.keys(exam.correctAnswers).filter(
      (k) => (exam.correctAnswers[Number(k)] || []).length > 0
    ).length;

    if (answeredCount === 0) {
      setStatusMessage({ type: "error", text: "Veuillez définir au moins une réponse dans la clé de correction." });
      return;
    }

    if (!db) {
      setStatusMessage({ type: "error", text: "Erreur de connexion à Firestore." });
      return;
    }

    try {
      setIsSubmitting(true);
      const examId = exam.id || uuidv4();
      const examRef = doc(db, "exams", examId);

      await setDoc(examRef, {
        ...exam,
        id: examId,
      });

      setStatusMessage({
        type: "success",
        text: `✅ Examen "${exam.name}" ajouté avec succès à la base de données !`,
      });

      // Reset for next exam
      setExam({
        id: uuidv4(),
        name: "",
        description: "",
        speciality: exam.speciality,
        grade: exam.grade,
        year: exam.year,
        subject: "",
        numQuestions: exam.numQuestions,
        testType: exam.testType,
        correctAnswers: {},
        session: exam.session,
        rotation: exam.rotation,
        type: exam.type,
      });

      if (onExamAdded) {
        onExamAdded();
      }
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setStatusMessage({ type: "error", text: `Erreur lors de l'enregistrement : ${msg}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center p-12 text-zinc-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Vérification des autorisations...
      </div>
    );
  }

  const numQInt = parseInt(exam.numQuestions, 10) || 30;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-blue-400" />
            <span>Ajouter une Nouvelle Épreuve / Examen</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Enregistrez un nouveau sujet dans les annales officielles de Constantine.
          </p>
        </div>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-sm flex items-center gap-3 animate-in fade-in ${
            statusMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}>
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Basic info */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 backdrop-blur-md shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white border-b border-zinc-800 pb-2">
            1. Informations de l&apos;Épreuve
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Titre du Contrôle / Examen *
              </label>
              <input
                name="name"
                required
                value={exam.name}
                onChange={handleChange}
                placeholder="Ex: Contrôle de Cardiologie EMD1 2025"
                className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Matière / Module *
              </label>
              <input
                name="subject"
                required
                value={exam.subject}
                onChange={handleChange}
                placeholder="Ex: Cardiologie"
                className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Description ou Précisions
            </label>
            <textarea
              name="description"
              rows={2}
              value={exam.description}
              onChange={handleChange}
              placeholder="Ex: Épreuve théorique de cardiologie - Faculté de Médecine de Constantine"
              className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Step 2: Academic Classification */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 backdrop-blur-md shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white border-b border-zinc-800 pb-2">
            2. Classification Académique
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Filière / Spécialité
              </label>
              <select
                name="speciality"
                value={exam.speciality}
                onChange={handleChange}
                className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="Médecine">Médecine</option>
                <option value="Pharmacie">Pharmacie</option>
                <option value="Chirurgie Dentaire">Chirurgie Dentaire</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Année d&apos;étude
              </label>
              <select
                name="grade"
                value={exam.grade}
                onChange={handleChange}
                className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="1ère année">1ère Année</option>
                <option value="2ème année">2ème Année</option>
                <option value="3ème année">3ème Année</option>
                <option value="4ème année">4ème Année</option>
                <option value="5ème année">5ème Année</option>
                <option value="6ème année">6ème Année</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Promotion / Année Civile
              </label>
              <select
                name="year"
                value={exam.year}
                onChange={handleChange}
                className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Session
              </label>
              <select
                name="session"
                value={exam.session}
                onChange={handleChange}
                className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="Normal">Session Normale</option>
                <option value="Rattrapage">Session de Rattrapage</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Type
              </label>
              <select
                name="type"
                value={exam.type}
                onChange={handleChange}
                className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="Théorique">Théorique</option>
                <option value="Clinique">Clinique</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Rotation
              </label>
              <input
                name="rotation"
                value={exam.rotation}
                onChange={handleChange}
                placeholder="Ex: 1, 2, ou EMD"
                className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Exam Parameters */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 backdrop-blur-md shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white border-b border-zinc-800 pb-2">
            3. Barème & Nombre de Questions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">
                Nombre total de questions
              </label>
              <div className="flex flex-wrap gap-1.5">
                {QUESTION_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setExam({ ...exam, numQuestions: p.toString() })}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      exam.numQuestions === p.toString()
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-800 text-zinc-400 hover:text-white"
                    }`}>
                    {p} QCMs
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                max="200"
                value={exam.numQuestions}
                onChange={(e) => setExam({ ...exam, numQuestions: e.target.value })}
                className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                placeholder="Nombre personnalisé"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">
                Mode de correction
              </label>
              <select
                name="testType"
                value={exam.testType}
                onChange={handleChange}
                className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="partiallyNegative">Partielle (Constantine: toute erreur = 0 pt)</option>
                <option value="allOrNothing">Tout ou Rien (combinaison exacte requise)</option>
                <option value="partiallyPositive">Partielle Américaine (points négatifs)</option>
                <option value="QCSs">QCS (Question à Choix Simple)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Step 4: Correct Answers Key */}
        <AdminAnswerGrille
          numQuestions={numQInt}
          answers={exam.correctAnswers}
          onChange={handleAnswersChange}
          label="4. Clé de Correction Officielle"
        />

        {/* Submit */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-500/25 transition cursor-pointer disabled:opacity-50">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Enregistrement en cours...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Enregistrer l&apos;examen dans la base</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
