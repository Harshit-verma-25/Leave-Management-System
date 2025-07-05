"use client";

import Header from "@/app/components/header";
import Sidebar from "@/app/components/sidebar";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { UserRole } from "@/app/types/user";
import { getSingleStaff } from "@/app/actions/staff/getSingleStaff";
import { getCookie } from "@/app/actions/getCookie";

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
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    if (typeof window !== "undefined") {
      handleResize(); // run once on load
      window.addEventListener("resize", handleResize);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
      const getUser = async () => {
        const user = await getCookie();
        if (!user) {
          console.error("User not found in cookies");
          return;
        }
  
        const { userId, name, role } = user;
        const response = await getSingleStaff(userId);
  
        if (response.data && response.status === 200) {
          setUser({
            name: name,
            role: role as UserRole,
            profile: (response.data.profile || "") as string,
          });
        } else {
          console.error("Error fetching user data:", response.message);
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
      <div className="flex max-sm:flex-col">
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          role={user.role}
          userId={managerId}
        />

        <div className="flex-1 lg:px-6 p-3 transition-all duration-300">
          {children}
        </div>
      </div>
    </>
  );
}
