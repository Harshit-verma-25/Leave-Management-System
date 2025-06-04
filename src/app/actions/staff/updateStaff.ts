"use server";

import { db } from "@/app/firebase";
import { StaffData } from "@/app/types/user";
import { doc, updateDoc } from "firebase/firestore";

export async function updateStaff(staffID: string, data: StaffData) {
  try {
    const staffRef = doc(db, "users", staffID);
    await updateDoc(staffRef, data as Record<string, any>);

    return {
      status: 200,
      message: "Staff data updated successfully",
    };
  } catch (error) {
    return {
      status: 500,
      message: "Error updating staff data",
      error,
    };
  }
}
