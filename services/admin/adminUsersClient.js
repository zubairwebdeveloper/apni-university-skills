// services/admin/adminUsersClient.js
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client/auth";

const COL = "admins";

function friendly(error) {
  if (error?.code === "permission-denied") {
    return new Error(
      "You don't have permission to do that. Only admins can manage admin users.",
    );
  }
  if (error?.code === "unavailable") {
    return new Error(
      "Network problem. Please check your connection and try again.",
    );
  }
  return error instanceof Error ? error : new Error("Something went wrong.");
}

export async function listAdmins() {
  try {
    const snap = await getDocs(collection(db, COL));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    throw friendly(e);
  }
}

export async function getAdmin(email) {
  try {
    const snap = await getDoc(doc(db, COL, email.toLowerCase()));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (e) {
    throw friendly(e);
  }
}

export async function createAdmin(values) {
  try {
    const ref = doc(db, COL, values.email);
    if ((await getDoc(ref)).exists()) {
      throw new Error("An admin with this email already exists.");
    }
    await setDoc(ref, {
      name: values.name,
      email: values.email,
      image: values.image,
      role: values.role,
      createdAt: serverTimestamp(),
      createdBy: auth.currentUser?.email ?? null,
    });
  } catch (e) {
    throw friendly(e);
  }
}

export async function updateAdmin(email, values) {
  try {
    await updateDoc(doc(db, COL, email), {
      name: values.name,
      image: values.image,
      role: values.role,
      updatedAt: serverTimestamp(),
      updatedBy: auth.currentUser?.email ?? null,
    });
  } catch (e) {
    throw friendly(e);
  }
}

export async function deleteAdmin(email) {
  try {
    await deleteDoc(doc(db, COL, email));
  } catch (e) {
    throw friendly(e);
  }
}
