import { getFirestore } from "firebase/firestore";
import { clientApp } from "./config";

export const clientDb = getFirestore(clientApp);

