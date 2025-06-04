"use server";

import { db } from "@/app/firebase";
import { query, where, collection, getDocs } from "firebase/firestore";

export async function getAllLeave(employeeID: string) {
  try {
    const leaveRef = query(
      collection(db, "leaves"),
      where("staffID", "==", employeeID)
    );

    const leaveDoc = await getDocs(leaveRef);

    if (leaveDoc.empty) {
      return {
        status: 404,
        message: "No leave applications found for this employee",
      };
    }

    const formattedData = leaveDoc.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      status: 200,
      data: formattedData,
      message: "Leave applications fetched successfully",
    };
  } catch (error) {
    return {
      status: 500,
      message: "Error fetching leave applications",
      error,
    };
  }
}
