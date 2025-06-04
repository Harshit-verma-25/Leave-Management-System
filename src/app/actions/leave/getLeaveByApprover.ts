"use server";

import { db } from "@/app/firebase";
import { collection, getDocs } from "firebase/firestore";

interface LeaveRequest {
  status: number;
  message: string;
  data?: any;
  error?: any;
}

export async function getLeaveByApprover(
  userId: string
): Promise<LeaveRequest> {
  try {
    const leavesRef = collection(db, "leaves");
    const leaveDocs = await getDocs(leavesRef);

    if (leaveDocs.empty) {
      return {
        status: 404,
        message: "No leave requests found",
      };
    }

    const result = leaveDocs.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter(
        (leave: any) =>
          Array.isArray(leave.approvalStatus) &&
          leave.approvalStatus.some(
            (entry: any) =>
              entry.id === userId &&
              (entry.status === "DISAPPROVED" || entry.status === "APPROVED")
          )
      );

    return {
      status: 200,
      message: "Leave requests fetched successfully",
      data: result,
    };
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    return {
      status: 500,
      message: "Error fetching leave requests",
      error,
    };
  }
}
