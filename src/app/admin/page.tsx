"use client";

import { useState, useEffect } from "react";
import AdminDashboard from "@/components/AdminDashboard";
import EditExam from "@/components/EditExam";
import UploadExams from "@/components/UploadExams";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase-client";
import { onAuthStateChanged } from "firebase/auth";
import { Layers, PlusCircle, UploadCloud, Loader2 } from "lucide-react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"manage" | "add" | "bulk">("manage");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setIsLoading(true);
    let unsubscribe: (() => void) | undefined;

    if (auth) {
      unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!user) {
          router.push("/login");
        }
        setIsLoading(false);
      });
    } else {
      router.push("/login");
      setIsLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center text-zinc-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="text-sm">Vérification de la session administrateur...</span>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-zinc-950 text-white py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top Tab Bar */}
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-lg">
            <button
              onClick={() => setActiveTab("manage")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                activeTab === "manage"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-zinc-400 hover:text-white"
              }`}>
              <Layers className="w-4 h-4" />
              <span>Gérer les Examens</span>
            </button>

            <button
              onClick={() => setActiveTab("add")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                activeTab === "add"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-zinc-400 hover:text-white"
              }`}>
              <PlusCircle className="w-4 h-4" />
              <span>Ajouter un Examen</span>
            </button>

            <button
              onClick={() => setActiveTab("bulk")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                activeTab === "bulk"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "text-zinc-400 hover:text-white"
              }`}>
              <UploadCloud className="w-4 h-4" />
              <span>Import en Masse</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in duration-200">
          {activeTab === "manage" && <EditExam />}
          {activeTab === "add" && <AdminDashboard onExamAdded={() => setActiveTab("manage")} />}
          {activeTab === "bulk" && (
            <div className="max-w-2xl mx-auto bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 backdrop-blur-md shadow-xl text-center space-y-4">
              <h3 className="text-lg font-bold text-white">Import JSON en Masse vers Firestore</h3>
              <p className="text-xs text-zinc-400">
                Synchronisez l&apos;ensemble du catalogue local <code className="text-zinc-200">exams.json</code> vers la collection Firestore <code className="text-zinc-200">exams</code>.
              </p>
              <UploadExams />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
