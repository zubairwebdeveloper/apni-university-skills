import "server-only";

import { getAuth } from "firebase-admin/auth";
import { getAdminApp } from "./app";

export const adminAuth = getAuth(getAdminApp());

