import { NextRequest, NextResponse } from "next/server";
import { Login } from "@/app/actions/auth/login";
import { signInWithEmailAndPassword } from "firebase/auth";
import { clientAuth } from "@/app/firebase";

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json();

    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(
      clientAuth,
      email,
      password
    );

    if (!userCredential.user) {
      return NextResponse.json(
        { message: "Invalid Email or Password" },
        { status: 401 }
      );
    }

    // Prepare data for login action
    const data = {
      token: await userCredential.user.getIdToken(),
      role,
    };

    // Call the Login action
    const response = await Login(data);

    if (response.status !== 200) {
      return NextResponse.json(response, { status: response.status });
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("Login error:", error.message);
    return NextResponse.json(
      { message: "Invalid Email or Password" },
      { status: 500 }
    );
  }
}
