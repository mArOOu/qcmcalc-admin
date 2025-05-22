"use client";

import { useState, useEffect } from "react";
import AdminDashboard from "@/components/AdminDashboard";
import EditExam from "@/components/EditExam";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"add" | "edit">("add");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Redirect to login if not authenticated
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]); // Add router as dependency

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
