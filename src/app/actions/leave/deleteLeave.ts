"use server";

import { db } from "@/app/firebase";
import { doc, deleteDoc } from "firebase/firestore";

export const deleteLeave = async (leaveId: string) => {
  try {
    // Reference to the leave document
    const leaveDocRef = doc(db, "leaves", leaveId);

    // Delete the leave document
    await deleteDoc(leaveDocRef);

    return { status: 200, message: "Leave request deleted successfully." };
  } catch (error) {
    console.error("Error deleting leave request:", error);
    return {
      status: 500,
      message: "Failed to delete leave request. Please try again later.",
    };
  }
};
