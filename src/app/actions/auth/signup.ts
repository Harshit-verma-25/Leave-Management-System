"use server";

import { adminAuth, rltdb } from "@/app/firebase";
import { SingleStaffData } from "@/app/types/user";
import { ref, set } from "firebase/database";
import { createStaff } from "@/app/actions/staff/createStaff";
import { cookies } from "next/headers";

function getNextStaffId(currentId: string): string {
  const prefix = currentId.match(/^[A-Za-z]+/)?.[0] || "";
  const numberPart = currentId.match(/\d+$/)?.[0] || "";
  const nextNumber = (parseInt(numberPart, 10) + 1)
    .toString()
    .padStart(numberPart.length, "0");
  return prefix + nextNumber;
}

export async function SignUp(
  email: string,
  password: string,
  data: SingleStaffData,
  staffID: string
) {
  try {
    const existingUser = await adminAuth.getUserByEmail(email);
    if (existingUser) {
      return {
        status: 400,
        message: "User already exists",
      };
    }
  } catch (error: any) {
    if (error.code !== "auth/user-not-found") {
      return {
        status: 500,
        message: "Error checking existing user",
      };
    }
  }

  const newUser = await adminAuth.createUser({
    email,
    password,
    displayName: `${data.firstName} ${data.lastName}`,
  });

  const userId = newUser.uid;

  await adminAuth.setCustomUserClaims(userId, {
    role: data.role.toLowerCase(),
  });

  try {
    await createStaff(userId, staffID, email, data);

    const nextStaffID = getNextStaffId(staffID);
    await set(ref(rltdb), {
      LastStaffID: nextStaffID,
    });

    return {
      message: "Staff created successfully",
      status: 200,
    };
  } catch (error) {
    console.error("Error creating user:", error);
    if (userId) {
      await adminAuth.deleteUser(userId);

      await set(ref(rltdb), {
        LastStaffID: staffID,
      });
    }

    return {
      message: "Error creating user",
      status: 500,
    };
  }
}
