"use client";

import { Card, CardTitle } from "@/app/components/card";
import { CalendarClock, Network, NotepadText, User2 } from "lucide-react";
import { useEffect, useState } from "react";

type Employee = {
  name: string;
  designation: string;
  role: string;
};

type Count = {
  staff: number;
  departments: number;
  leaveTypes: number;
  leaveRequests: number;
};

type RecentLeaves = {
  name: string;
  startDate: string;
  endDate: string;
};

export default function AdminDashboardPage() {
  const [count, setCount] = useState<Count>({
    staff: 0,
    departments: 0,
    leaveTypes: 0,
    leaveRequests: 0,
  });

  const [newestEmployees, setNewestEmployees] = useState<Employee[] | null>(
    null
  );

  const [recentLeaves, setRecentLeaves] = useState<RecentLeaves[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = {
        staff: 10,
        departments: 5,
        leaveTypes: 3,
        leaveRequests: 20,
      };

      const employees = [
        { name: "John Doe", designation: "Software Engineer", role: "Staff" },
        { name: "Jane Smith", designation: "Product Manager", role: "Staff" },
        { name: "Alice Johnson", designation: "UX Designer", role: "Staff" },
        { name: "Bob Brown", designation: "Data Analyst", role: "Staff" },
        {
          name: "Charlie Davis",
          designation: "DevOps Engineer",
          role: "Staff",
        },
      ];

      const leaves = [
        {
          name: "John Doe",
          startDate: "2023-10-01",
          endDate: "2023-10-05",
        },
        {
          name: "Jane Smith",
          startDate: "2023-10-03",
          endDate: "2023-10-07",
        },
        {
          name: "Alice Johnson",
          startDate: "2023-10-02",
          endDate: "2023-10-06",
        },
      ];

      setCount(data);
      setNewestEmployees(employees);
      setRecentLeaves(leaves);
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9fa] lg:p-6 p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 flex flex-col justify-between min-h-36">
          <CardTitle className="flex items-center justify-between text-[#8742f5]">
            <User2 className="h-10 w-10" />
            <h1 className="font-bold text-2xl">Active Staff</h1>
          </CardTitle>

          <div className="w-full text-right text-4xl font-semibold text-gray-900">
            {count.staff}
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between min-h-36">
          <CardTitle className="flex items-center justify-between text-[#f542e0]">
            <Network className="h-10 w-10" />
            <h1 className="font-bold text-2xl">Departments</h1>
          </CardTitle>

          <div className="w-full text-right text-4xl font-semibold text-gray-900">
            {count.departments}
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between min-h-36">
          <CardTitle className="flex items-center justify-between text-[#f5a742]">
            <CalendarClock className="h-10 w-10" />
            <h1 className="font-bold text-2xl">Leave Types</h1>
          </CardTitle>

          <div className="w-full text-right text-4xl font-semibold text-gray-900">
            {count.leaveTypes}
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between min-h-36">
          <CardTitle className="flex items-center justify-between text-[#4287f5]">
            <NotepadText className="h-10 w-10" />
            <h1 className="font-bold text-2xl">Leave Requests</h1>
          </CardTitle>

          <div className="w-full text-right text-4xl font-semibold text-gray-900">
            {count.leaveRequests}
          </div>
        </Card>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <CardTitle className="mb-4">
            <h1 className="font-semibold text-lg">Newest Employees</h1>
          </CardTitle>

          <table className="min-w-full text-center">
            <thead>
              <tr className="border-b bg-gray-200">
                {["Full Name", "Designation", "Role"].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-2 text-center text-gray-600"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="text-gray-800">
              {newestEmployees ? (
                newestEmployees.map((employee) => (
                  <tr key={employee.name} className="border-b">
                    <td className="px-4 py-2">{employee.name}</td>
                    <td className="px-4 py-2">{employee.designation}</td>
                    <td className="px-4 py-2">{employee.role}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-2 text-gray-500">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        <Card className="p-4">
          <CardTitle className="mb-4">
            <h1 className="font-semibold text-lg">Recent Leaves</h1>
          </CardTitle>

          <table className="min-w-full text-center">
            <thead>
              <tr className="border-b bg-gray-200">
                {["Full Name", "Start Date", "End Date"].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-2 text-center text-gray-600"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="text-gray-800">
              {recentLeaves.map((leave) => (
                <tr key={leave.name} className="border-b">
                  <td className="px-4 py-2">{leave.name}</td>
                  <td className="px-4 py-2">{leave.startDate}</td>
                  <td className="px-4 py-2">{leave.endDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
