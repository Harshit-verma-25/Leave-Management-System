"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, CheckCircle, XCircle, Plus } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { LeaveHistoryProps } from "@/app/types/leaves";
import { getAllLeave } from "@/app/actions/leave/getAllLeave";
import { toast } from "react-toastify";

export default function EmployeeDashboard() {
  const { id } = useParams() as { id: string };

  const [leaveHistory, setLeaveHistory] = useState<LeaveHistoryProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaveRequests = async () => {
      setLoading(true);
      try {
        const response = await getAllLeave(id);

        if (response.status === 404) {
          setLeaveHistory([]);
          return;
        }

        if (response.status !== 200) {
          toast.error("Failed to fetch leave requests");
        }

        const leaves = (response.data as LeaveHistoryProps[]) || [];
        setLeaveHistory(leaves);
      } catch (error) {
        console.error("Error fetching leave requests:", error);
        toast.error("An error occurred while fetching leave requests");
        setLeaveHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, [id]);

  // Calculate stats from actual leave data
  const totalLeaves = leaveHistory.length;
  const pendingLeaves = leaveHistory.filter(
    (leave) => leave.status === "PENDING"
  ).length;
  const approvedLeaves = leaveHistory.filter(
    (leave) => leave.status === "APPROVED"
  ).length;
  const disapprovedLeaves = leaveHistory.filter(
    (leave) => leave.status === "DISAPPROVED"
  ).length;

  // Get recent leaves (last 3)
  const recentLeaves = leaveHistory
    .sort(
      (a, b) =>
        new Date(b.appliedOn).getTime() - new Date(a.appliedOn).getTime()
    )
    .slice(0, 3);

  // Get upcoming approved leaves
  const upcomingLeaves = leaveHistory.filter(
    (leave) =>
      leave.status === "APPROVED" &&
      leave.startDate &&
      new Date(leave.startDate) > new Date()
  );

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
            href={`/employee/${id}/leaves/new/create`}
            className="bg-black text-white p-4 rounded-xl hover:bg-gray-800 transition-colors flex items-center space-x-3"
          >
            <Plus className="w-6 h-6" />
            <span className="font-medium">Apply for Leave</span>
          </Link>
          <Link
            href={`/employee/${id}/leaves`}
            className="bg-white border border-gray-200 p-4 rounded-xl hover:bg-gray-50 transition-colors flex items-center space-x-3"
          >
            <Calendar className="w-6 h-6" />
            <span className="font-medium text-gray-900">View All Leaves</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Leave Statistics
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex item-center justify-between">
              <div>
                <p className="text-sm">Total Applied</p>
                <p className="text-2xl font-bold text-blue-600">
                  {totalLeaves}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex item-center justify-between">
              <div>
                <p className="text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {pendingLeaves}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex item-center justify-between">
              <div>
                <p className="text-sm">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {approvedLeaves}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex item-center justify-between">
              <div>
                <p className="text-sm">Disapproved</p>
                <p className="text-2xl font-bold text-red-600">
                  {disapprovedLeaves}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Leave Applications */}
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

        {/* Upcoming Leaves */}
        <div className="bg-white rounded-xl border border-gray-200 md:p-6 p-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Upcoming Leaves
            </h3>
          </div>

          {upcomingLeaves.length > 0 ? (
            <div className="space-y-4">
              {upcomingLeaves.map((leave) => (
                <div
                  key={leave.id}
                  className="border border-gray-100 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{leave.leave}</h4>
                    <span className="text-sm text-gray-500">
                      {leave.noOfDays} days
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      {leave.startDate && leave.endDate && (
                        <>
                          {new Date(leave.startDate).toLocaleDateString()} -{" "}
                          {new Date(leave.endDate).toLocaleDateString()}
                        </>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No upcoming leaves scheduled</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
