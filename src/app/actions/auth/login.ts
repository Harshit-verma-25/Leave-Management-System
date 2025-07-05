"use server";

import { adminAuth } from "@/app/firebase";
import { cookies } from "next/headers";

export async function Login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      }
    );

    if (res.ok) {
      const user = await adminAuth.getUserByEmail(email);
      const customClaims = user.customClaims || {};
      console.log("Custom Claims:", customClaims);

      const cookieStore = await cookies();

      cookieStore.set("userId", user.uid, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        expires: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000), // 7 days
      });
      cookieStore.set("name", `${user.displayName}`, {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        expires: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000), // 7 days
      });
      cookieStore.set("role", customClaims.role.toLowerCase(), {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        expires: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000), // 7 days
      });

      return {
        status: 200,
        message: "Login successful.",
      };
    }
  } catch (error) {
    console.error("Error logging in:", error);
    return {
      error: "Error logging in",
    };
  }
}
