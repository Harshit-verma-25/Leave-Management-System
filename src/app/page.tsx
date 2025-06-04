"use client";

import { useState } from "react";
import Image from "next/image";
import { LoginForm } from "@/app/components/login-form";

export default function Home() {
  const [type, setType] = useState("");

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Logo Section - 50% */}
      <div className="flex w-full items-center justify-center bg-slate-50 md:w-1/2 md:p-12">
        <div className="flex w-full flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-slate-100">
            {/* <Building2 className="h-16 w-16 text-slate-800" /> */}
            <Image
              src="/logo.png"
              alt="LeaveTrack Pro Logo"
              width={9999}
              height={9999}
              className="h-36 w-36 rounded-full bg-slate-800 p-2"
            />
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Wisitech InfoSolutions Pvt. Ltd.
          </h1>
          <p className="text-xl text-slate-600">Engage. Convert. Thrive. </p>
        </div>
      </div>

      {/* Login Section - 50% */}
      <div className="flex w-full items-center justify-center bg-white p-8 md:w-1/2 md:p-12">
        {type === "" && (
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900">
                Welcome Back
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Please select your role to continue
              </p>
            </div>

            <div className="space-y-4 text-white">
              <button
                className="w-full h-12 cursor-pointer rounded-md px-8 bg-slate-800 text-base hover:bg-slate-700 hover:scale-105"
                onClick={() => setType("employee")}
              >
                Login as Employee
              </button>

              <button
                className="w-full h-12 cursor-pointer rounded-md px-8 border-slate-300 text-base text-slate-800 hover:bg-slate-50 hover:scale-105"
                onClick={() => setType("manager")}
              >
                Login as Manager
              </button>

              <button
                className="w-full h-12 cursor-pointer rounded-md px-8 border-slate-300 bg-slate-100 text-base text-slate-800 hover:bg-slate-200 hover:scale-105"
                onClick={() => setType("admin")}
              >
                Login as Admin
              </button>
            </div>

            <div className="mt-8 text-center text-sm text-slate-500">
              <p>
                © {new Date().getFullYear()} Wisitech InfoSolutions Pvt. Ltd.
                All rights reserved.
              </p>
            </div>
          </div>
        )}

        {type === "employee" && <LoginForm type="Employee" setType={setType} />}
        {type === "manager" && <LoginForm type="Manager" setType={setType} />}
        {type === "admin" && <LoginForm type="Admin" setType={setType} />}
      </div>
    </div>
  );
}
