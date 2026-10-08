// repositories/certificateRepository.js
import "server-only";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/firebase/admin/firestore";
import { serializeDoc } from "./baseRepository";

export const certificateRef = (studentId, courseId) =>
  db.collection("certificates").doc(`${studentId}_${courseId}`);
export const newCertificateNumber = () =>
  `AU-${randomBytes(5).toString("hex").toUpperCase()}`;

export const certificateRepository = {
  async findByVerificationCode(code) {
    const s = await db
      .collection("certificates")
      .where("verificationCode", "==", code)
      .limit(1)
      .get();
    return s.empty ? null : serializeDoc(s.docs[0]);
  },
  async listByStudent(studentId) {
    const snap = await db
      .collection("certificates")
      .where("studentId", "==", studentId)
      .limit(100)
      .get();
    return snap.docs
      .map((d) => serializeDoc(d))
      .sort((a, b) => (b.issuedAt ?? 0) - (a.issuedAt ?? 0));
  },
};

