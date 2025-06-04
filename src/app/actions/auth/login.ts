"use server";

import { adminAuth } from "@/app/firebase";

export async function Login(data: { token: string; role: string }) {
  try {
    // Verify token using Admin SDK
    const decodedToken = await adminAuth.verifyIdToken(data.token);

    if (!decodedToken) {
      return {
        status: 401,
        message: "Invalid token",
      };
    }

    const userId = decodedToken.uid;
    const role = decodedToken.role;
    const name = decodedToken.name;

    if (role.toLowerCase() !== data.role.toLowerCase()) {
      return {
        status: 403,
        message: "Unauthorized role",
      };
    }

    return {
      uid: userId,
      name,
      role,
      status: 200,
    };
  } catch (error: any) {
    console.error("Login error:", error.message);
    return {
      status: 500,
      message: "Invalid Email or Password",
    };
  }
}
