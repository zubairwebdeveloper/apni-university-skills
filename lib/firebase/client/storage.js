import { getStorage } from "firebase/storage";
import { clientApp } from "./config";

export const storage = getStorage(clientApp);

