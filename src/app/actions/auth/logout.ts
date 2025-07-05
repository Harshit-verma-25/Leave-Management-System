"use server";

import { clientAuth } from "@/app/firebase";
import { signOut } from "firebase/auth";
import { cookies } from "next/headers";

export async function Logout() {
  try {
    await signOut(clientAuth);

    const cookieStore = await cookies();

    cookieStore.delete("userId");
    cookieStore.delete("name");
    cookieStore.delete("role");

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
