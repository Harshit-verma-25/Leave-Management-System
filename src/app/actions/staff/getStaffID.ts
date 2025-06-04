"use server";

import { get, ref } from "firebase/database";
import { rltdb } from "@/app/firebase";

export async function getStaffID() {
  const response = await get(ref(rltdb, "LastStaffID"));
  const lastStaffID = response.val();
  return lastStaffID;
}
