"use client";
import { useEffect, useState } from "react";
import { LEAVE_TYPES, LeaveHistoryProps } from "@/app/types/leaves";
import { getLeavesForApprover } from "@/app/actions/leave/getLeaveForApprover";
import formatDate from "@/app/components/formatDate";
import LeaveReviewModal from "@/app/components/leave-review";
import { getLeaveByApprover } from "@/app/actions/leave/getLeaveByApprover";
import ApprovalTimeline from "@/app/components/approval-timeline";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function LeaveApproval({ id }: { id: string }) {
  const [selectedTab, setSelectedTab] = useState<
    "PENDING" | "APPROVED" | "DISAPPROVED"
  >("PENDING");
  const [leaveRequests, setLeaveRequests] = useState<LeaveHistoryProps[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);

  const [selectedRequest, setSelectedRequest] =
    useState<LeaveHistoryProps | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [expandCard, setExpandCard] = useState<string | null>(null);

  const fetchLeaveRequests = async () => {
    try {
      const [pendingRes, historyRes] = await Promise.all([
        getLeavesForApprover(id),
        getLeaveByApprover(id),
      ]);

      const pending = pendingRes.status === 200 ? pendingRes.data : [];
      const history = historyRes.status === 200 ? historyRes.data : [];

      // Remove duplicates by leave ID
      const uniqueMap = new Map();

      [...pending, ...history].forEach((leave: any) => {
        uniqueMap.set(leave.id, leave);
      });

      const combinedLeaves = Array.from(uniqueMap.values());

      setLeaveRequests(combinedLeaves);
    } catch (err) {
      console.error("Failed to fetch leave requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, [id]);

  const toggleCardExpansion = (leaveId: string) => {
    setExpandCard((prev) => (prev === leaveId ? null : leaveId));
  };

  const getCurrentStep = (leave: LeaveHistoryProps) => {
    return leave.approvalStatus?.findIndex(
      (status) => status.status === "PENDING"
    );
  };

  const filteredRequests = leaveRequests.filter((request) =>
    request.approvalStatus?.some(
      (step) => step.id === id && step.status === selectedTab
    )
  );

  return (
    <>
      {selectedRequest && (
        <LeaveReviewModal
          isOpen={isModalOpen}
          onClose={() => {
            setModalOpen(false);
            fetchLeaveRequests();
          }}
          leaveData={selectedRequest}
          approverId={id}
          selectedTab={selectedTab}
        />
      )}

      <div
        className={`min-h-screen bg-[#f8f9fa] p-6 ${isModalOpen && "blur-sm"}`}
      >
        <h1 className="text-3xl font-bold text-gray-900">Leave Approvals</h1>

        <p className="text-gray-600 mb-4">
          Manage and review leave requests from employees.
        </p>

        {/* Tabs */}
        <div className="flex space-x-3 mb-6">
          {(["PENDING", "APPROVED", "DISAPPROVED"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setSelectedTab(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium border   cursor-pointer ${
                selectedTab === status
                  ? "bg-black text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {status.charAt(0) + status.slice(1).toLowerCase()} (
              {leaveRequests
                ? leaveRequests.filter((r) =>
                    r.approvalStatus?.some(
                      (step) => step.id === id && step.status === status
                    )
                  ).length
                : 0}
              )
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center min-h-[200px]">
            <p className="text-gray-500">Loading leave requests...</p>
          </div>
        )}

        {/* No data */}
        {!loading &&
          selectedTab &&
          filteredRequests &&
          filteredRequests.length === 0 && (
            <div className="flex items-center justify-center min-h-[200px]">
              <p className="text-gray-500">
                No {selectedTab.toLowerCase()} leave requests found.
              </p>
            </div>
          )}

        {/* Leave Cards */}
        {!loading && filteredRequests && filteredRequests.length > 0 && (
          <div className="space-y-4">
            {filteredRequests.map((req) => {
              const isExpanded = expandCard === req.id;
              return (
                <div
                  key={req.id}
                  className=" p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-full flex flex-col md:flex-row justify-between">
                    <div className="flex-1 flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">
                          {
                            LEAVE_TYPES[
                              req.leaveType as keyof typeof LEAVE_TYPES
                            ]
                          }
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-3xl font-semibold text-xs ${
                            req.approvalStatus?.find((step) => step.id === id)
                              ?.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800 border border-yellow-800"
                              : req.approvalStatus?.find(
                                  (step) => step.id === id
                                )?.status === "APPROVED"
                              ? "bg-green-100 text-green-800 border border-green-800"
                              : "bg-red-100 text-red-800 border border-red-800"
                          }`}
                        >
                          {
                            req.approvalStatus?.find((step) => step.id === id)
                              ?.status
                          }
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <p className="text-sm text-gray-700">
                          <strong>Employee: </strong>
                          {req.name}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Start Date: </strong>
                          {formatDate(req.startDate ?? "")}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>End Date: </strong>
                          {formatDate(req.endDate ?? "")}
                        </p>
                        <p className="text-sm text-gray-700">
                          <strong>Duration: </strong>
                          {req.noOfDays} {req.noOfDays === 1 ? "day" : "days"}
                        </p>
                      </div>

                      <p className="text-sm text-gray-500">
                        Applied on {formatDate(req.appliedOn || "")}
                      </p>
                    </div>

                    <div className="flex flex-col items-end justify-between">
                      <button
                        className="bg-black text-white px-4 py-2 rounded-md cursor-pointer"
                        onClick={() => {
                          setSelectedRequest(req);
                          setModalOpen(true);
                        }}
                      >
                        {selectedTab === "PENDING" ? "Review" : "View Details"}
                      </button>

                      {/* Toggle timeline button */}
                      {selectedTab === "PENDING" && (
                        <button
                          onClick={() => toggleCardExpansion(req.id)}
                          className="flex items-center gap-1 text-sm text-black cursor-pointer transition-colors"
                        >
                          {isExpanded ? (
                            <>
                              Hide Timeline <ChevronUp className="w-4 h-4" />
                            </>
                          ) : (
                            <>
                              View Timeline <ChevronDown className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Approval Timeline - Expandable */}
                  {isExpanded && selectedTab === "PENDING" && (
                    <ApprovalTimeline
                      steps={req.approvalStatus || []}
                      currentStep={getCurrentStep(req)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
