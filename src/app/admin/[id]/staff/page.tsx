"use client";

import { getAllStaff } from "@/app/actions/staff/getAllStaff";
import { Card } from "@/app/components/card";
import { StaffData } from "@/app/types/user";
import { User2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function StaffPage() {
  const { id: adminId } = useParams();

  const [data, setData] = useState<StaffData[] | null>(null);

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const response = await getAllStaff();
        if (response.status === 200) {
          setData(
            (response.data as StaffData[]).filter(
              (staff) => staff.role !== "admin"
            ) ?? []
          );
        } else {
          console.error("Error fetching staff data:", response.message);
        }
      } catch (error) {
        console.error("Error fetching staff data:", error);
      }
    };
    fetchStaffData();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9fa] lg:p-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Staff</h1>
      </div>

      <div className="mb-6 flex items-center justify-end">
        <Link href={`/admin/${adminId}/staff/new/create`}>
          <button className="rounded bg-black px-4 py-2 text-white cursor-pointer">
            Add New Staff
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {data && data.length > 0 ? (
          data.map((staff) => (
            <Card key={staff.id} className="p-4 flex flex-col items-center">
              <div className="mb-4 h-48 rounded-full flex items-center justify-center">
                {typeof staff.profile === "string" && staff.profile ? (
                  <Image
                    src={staff.profile || ""}
                    alt={`${staff.firstName} ${staff.lastName} Profile`}
                    width={9999}
                    height={9999}
                    className="h-full w-full object-cover rounded"
                  />
                ) : (
                  <User2 className="h-full w-full rounded-full border-2 border-gray-300" />
                )}
              </div>
              <p className="text-center">
                <span className="font-bold text-gray-900">
                  {staff.firstName} {staff.lastName}
                </span>
              </p>

              <p className="text-center mb-2">
                <span className="text-gray-900">{staff.designation}</span>
                <br />
                <span className="text-gray-600">
                  ({staff.role[0].toUpperCase() + staff.role.slice(1)})
                </span>
              </p>

              <div className="flex gap-2">
                <Link
                  href={`/admin/${adminId}/staff/${staff.id}/view`}
                  className="p-2 w-12 text-center text-sm bg-black text-white rounded"
                >
                  View
                </Link>
                <Link
                  href={`/admin/${adminId}/staff/${staff.id}/edit`}
                  className="p-2 w-12 text-center text-sm bg-black text-white rounded"
                >
                  Edit
                </Link>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-1 md:col-span-2 lg:col-span-4 flex items-center justify-center h-full">
            <p className="text-gray-500">No staff found</p>
          </div>
        )}
      </div>
    </div>
  );
}
