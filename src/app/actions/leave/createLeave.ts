"use server";

import { db } from "@/app/firebase";
import { ApplyLeaveProps } from "@/app/types/leaves";
import { doc, setDoc } from "firebase/firestore";
interface CreateLeave extends ApplyLeaveProps {
  attachment: string | null;
  approvalStatus: {
    id: string;
    name: string;
    comment: string;
    status: "PENDING" | "APPROVED" | "DISAPPROVED";
    approvedOn: string;
    designation: string;
  }[];
  currentApprover: string;
  name: string;
}

export async function createLeave(data: CreateLeave, leaveID: string) {
  try {
    const leaveRef = doc(db, "leaves", leaveID);
    await setDoc(leaveRef, data);

    return {
      status: 200,
      message: "Leave application created successfully",
    };
  } catch (error) {
    return {
      status: 500,
      message: "Error creating leave application",
      error,
    };
  }
}
