"use client";

import Header from "@/app/components/header";
import Sidebar from "@/app/components/sidebar";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { UserRole } from "@/app/types/user";
import { getSingleStaff } from "@/app/actions/staff/getSingleStaff";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const managerId = params?.id as string;

  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState<{
    name: string;
    role: UserRole;
    profile: string;
  }>({
    name: "",
    role: "employee",
    profile: "",
  });

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const user = sessionStorage.getItem("user");
      const response = await getSingleStaff(managerId);
      if (user && response.status === 200 && response.data) {
        const parsedUser = JSON.parse(user);

        setUser({
          name: parsedUser.name,
          role: parsedUser.role,
          profile: response.data.profile as string,
        });
      }
    };

    getUser();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <Header userName={user.name} profile={user.profile} role={user.role} />
      <div className="flex flex-grow relative">
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          role={user.role}
          userId={managerId}
        />

        <div className="flex-grow py-4 lg:px-6 px-4 transition-all duration-300">
          {children}
        </div>
      </div>
    </>
  );
}
