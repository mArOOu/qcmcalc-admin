"use client";
import { useState } from "react";
import UploadExams from "@/components/UploadExams";

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (password === "YOUR_SECRET_PASSWORD") {
      setAuthenticated(true);
    } else {
      alert("Wrong password");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      {!authenticated ? (
        <div className="space-y-4">
          <input
            type="password"
            placeholder="Enter password"
            className="border p-2"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={handleLogin}
            className="bg-blue-600 text-white px-4 py-2 rounded">
            Login
          </button>
        </div>
      ) : (
        <UploadExams />
      )}
    </main>
  );
}
