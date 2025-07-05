"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  User,
} from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ApprovalStatus, LeaveHistoryProps } from "@/app/types/leaves";
import { StaffData } from "@/app/types/user";
import { getAllStaff } from "@/app/actions/staff/getAllStaff";
import { getLeavesForApprover } from "@/app/actions/leave/getLeaveForApprover";
import { getLeaveByApprover } from "@/app/actions/leave/getLeaveByApprover";
import { toast } from "react-toastify";

export default function AdminDashboard() {
  const { id } = useParams() as { id: string };

  const [allStaff, setAllStaff] = useState<StaffData[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<LeaveHistoryProps[]>(
    []
  );
  const [thisMonth, setThisMonth] = useState<{
    approved: number;
    disapproved: number;
  }>({
    approved: 0,
    disapproved: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      setLoading(true);
      try {
        const [staff, pendingLeaves, historyLeaves] = await Promise.all([
          getAllStaff(),
          getLeavesForApprover(id),
          getLeaveByApprover(id),
        ]);

        if (staff.status === 404) {
          setAllStaff([]);
          return;
        }

        if (staff.status !== 200) {
          toast.error("Failed to fetch leave requests");
        }

        if (pendingLeaves.status !== 200 || historyLeaves.status !== 200) {
          toast.error("Failed to fetch leave requests");

          setPendingApprovals([]);
          setThisMonth({ approved: 0, disapproved: 0 });
          return;
        }

        setAllStaff(staff.data as StaffData[]);

        setPendingApprovals(pendingLeaves.data as LeaveHistoryProps[]);
        const leaves = historyLeaves.data as LeaveHistoryProps[];
        setThisMonth({
          approved: leaves
            .map((doc) => doc)
            .filter((leave: any) =>
              leave.approvalStatus.some(
                (status: ApprovalStatus) => status.status === "APPROVED"
              )
            ).length,
          disapproved: leaves
            .map((doc) => doc)
            .filter((leave: any) =>
              leave.approvalStatus.some(
                (status: ApprovalStatus) => status.status === "DISAPPROVED"
              )
            ).length,
        });
      } catch (error) {
        console.error("Error fetching leave requests:", error);
        toast.error("An error occurred while fetching leave requests");
        setPendingApprovals([]);
        setThisMonth({ approved: 0, disapproved: 0 });
        setAllStaff([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, [id]);

  const getStatusColor = (status: "PENDING" | "APPROVED" | "DISAPPROVED") => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border border-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800 border border-green-800";
      case "DISAPPROVED":
        return "bg-red-100 text-red-800 border border-red-800";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // Calculate organization-wide stats
  const totalEmployees = allStaff.filter(
    (staff) => staff.role === "employee"
  ).length;
  const totalManagers = allStaff.filter(
    (staff) => staff.role === "manager"
  ).length;

  const recentLeaves = [...pendingApprovals]
    .sort(
      (a, b) =>
        new Date(b.appliedOn).getTime() - new Date(a.appliedOn).getTime()
    )
    .slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] md:p-6 p-3">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
        Dashboard
      </h1>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href={`/admin/${id}/staff`}
            className="bg-black text-white p-4 rounded-xl hover:bg-gray-800 transition-colors flex items-center space-x-3"
          >
            <Users className="w-6 h-6" />
            <span className="font-medium">Staff Management</span>
          </Link>
          <Link
            href={`/admin/${id}/leave-approval`}
            className="bg-white border border-gray-200 p-4 rounded-xl hover:bg-gray-50 transition-colors flex items-center space-x-3"
          >
            <Clock className="w-6 h-6 text-gray-600" />
            <span className="font-medium text-gray-900">Leave Approvals</span>
          </Link>
        </div>
      </div>

      {/* Organization Statistics */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Organization Statistics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Employees</p>
                <p className="text-2xl font-bold text-blue-900">
                  {totalEmployees}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Managers</p>
                <p className="text-2xl font-bold text-purple-900">
                  {totalManagers}
                </p>
              </div>
              <User className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {pendingApprovals.length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {thisMonth.approved}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Disapproved</p>
                <p className="text-2xl font-bold text-red-600">
                  {thisMonth.disapproved}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 md:p-6 p-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Applications
          </h3>
          <Link
            href={`/employee/${id}/leaves`}
            className="text-sm text-black font-medium"
          >
            View All
          </Link>
        </div>

        <div className="space-y-4">
          {recentLeaves.length > 0 ? (
            recentLeaves.map((leave) => (
              <div
                key={leave.id}
                className="border border-gray-100 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{leave.leave}</h4>
                    <p className="text-sm text-gray-600 mt-1">{leave.reason}</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                      leave.status
                    )}`}
                  >
                    {leave.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    {leave.startDate && leave.endDate && (
                      <>
                        {new Date(leave.startDate).toLocaleDateString()} -{" "}
                        {new Date(leave.endDate).toLocaleDateString()}
                      </>
                    )}
                  </span>
                  <span>{leave.noOfDays} days</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No leave applications yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
