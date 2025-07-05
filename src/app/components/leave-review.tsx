"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { LeaveHistoryProps } from "@/app/types/leaves";
import formatDate from "@/app/components/formatDate";
import { useState } from "react";
import { updateLeaveFromApprover } from "../actions/leave/updateLeaveFromApprover";
import { toast } from "react-toastify";

interface LeaveReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaveData: LeaveHistoryProps;
  approverId: string;
  selectedTab: "PENDING" | "APPROVED" | "DISAPPROVED";
}

export default function LeaveReviewModal({
  isOpen,
  onClose,
  leaveData,
  approverId,
  selectedTab,
}: LeaveReviewModalProps) {
  const [commentModal, setCommentModal] = useState(false);
  const [comment, setComment] = useState("");
  const [actionType, setActionType] = useState<
    "APPROVED" | "DISAPPROVED" | null
  >(null);

  if (!isOpen || !leaveData) return null;

  const handleSubmit = async (
    status: "APPROVED" | "DISAPPROVED",
    comment: string
  ) => {
    const response = await updateLeaveFromApprover(
      leaveData.id,
      approverId,
      status,
      new Date().toISOString(),
      comment
    );

    if (response.status === 200) {
      onClose();
      setComment("");
      setCommentModal(false);
      setActionType(null);
    } else {
      console.error("Failed to update leave:", response.message);
    }
  };

  return (
    <>
      {commentModal && (
        <div className="fixed inset-0 z-60 bg-opacity-50 flex justify-center items-center p-4">
          <div className="bg-[#f8f9fa] rounded-xl shadow-2xl p-4 relative sm:min-w-96">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-xl font-semibold">
                {actionType === "APPROVED"
                  ? "Add an optional comment?"
                  : "Add a required comment"}
              </h2>
              <button
                className="text-black font-bold cursor-pointer"
                onClick={() => {
                  setCommentModal(false);
                  setComment("");
                  setActionType(null);
                }}
              >
                <X />
              </button>
            </div>

            <textarea
              className="w-full mt-4 p-2 border rounded-md"
              placeholder="Add your comment here..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={200}
            ></textarea>

            <div className="flex justify-end mt-4 gap-2">
              {actionType === "APPROVED" && (
                <button
                  onClick={() => handleSubmit("APPROVED", comment)}
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md cursor-pointer"
                >
                  Approve with Comment
                </button>
              )}

              <button
                onClick={() => {
                  if (actionType === "DISAPPROVED" && !comment.trim()) {
                    toast.error("Comment is required for rejection.");
                    return;
                  }
                  handleSubmit(actionType!, comment);
                }}
                className={` ${
                  actionType === "DISAPPROVED"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                } text-white px-5 py-2 rounded-md cursor-pointer`}
              >
                {actionType === "APPROVED" ? "Approve Anyway" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className={`fixed inset-0 z-50 bg-opacity-50 flex justify-center items-center p-4 ${
          commentModal && "blur-md"
        }`}
      >
        <div className="bg-[#f8f9fa] rounded-xl shadow-2xl p-4 relative sm:min-w-[60vw] max-sm:overflow-y-auto max-sm:max-h-[90vh]">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-xl font-semibold">Leave Request Details</h2>
            <button
              className="text-black font-bold cursor-pointer"
              onClick={onClose}
            >
              <X />
            </button>
          </div>

          <div className="mt-4 text-sm text-gray-700">
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              <span className="underline">Leave Details</span>:
            </h2>
            <div className="grid gap-2 md:grid-cols-2">
              {/* Leave Type */}
              <p>
                <strong className="mr-2">Leave Type:</strong>
                <span>{leaveData.leave}</span>
              </p>

              <p>
                <strong className="mr-2">Employee:</strong>
                <span>{leaveData.name}</span>
              </p>

              <p>
                <strong className="mr-2">Start Date:</strong>
                <span>{formatDate(leaveData.startDate || "")}</span>
              </p>

              <p>
                <strong className="mr-2">End Date:</strong>
                <span>{formatDate(leaveData.endDate || "")}</span>
              </p>

              <p>
                <strong className="mr-2">Duration:</strong>
                <span>
                  {leaveData.noOfDays}
                  {leaveData.noOfDays === 1 ? " day" : " days"}
                </span>
              </p>

              <p>
                <strong className="mr-2">Applied On:</strong>
                <span>{formatDate(leaveData.appliedOn || "")}</span>
              </p>
            </div>
          </div>

          {/* Contact Section */}
          <div className="mt-4 text-sm text-gray-700">
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              <span className="underline">Emergency Contact Details</span>:
            </h2>
            <div className="grid gap-2 md:grid-cols-2">
              <p>
                <strong className="mr-2">Location:</strong>
                <span>{leaveData.addressDuringLeave}</span>
              </p>

              <p>
                <strong className="mr-2">Contact:</strong>
                <span>
                  {leaveData.emergencyContactName} -{" "}
                  {leaveData.emergencyContactNumber}
                </span>
              </p>
            </div>
          </div>

          {/* Reason and Delegation */}
          <div className="mt-4 text-sm text-gray-700">
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              <span className="underline">
                Delegation of Duties & Project Handover
              </span>
              :
            </h2>

            <table className="min-w-full border">
              <thead className="text-center">
                <tr className="bg-gray-200 border-b">
                  <th className="px-4 py-2">Project Name</th>
                  <th className="px-4 py-2">Deadline</th>
                  <th className="px-4 py-2">Delegated To</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {leaveData.delegationOfDuties.length > 0 ? (
                  leaveData.delegationOfDuties.map((duty, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-100 transition-colors"
                    >
                      <td className="px-4 py-2">{duty.project}</td>
                      <td className="px-4 py-2">{formatDate(duty.deadline)}</td>
                      <td className="px-4 py-2">{duty.delegatedTo}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center px-4 py-2">
                      No delegation of duties provided.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Attachment Section */}
          <div className="mt-4 text-sm text-gray-700">
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              <span className="underline">Attachment (if any)</span>:
            </h2>
            {leaveData.attachment ? (
              <div className="flex items-center">
                {leaveData.attachment.endsWith(".pdf") ? (
                  <a
                    href={leaveData.attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Attachment
                  </a>
                ) : (
                  <Image
                    src={leaveData.attachment}
                    alt="Leave Attachment"
                    width={9999}
                    height={9999}
                    className="sm:h-48 w-auto object-cover rounded-md"
                  />
                )}
              </div>
            ) : (
              <p className="text-gray-500">No attachment provided.</p>
            )}
          </div>

          {selectedTab === "PENDING" && (
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => {
                  setActionType("APPROVED");
                  setCommentModal(true);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md cursor-pointer"
              >
                Approve
              </button>
              <button
                onClick={() => {
                  setActionType("DISAPPROVED");
                  setCommentModal(true);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-md cursor-pointer"
              >
                Disapprove
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
