"use client";

import { useState, useEffect } from "react";
import AdminDashboard from "@/components/AdminDashboard";
import EditExam from "@/components/EditExam";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase-client";
import { onAuthStateChanged } from "firebase/auth";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"add" | "edit">("add");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    setIsLoading(true);
    let unsubscribe: () => void;

    if (auth) {
      unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!user) {
          // Redirect to login if not authenticated
          router.push("/login");
        }
        setIsLoading(false);
      });
    } else {
      // If auth is not initialized, redirect to login
      router.push("/login");
      setIsLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [router]); // Add router as dependency
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4">
        <div className="flex justify-center space-x-4 py-6">
          <button
            onClick={() => setActiveTab("add")}
            className={`px-6 py-2 rounded-full font-semibold transition-colors ${
              activeTab === "add"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}>
            Add Exam
          </button>
          <button
            onClick={() => setActiveTab("edit")}
            className={`px-6 py-2 rounded-full font-semibold transition-colors ${
              activeTab === "edit"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}>
            Edit Exam
          </button>
        </div>

        <div className="mt-6">
          {activeTab === "add" ? <AdminDashboard /> : <EditExam />}
        </div>
      </div>
    </div>
  );
}
