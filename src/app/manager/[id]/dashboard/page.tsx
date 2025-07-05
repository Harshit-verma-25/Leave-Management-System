"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  Calendar,
  AlertCircle,
  User,
  FileText,
  XCircle,
} from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { ApprovalStatus, LeaveHistoryProps } from "@/app/types/leaves";
import { getAllLeave } from "@/app/actions/leave/getAllLeave";
import { getLeavesForApprover } from "@/app/actions/leave/getLeaveForApprover";
import { getLeaveByApprover } from "@/app/actions/leave/getLeaveByApprover";
import { toast } from "react-toastify";

export default function ManagerDashboard() {
  const params = useParams();
  const id = params.id as string;

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
  const [managerLeaves, setManagerLeaves] = useState<LeaveHistoryProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In real app, fetch from Firebase
    const fetchManagerData = async () => {
      try {
        const [myLeaves, pendingLeaves, historyLeaves] = await Promise.all([
          getAllLeave(id),
          getLeavesForApprover(id),
          getLeaveByApprover(id),
        ]);

        if (myLeaves.status === 200) {
          setManagerLeaves((myLeaves.data as LeaveHistoryProps[]) || []);
        } else {
          toast.error("Failed to fetch manager's leaves");
        }

        if (pendingLeaves.status === 200) {
          setPendingApprovals(
            (pendingLeaves.data as LeaveHistoryProps[]) || []
          );
        }

        if (historyLeaves.status === 200) {
          const history = historyLeaves.data as LeaveHistoryProps[];
          const thisMonthLeaves = history.filter((leave) => {
            const appliedDate = new Date(leave.appliedOn);
            return (
              appliedDate.getMonth() === new Date().getMonth() &&
              appliedDate.getFullYear() === new Date().getFullYear()
            );
          });

          setThisMonth({
            approved: thisMonthLeaves
              .map((doc) => doc)
              .filter((leave: any) =>
                leave.approvalStatus.some(
                  (status: ApprovalStatus) => status.status === "APPROVED"
                )
              ).length,
            disapproved: thisMonthLeaves
              .map((doc) => doc)
              .filter((leave: any) =>
                leave.approvalStatus.some(
                  (status: ApprovalStatus) => status.status === "DISAPPROVED"
                )
              ).length,
          });
        } else {
          toast.error("Failed to fetch leave history");
        }
      } catch (error) {
        console.error("Error fetching manager data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchManagerData();
  }, [id]);

  // Calculate stats from actual data
  const pendingCount = pendingApprovals.filter(
    (leave) => leave.currentApprover === id && leave.status === "PENDING"
  ).length;

  // Manager's personal leave statistics
  const managerTotalLeaves = managerLeaves.length;
  const managerPendingLeaves = managerLeaves.filter(
    (leave) => leave.status === "PENDING"
  ).length;
  const managerApprovedLeaves = managerLeaves.filter(
    (leave) => leave.status === "APPROVED"
  ).length;
  const managerDisapprovedLeaves = managerLeaves.filter(
    (leave) => leave.status === "DISAPPROVED"
  ).length;

  // Get manager's recent leaves
  const managerRecentLeaves = managerLeaves
    .sort(
      (a, b) =>
        new Date(b.appliedOn).getTime() - new Date(a.appliedOn).getTime()
    )
    .slice(0, 3);

  const handleApproval = async (
    leaveId: string,
    status: "APPROVED" | "DISAPPROVED",
    comment = ""
  ) => {
    // In real app, this would update Firebase
    console.log(`${status} leave ${leaveId} with comment: ${comment}`);
    // Update local state for demo
    setPendingApprovals((prev) => prev.filter((leave) => leave.id !== leaveId));
  };

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
            href={`/manager/${id}/leave-approval`}
            className="bg-black text-white p-4 rounded-xl hover:bg-gray-800 transition-colors flex items-center space-x-3"
          >
            <AlertCircle className="w-6 h-6" />
            <span className="font-medium">
              Pending Approvals ({pendingCount})
            </span>
          </Link>
          <Link
            href={`/manager/${id}/leaves/new/create`}
            className="bg-white border border-gray-200 p-4 rounded-xl hover:bg-gray-50 transition-colors flex items-center space-x-3"
          >
            <Calendar className="w-6 h-6 text-gray-600" />
            <span className="font-medium text-gray-900">Apply for Leave</span>
          </Link>
          <Link
            href={`/manager/${id}/leaves`}
            className="bg-white border border-gray-200 p-4 rounded-xl hover:bg-gray-50 transition-colors flex items-center space-x-3"
          >
            <FileText className="w-6 h-6 text-gray-600" />
            <span className="font-medium text-gray-900">My Leaves</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Team Statistics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {pendingCount}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved This Month</p>
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
                <p className="text-sm text-gray-600">Disapproved This Month</p>
                <p className="text-2xl font-bold text-red-600">
                  {thisMonth.disapproved}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Manager's Personal Leave Statistics */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          My Leave Statistics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Total Applied</p>
                <p className="text-2xl font-bold text-blue-600">
                  {managerTotalLeaves}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {managerPendingLeaves}
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
                  {managerApprovedLeaves}
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
                  {managerDisapprovedLeaves}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending Approvals - existing code stays the same */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Pending Approvals
            </h3>
            <Link
              href={`/manager/${id}/leave-approval`}
              className="text-sm text-black font-medium"
            >
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {pendingApprovals.length > 0 ? (
              pendingApprovals
                .filter(
                  (leave) =>
                    leave.currentApprover === id && leave.status === "PENDING"
                )
                .map((leave) => (
                  <div
                    key={leave.id}
                    className="border border-gray-100 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {leave.name}
                        </h4>
                        <p className="text-sm text-gray-600">{leave.leave}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {leave.reason}
                        </p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {leave.noOfDays} days
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
                      <span>
                        Applied:{" "}
                        {new Date(leave.appliedOn).toLocaleDateString()}
                      </span>
                    </div>

                    <Link href={`/manager/${id}/leave-approval`}>
                      <button className="mt-4 bg-black text-white py-2 px-4 rounded-lg">
                        View Details
                      </button>
                    </Link>
                  </div>
                ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No pending approvals</p>
              </div>
            )}
          </div>
        </div>

        {/* Manager's Recent Leaves - NEW SECTION */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              My Recent Leaves
            </h3>
            <Link
              href={`/manager/${id}/leaves`}
              className="text-sm text-black font-medium"
            >
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {managerRecentLeaves.length > 0 ? (
              managerRecentLeaves.map((leave) => (
                <div
                  key={leave.id}
                  className="border border-gray-100 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {leave.leave}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {leave.reason}
                      </p>
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

                  {/* Show approval status for manager's leaves */}
                  {leave.status === "PENDING" && (
                    <div className="mt-2 p-2 bg-yellow-50 rounded text-sm">
                      <span className="text-yellow-700">
                        Waiting for approval from{" "}
                        {
                          leave.approvalStatus.find(
                            (a) => a.status === "PENDING"
                          )?.name
                        }
                      </span>
                    </div>
                  )}

                  {leave.status === "APPROVED" &&
                    leave.approvalStatus.find((a) => a.comment) && (
                      <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                        <span className="font-medium text-green-700">
                          Approved:
                        </span>
                        <span className="text-green-600 ml-1">
                          {leave.approvalStatus.find((a) => a.comment)?.comment}
                        </span>
                      </div>
                    )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No recent leave applications</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
