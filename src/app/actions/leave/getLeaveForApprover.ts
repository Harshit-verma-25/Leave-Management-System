"use server";

import { db } from "@/app/firebase";
import { collection, getDocs } from "firebase/firestore";

interface LeaveRequest {
  status: number;
  message: string;
  data?: any;
  error?: any;
}

export async function getLeavesForApprover(
  userId: string
): Promise<LeaveRequest> {
  try {
    const leavesRef = collection(db, "leaves");
    const snapshot = await getDocs(leavesRef);

    if (snapshot.empty) {
      return {
        status: 404,
        message: "No leave requests found",
      };
    }

    const result = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((leave: any) => leave.currentApprover === userId);

    return {
      status: 200,
      message: "Leave requests fetched successfully",
      data: result,
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching leave requests:", error.message);
    } else {
      console.error("Error fetching leave requests:", error);
    }
    return {
      status: 500,
      message: "Error fetching leave requests",
      error,
    };
  }
}
