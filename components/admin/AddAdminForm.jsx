// components/admin/AddAdminForm.jsx
"use client";

import { useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export function AddAdminForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState("");
  const [msg, setMsg] = useState("");

  async function handleSubmit() {
    const clean = email.trim().toLowerCase();
    if (!clean) return;

    try {
      await setDoc(doc(db, "admins", clean), {
        name: name.trim(),
        email: clean,
        image: image.trim(),
        role: "admin",
        createdAt: serverTimestamp(),
      });
      setMsg("Admin add ho gaya");
      setName("");
      setEmail("");
      setImage("");
    } catch (e) {
      setMsg("Error: " + e.message);
    }
  }

  return (
    <div className="space-y-3 max-w-sm">
      <input
        className="w-full border rounded px-3 py-2"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="w-full border rounded px-3 py-2"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-full border rounded px-3 py-2"
        placeholder="Image URL"
        value={image}
        onChange={(e) => setImage(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        className="rounded bg-primary px-4 py-2 text-primary-foreground"
      >
        Add admin
      </button>
      {msg && <p className="text-sm">{msg}</p>}
    </div>
  );
}
