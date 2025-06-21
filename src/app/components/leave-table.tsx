import { useEffect, useState } from "react";
import Link from "next/link";
import { LEAVE_TYPES, LeaveHistoryProps } from "@/app/types/leaves";
import { useParams, useSearchParams } from "next/navigation";
import { getAllLeave } from "@/app/actions/leave/getAllLeave";
import formatDate from "@/app/components/formatDate";
import { deleteLeave } from "@/app/actions/leave/deleteLeave";
import { toast } from "react-toastify";
import ApprovalTimeline from "@/app/components/approval-timeline";
import { ChevronDown, ChevronUp, Filter, FilterIcon, X } from "lucide-react";

export const LeaveTable = ({ role }: { role: string }) => {
  const { id } = useParams() as { id: string };
  const searchParams = useSearchParams();

  const [selectedTab, setSelectedTab] = useState<
    "PENDING" | "APPROVED" | "DISAPPROVED"
  >("PENDING");

  const [data, setData] = useState<LeaveHistoryProps[] | null>(null);
  const [filteredData, setFilteredData] = useState<LeaveHistoryProps[] | null>(
    null
  );
  const [expandCard, setExpandCard] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch leave requests from the server
    const fetchLeaveRequests = async () => {
      try {
        const response = await getAllLeave(id);

        if (response.status === 404) {
          setData([]);
          return;
        }

        if (response.status !== 200) {
          throw new Error("Failed to fetch leave requests");
        }

        setData((response.data as LeaveHistoryProps[]) || []);
        setFilteredData(
          (response.data as LeaveHistoryProps[]).filter(
            (leave) => leave.status === selectedTab
          )
        );
      } catch (error) {
        console.error("Error fetching leave requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, [id, searchParams]);

  const toggleCardExpansion = (leaveId: string) => {
    setExpandCard((prev) => (prev === leaveId ? null : leaveId));
  };

  const getCurrentStep = (leave: LeaveHistoryProps) => {
    return leave.approvalStatus?.findIndex(
      (status) => status.status === "PENDING"
    );
  };

  const handleDeleteLeave = (leaveId: string) => async () => {
    try {
      const response = await deleteLeave(leaveId);
      if (response.status !== 200) {
        toast.error("Failed to delete leave request. Please try again later.");
        return;
      }

      setData((prevData) =>
        prevData ? prevData.filter((leave) => leave.id !== leaveId) : null
      );

      toast.success("Leave request deleted successfully.");
    } catch (error) {
      console.error("Error deleting leave request:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Leave Records</h1>
        <Link href={`/${role}/${id}/leaves/new/create`}>
          <button className="rounded bg-black px-4 py-2 text-white cursor-pointer">
            Apply for Leave
          </button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex space-x-3 mb-6">
        {(["PENDING", "APPROVED", "DISAPPROVED"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setSelectedTab(status)}
            className={`px-4 py-2 rounded-md text-sm font-medium border cursor-pointer ${
              selectedTab === status
                ? "bg-black text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {status.charAt(0) + status.slice(1).toLowerCase()} (
            {data ? data.filter((r) => r.status === status).length : 0})
          </button>
        ))}
      </div>

      {/* <div className="mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5" />
          <h2 className="text-xl font-bold text-gray-800">Filter & Search</h2>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2 w-fit">
              <input
                type="date"
                className="border rounded-md p-2 w-full"
                placeholder="Start Date"
              />

              <span>To</span>

              <input
                type="date"
                className="border rounded-md p-2 w-full"
                placeholder="End Date"
              />
            </div>

            <select className="border rounded-md p-2 w-full">
              <option value="">All Leave Types</option>
              {Object.entries(LEAVE_TYPES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>

            <select className="border rounded-md p-2 w-full">
              <option value="">All Durations</option>
              <option value="1">Less than 3 days</option>
              <option value="3">3 to 7 days</option>
              <option value="7">More than 7 days</option>
            </select>
          </div>

          <button className="flex items-center bg-black text-white py-2 px-3 rounded-md cursor-pointer">
            <X className="w-5 h-5" />
            Clear Filters
          </button>
        </div>
      </div> */}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-gray-500">Loading leave requests...</p>
        </div>
      )}

      {/* No data */}
      {!loading && selectedTab && filteredData && filteredData.length === 0 && (
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-gray-500">
            No {selectedTab.toLowerCase()} leave requests found.
          </p>
        </div>
      )}

      {/* Leave Cards */}
      {!loading && filteredData && filteredData.length > 0 && (
        <div className="space-y-4">
          {filteredData.map((req) => {
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
                        {LEAVE_TYPES[req.leaveType as keyof typeof LEAVE_TYPES]}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-3xl font-semibold text-xs ${
                          req.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800 border border-yellow-800"
                            : req.status === "APPROVED"
                            ? "bg-green-100 text-green-800 border border-green-800"
                            : "bg-red-100 text-red-800 border border-red-800"
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      Applied on {formatDate(req.appliedOn ?? "")}
                    </p>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {selectedTab === "PENDING" ? (
                        <>
                          <Link href={`/${role}/${id}/leaves/${req.id}/edit`}>
                            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md cursor-pointer transition-colors">
                              Edit
                            </button>
                          </Link>
                          <button
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md cursor-pointer transition-colors"
                            onClick={handleDeleteLeave(req.id)}
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <Link href={`/${role}/${id}/leaves/${req.id}/view`}>
                          <button className="bg-black text-white px-4 py-2 rounded-md cursor-pointer transition-colors">
                            View Details
                          </button>
                        </Link>
                      )}
                    </div>

                    {/* Toggle timeline button */}
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
                  </div>
                </div>

                {/* Approval Timeline - Expandable */}
                {isExpanded && (
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
  );
};
