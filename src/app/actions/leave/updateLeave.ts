"use server";

import { db } from "@/app/firebase";
import { LeaveHistoryProps } from "@/app/types/leaves";
import { doc, updateDoc } from "firebase/firestore";

export async function updateLeave(
  leaveID: string,
  data: LeaveHistoryProps
): Promise<{
  status: number;
  message: string;
  error?: any;
}> {
  try {
    const leaveRef = doc(db, "leaves", leaveID);
    if (!leaveRef) {
      return {
        status: 404,
        message: "Leave application not found",
      };
    }

    await updateDoc(leaveRef, data as any);

    return {
      status: 200,
      message: "Leave application updated successfully",
    };
  } catch (error) {
    return {
      status: 500,
      message: "Error updating leave application",
      error,
    };
  }
}
