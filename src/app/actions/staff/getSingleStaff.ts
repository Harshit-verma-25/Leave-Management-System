"use server";

import { db } from "@/app/firebase";
import { StaffData } from "@/app/types/user";
import { doc, getDoc } from "firebase/firestore";

export async function getSingleStaff(staffID: string) {
  try {
    const staffRef = doc(db, "users", staffID);
    const staffSnapshot = await getDoc(staffRef);

    if (!staffSnapshot.exists()) {
      return {
        status: 404,
        message: "Staff not found",
      };
    }

    const staffData = staffSnapshot.data() as StaffData;

    return {
      status: 200,
      message: "Staff data fetched successfully",
      data: staffData,
    };
  } catch (error) {
    return {
      status: 500,
      message: "Error fetching staff data",
      error,
    };
  }
}
