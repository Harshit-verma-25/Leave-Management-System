"use server";

import { db } from "@/app/firebase";
import { doc, setDoc } from "firebase/firestore";
import { SingleStaffData } from "@/app/types/user";

export async function createStaff(
  userId: string,
  staffID: string,
  email: string,
  data: SingleStaffData
) {
  try {
    await setDoc(doc(db, "users", userId), {
      id: userId,
      staffID,
      email,
      profile: data.profile,
      firstName: data.firstName,
      lastName: data.lastName,
      gender: data.gender,
      phoneNo: data.phoneNo,
      ...(data.role === "employee" && { assignedUnder: data.assignedUnder }),
      designation: data.designation,
      role: data.role.toLowerCase(),
      joiningDate: new Date().toISOString(),
      ...(data.role !== "admin" && {
        reportingAuthority: data.reportingAuthority,
      }),
    }).then(() => {
      return {
        message: "Staff created successfully",
        status: 200,
      };
    });
  } catch (error) {
    console.error("Error setting staff document:", error);
    throw new Error("Failed to create staff record.");
  }
}
