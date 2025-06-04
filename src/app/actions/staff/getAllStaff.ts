"use server";

import { db } from "@/app/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function getAllStaff() {
  try {
    const staffCollection = collection(db, "users");

    const staffSnapshot = await getDocs(staffCollection);
    const staffList = staffSnapshot.docs.map((doc) => ({
      ...doc.data(),
    }));

    if (staffList.length === 0) {
      return {
        status: 404,
        message: "No staff found",
      };
    }

    return {
      status: 200,
      message: "Staff data fetched successfully",
      data: staffList,
    };
  } catch (error) {
    return {
      status: 500,
      message: "Error fetching staff data",
      error,
    };
  }
}
