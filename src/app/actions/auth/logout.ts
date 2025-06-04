"use server";

import { clientAuth } from "@/app/firebase";
import { signOut } from "firebase/auth";

export async function Logout() {
  try {
    await signOut(clientAuth);
    return {
      status: 200,
      message: "Logged out successfully",
    };
  } catch (error) {
    return {
      status: 500,
      message: "Error logging out",
      error,
    };
  }
}
