"use client";
import { User2Icon, Crown, Star, Briefcase } from "lucide-react";
import Image from "next/image";
import type { UserRole } from "@/app/types/user";

export default function Header({
  userName,
  profile,
  role,
}: {
  userName: string;
  profile: string;
  role: UserRole;
}) {
  const getRoleConfig = (role: UserRole) => {
    switch (role) {
      case "admin":
        return {
          icon: Crown,
          label: "Administrator",
          badgeColor: "bg-red-100 text-red-800 border-red-200",
          ringColor: "ring-red-300",
          titlePrefix: "Admin",
        };
      case "manager":
        return {
          icon: Star,
          label: "Manager",
          badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
          ringColor: "ring-blue-300",
          titlePrefix: "Mgr",
        };
      case "employee":
        return {
          icon: Briefcase,
          label: "Employee",
          badgeColor: "bg-green-100 text-green-800 border-green-200",
          ringColor: "ring-green-300",
          titlePrefix: "Emp",
        };
      default:
        return {
          icon: User2Icon,
          label: "User",
          badgeColor: "bg-gray-100 text-gray-800 border-gray-200",
          ringColor: "ring-gray-300",
          titlePrefix: "User",
        };
    }
  };

  const roleConfig = getRoleConfig(role);
  const RoleIcon = roleConfig.icon;

  return (
    <header className="w-full bg-white shadow-md py-4 px-6 flex items-center justify-between">
      {/* Logo with Role Indicator */}
      <div className="flex items-center gap-4">
        <div className="text-xl h-10 w-10 font-bold text-slate-800">
          <Image
            src="/logo.png"
            alt="Company Logo"
            width={40}
            height={40}
            className="h-full w-full object-cover rounded-full bg-slate-800 p-0.5"
            priority
          />
        </div>

        {/* Role Badge */}
        <div
          className={`${roleConfig.badgeColor} px-3 py-1.5 rounded-full border flex items-center gap-2 shadow-sm`}
        >
          <RoleIcon className="w-4 h-4" />
          <span className="text-sm font-semibold">{roleConfig.label}</span>
        </div>
      </div>

      {/* User Info with Role Indicator */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="flex items-center gap-2">
            <span className="text-slate-700 font-medium">{userName}</span>
          </div>
          <span className="text-slate-500 text-xs capitalize">{role}</span>
        </div>

        {/* Profile Picture with Role Ring */}
        <div
          className={`w-10 h-10 rounded-full overflow-hidden border-2 ${roleConfig.ringColor} ring-2 ring-offset-2`}
        >
          {profile ? (
            <Image
              src={profile || "/placeholder.svg"}
              alt="User Profile"
              width={40}
              height={40}
              className="object-cover w-full h-full"
              priority
            />
          ) : (
            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
              <User2Icon className="w-6 h-6 text-slate-600" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
