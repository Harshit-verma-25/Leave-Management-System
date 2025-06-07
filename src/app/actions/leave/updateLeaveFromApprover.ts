"use server";

import { db } from "@/app/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export async function updateLeaveFromApprover(
  leaveID: string,
  approverID: string,
  status: "APPROVED" | "DISAPPROVED",
  approvedOn: string,
  comment?: string
) {
  try {
    const leaveRef = doc(db, "leaves", leaveID);
    const leaveSnap = await getDoc(leaveRef);

    if (!leaveSnap.exists()) {
      throw new Error("Leave not found");
    }

    const leaveData = leaveSnap.data();
    const approvalStatus = leaveData.approvalStatus || [];

    const index = approvalStatus.findIndex(
      (entry: any) => entry.id === approverID
    );

    if (index === -1) {
      return {
        status: 404,
        message: "Approver not found in leave application",
      };
    }

    approvalStatus[index] = {
      ...approvalStatus[index],
      status,
      approvedOn,
      comment: comment || "",
    };

    if (status === "DISAPPROVED") {
      // If the leave is rejected, we can set the current approver to null
      await updateDoc(leaveRef, {
        approvalStatus,
        currentApprover: null,
        status: "DISAPPROVED",
      });

      return {
        status: 200,
        message: "Leave application rejected successfully",
      };
    }

    // If the leave is approved, we can update the current approver
    const nextApprover = approvalStatus.find(
      (entry: any) => entry.status === "PENDING"
    );

    await updateDoc(leaveRef, {
      approvalStatus,
      currentApprover: nextApprover ? nextApprover.id : null,
    });

    // If there are no more pending approvals, we can set the status to APPROVED
    if (!nextApprover) {
      await updateDoc(leaveRef, {
        status: "APPROVED",
      });
    }

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
