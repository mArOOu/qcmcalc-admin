"use client";

import { useState, useEffect, useMemo } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import AdminAnswerGrille from "./AdminAnswerGrille";
import { v4 as uuidv4 } from "uuid";
import {
  Search,
  Edit2,
  Trash2,
  Copy,
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Layers,
} from "lucide-react";

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

export default function EditExam() {
  const [exams, setExams] = useState<Array<{ id: string; data: ExamData }>>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>("");
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchExamsList = async () => {
    if (!db) return;
    try {
      setIsLoading(true);
      const snapshot = await getDocs(collection(db, "exams"));
      const list = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        data: docSnap.data() as ExamData,
      }));
      setExams(list);
    } catch (err: unknown) {
      console.error(err);
      setStatusMessage({ type: "error", text: "Erreur lors du chargement des examens." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExamsList();
  }, []);

  const handleSelectToEdit = (examId: string, data: ExamData) => {
    setSelectedExamId(examId);
    setExamData({
      ...data,
      id: examId,
      correctAnswers: data.correctAnswers || {},
    });
    setStatusMessage(null);
  };

  const handleDeleteExam = async (examId: string, examName: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement l'examen "${examName}" ? Cette action est irréversible.`)) {
      return;
    }

    if (!db) return;

    try {
      await deleteDoc(doc(db, "exams", examId));
      setStatusMessage({ type: "success", text: `Examen "${examName}" supprimé avec succès.` });
      setExams((prev) => prev.filter((item) => item.id !== examId));
      if (selectedExamId === examId) {
        setSelectedExamId("");
        setExamData(null);
      }
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setStatusMessage({ type: "error", text: `Erreur de suppression : ${msg}` });
    }
  };

  const handleDuplicateExam = async (item: { id: string; data: ExamData }) => {
    if (!db) return;
    try {
      const newId = uuidv4();
      const newExam: ExamData = {
        ...item.data,
        id: newId,
        name: `${item.data.name} (Copie)`,
      };
      await setDoc(doc(db, "exams", newId), newExam);
      setStatusMessage({ type: "success", text: `Examen dupliqué avec succès !` });
      fetchExamsList();
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setStatusMessage({ type: "error", text: `Erreur de duplication : ${msg}` });
    }
  };

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (!examData) return;
    setExamData({
      ...examData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAnswersChange = (answers: Record<number, string[]>) => {
    if (!examData) return;
    setExamData({
      ...examData,
      correctAnswers: answers,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamId || !examData || !db) return;

    try {
      setIsSaving(true);
      setStatusMessage(null);

      const examRef = doc(db, "exams", selectedExamId);
      await updateDoc(examRef, {
        name: examData.name,
        description: examData.description,
        subject: examData.subject,
        speciality: examData.speciality,
        grade: examData.grade,
        year: examData.year,
        session: examData.session,
        rotation: examData.rotation,
        type: examData.type,
        numQuestions: examData.numQuestions,
        testType: examData.testType,
        correctAnswers: examData.correctAnswers,
      });

      setStatusMessage({ type: "success", text: "✅ Modifications enregistrées avec succès !" });
      fetchExamsList();
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setStatusMessage({ type: "error", text: `Erreur lors de la sauvegarde : ${msg}` });
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered list
  const filteredExams = useMemo(() => {
    return exams.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.data.name?.toLowerCase().includes(q) ||
        item.data.subject?.toLowerCase().includes(q) ||
        item.data.year?.toString().includes(q);

      const matchYear = yearFilter === "all" || item.data.year?.toString() === yearFilter;
      return matchQuery && matchYear;
    });
  }, [exams, searchQuery, yearFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-zinc-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Chargement des examens depuis Firestore...
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Status banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-sm flex items-center justify-between gap-3 animate-in fade-in ${
            statusMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}>
          <div className="flex items-center gap-2.5">
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {!examData ? (
        /* Catalog View */
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-zinc-800">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-400" />
                <span>Gestion des Examens ({exams.length})</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Recherchez, modifiez, dupliquez ou supprimez des examens existants.
              </p>
            </div>
          </div>

          {/* Search & Year filters */}
          <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Rechercher par titre ou module..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="p-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="all">Toutes les années</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Exam Table / List */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            {filteredExams.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 text-sm">
                Aucun examen ne correspond à votre recherche.
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/80">
                {filteredExams.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-800/40 transition">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {item.data.year || "—"}
                        </span>
                        {item.data.session && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            Session {item.data.session}
                          </span>
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                          {item.data.numQuestions} QCMs
                        </span>
                        {item.data.speciality && (
                          <span className="text-[10px] font-medium text-zinc-400">
                            • {item.data.speciality}
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-white text-base">
                        {item.data.name}
                      </h4>
                      <p className="text-xs text-zinc-400">
                        Module : <span className="text-zinc-200">{item.data.subject}</span> {item.data.grade && `• ${item.data.grade}`}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSelectToEdit(item.id, item.data)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm cursor-pointer">
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Modifier</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDuplicateExam(item)}
                        className="p-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
                        title="Dupliquer">
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteExam(item.id, item.data.name)}
                        className="p-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                        title="Supprimer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Edit Form View */
        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <button
              type="button"
              onClick={() => setExamData(null)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à la liste des examens</span>
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-500/20 cursor-pointer disabled:opacity-50">
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Sauvegarde...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Enregistrer les modifications</span>
                </>
              )}
            </button>
          </div>

          {/* Form Content */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 backdrop-blur-md shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white border-b border-zinc-800 pb-2">
              Détails de l&apos;Examen : {examData.name}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Nom du Contrôle
                </label>
                <input
                  name="name"
                  value={examData.name}
                  onChange={handleFieldChange}
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Matière / Module
                </label>
                <input
                  name="subject"
                  value={examData.subject}
                  onChange={handleFieldChange}
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Année Civile
                </label>
                <select
                  name="year"
                  value={examData.year}
                  onChange={handleFieldChange}
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {YEARS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Session
                </label>
                <select
                  name="session"
                  value={examData.session}
                  onChange={handleFieldChange}
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="Normal">Normale</option>
                  <option value="Rattrapage">Rattrapage</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">
                  Nombre de questions
                </label>
                <input
                  type="number"
                  name="numQuestions"
                  value={examData.numQuestions}
                  onChange={handleFieldChange}
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Grille */}
          <AdminAnswerGrille
            numQuestions={parseInt(examData.numQuestions, 10) || 30}
            answers={examData.correctAnswers || {}}
            onChange={handleAnswersChange}
            label="Clé de Correction Officielle"
          />

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setExamData(null)}
              className="px-5 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition">
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-lg shadow-blue-500/20">
              {isSaving ? "Sauvegarde..." : "Enregistrer les modifications"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
