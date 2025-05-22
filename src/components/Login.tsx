"use client";

import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin"); // Redirect to dashboard
    } catch (error) {
      alert("Login failed");
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Admin Login</h1>
      <input
        type="email"
        placeholder="Email"
        className="mb-2"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="mb-2"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-4 py-2 rounded">
        Login
      </button>
    </div>
  );
}
