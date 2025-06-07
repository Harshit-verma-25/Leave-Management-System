"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  LEAVE_TYPES,
  ApplyLeaveProps,
  LeaveHistoryProps,
} from "@/app/types/leaves";
import Image from "next/image";
import { Plus, X } from "lucide-react";
import { toast } from "react-toastify";
import { eachDayOfInterval, isBefore, parseISO } from "date-fns";
import { uploadImage } from "@/app/actions/image/uploadImage";
import { createLeave } from "@/app/actions/leave/createLeave";
import { nanoid } from "nanoid";
import { getSingleLeave } from "@/app/actions/leave/getSingleLeave";
import { updateLeave } from "@/app/actions/leave/updateLeave";
import { getSingleStaff } from "../actions/staff/getSingleStaff";
import { ReportingAuthority } from "@/app/types/user";
import React from "react";

type roleType = "manager" | "employee";
type LeaveMode = "create" | "edit" | "view";

export const LeaveForm = ({ role }: { role: roleType }) => {
  const { id, leaveID, mode } = useParams() as {
    id: string;
    leaveID: string;
    mode: LeaveMode;
  };

  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState<ApplyLeaveProps | LeaveHistoryProps>(
    {
      staffID: id,
      leaveType: "",
      leave: "",
      startDate: null,
      endDate: null,
      noOfDays: 0,
      addressDuringLeave: "",
      emergencyContactName: "",
      emergencyContactNumber: "",
      delegationOfDuties: [
        {
          project: "",
          deadline: "",
          delegatedTo: "",
        },
      ],
      reason: "",
      appliedOn: new Date().toISOString().split("T")[0],
      status: "PENDING",
    }
  );
  const [reportingAuthority, setReportingAuthority] = useState<
    ReportingAuthority[]
  >([]);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode === "create") return;

    const fetchLeaveData = async () => {
      try {
        const response = await getSingleLeave(leaveID);

        if (response.status === 200 && response.data) {
          setFormData(response.data as LeaveHistoryProps);

          if (response.data.attachment) {
            setAttachmentPreview(response.data.attachment);
          }
        } else {
          console.error(response.error);
        }
      } catch (error) {
        console.error("Error fetching leave application:", error);
      }
    };

    fetchLeaveData();
  }, [mode]);

  useEffect(() => {
    const fetchReportingAuthority = async () => {
      try {
        const response = await getSingleStaff(id);
        if (response.status === 200 && response.data) {
          setReportingAuthority(
            response.data.reportingAuthority.map((auth) => ({
              id: auth.id,
              name: auth.name,
              designation: auth.designation,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching reporting authority:", error);
        toast.error("Failed to fetch reporting authority.");
      }
    };

    fetchReportingAuthority();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];
    const maxSize = 5 * 1024 * 1024; // 5 MB

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Invalid file type. Please upload a PDF or image file (JPG, JPEG, PNG)."
      );
      if (fileInputRef.current) fileInputRef.current.value = ""; // reset input
      return;
    }

    if (file.size > maxSize) {
      toast.error("File size exceeds 5 MB. Please upload a smaller file.");
      if (fileInputRef.current) fileInputRef.current.value = ""; // reset input
      return;
    }

    setAttachment(file);

    // Generate preview if it's an image
    if (file.type.startsWith("image/")) {
      const imageURL = URL.createObjectURL(file);
      setAttachmentPreview(imageURL);
    } else {
      setAttachmentPreview(null); // No preview for PDF
    }
  };

  const addProject = () => {
    setFormData((prev) => ({
      ...prev,
      delegationOfDuties: [
        ...prev.delegationOfDuties,
        { project: "", deadline: "", delegatedTo: "" },
      ],
    }));
  };

  const removeProject = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      delegationOfDuties: prev.delegationOfDuties.filter((_, i) => i !== index),
    }));
  };

  const handleProjectChange = (
    index: number,
    field: keyof ApplyLeaveProps["delegationOfDuties"][number],
    value: string
  ) => {
    setFormData((prev) => {
      const updatedProjects = [...prev.delegationOfDuties];
      updatedProjects[index][field] = value;
      return { ...prev, delegationOfDuties: updatedProjects };
    });
  };

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // For dates, we need to parse them and check validity
    if (name === "startDate" || name === "endDate") {
      const updatedFormData = {
        ...formData,
        [name]: value,
      };

      const { startDate, endDate } = updatedFormData;

      if (startDate && endDate) {
        if (isBefore(parseISO(endDate), parseISO(startDate))) {
          toast.error("End date cannot be before start date.");
          return;
        }

        // Get all dates in the interval
        const allDates = eachDayOfInterval({
          start: parseISO(startDate),
          end: parseISO(endDate),
        });

        // Count only weekdays (Mon–Fri)
        const workingDays = allDates.filter(
          (date) => date.getDay() !== 0 && date.getDay() !== 6
        ).length;

        updatedFormData.noOfDays = workingDays;
      }

      setFormData(updatedFormData);
      return;
    }

    if (name === "leaveType") {
      const leaveType = value as keyof typeof LEAVE_TYPES;
      const leaveName = LEAVE_TYPES[leaveType];

      if (!leaveName) {
        toast.error("Invalid leave type selected.");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        leaveType: leaveType,
        leave: leaveName,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isImage = (url: string) => /\.(jpeg|jpg|png|webp)$/i.test(url);
  //   const isPDF = (url: string) => /\.pdf$/i.test(url);

  function toBase64(file: File): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  console.log("Form Data:", formData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Phone validation
    if (
      formData.emergencyContactNumber &&
      formData.emergencyContactNumber.trim() !== ""
    ) {
      const phoneRegex = /^[0-9]{10}$/;

      if (!phoneRegex.test(formData.emergencyContactNumber)) {
        toast.error("Please enter a valid 10-digit phone number.");
        setIsSubmitting(false);
        return;
      }
    }

    // Validate required fields
    const requiredFields = [
      "leaveType",
      "startDate",
      "endDate",
      "addressDuringLeave",
      "emergencyContactName",
      "emergencyContactNumber",
      "reason",
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof ApplyLeaveProps]) {
        toast.error(`Please fill in the ${field.replace(/([A-Z])/g, " $1")}.`);
        setIsSubmitting(false);
        return;
      }
    }

    for (const project of formData.delegationOfDuties) {
      if (!project.project || !project.deadline || !project.delegatedTo) {
        toast.error("Please fill in all fields for each project.");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      let url: string | null = null;
      const leaveID = "id" in formData && formData.id ? formData.id : nanoid();
      if (attachment) {
        const base64 = await toBase64(attachment);
        if (typeof base64 === "string") {
          url = await uploadImage(base64, leaveID, `leave-attachments/${id}`);
        }
      }

      if (mode === "edit") {
        const updatedData = {
          ...formData,
          attachment: url || "",
        };
        const response = await updateLeave(
          leaveID,
          updatedData as LeaveHistoryProps
        );

        if (response.status === 200) {
          toast.success("Leave application updated successfully.");
          router.push(`/${role}/${id}/leaves`);
        } else {
          toast.error(response.message);
        }
      } else {
        const appStats = reportingAuthority.map((auth) => ({
          id: auth.id,
          name: auth.name,
          status: "PENDING",
          approvedOn: "",
          comment: "",
          designation: auth.designation,
        }));

        const response = await createLeave(
          {
            ...formData,
            attachment: url || "",
            approvalStatus: appStats as LeaveHistoryProps["approvalStatus"],
            currentApprover: reportingAuthority[0].id,
            name: JSON.parse(sessionStorage.getItem("user") || "{}").name,
          },
          leaveID
        );

        if (response.status === 200) {
          toast.success("Leave application submitted successfully.");
          router.push(`/${role}/${id}/leaves`);
        } else {
          toast.error(response.message);
        }
      }
    } catch (error) {
      console.error("Error submitting leave application:", error);
      toast.error("An error occurred while submitting the application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] lg:p-6 p-4">
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Leave Application
          </h1>
          <p className="text-gray-600">
            Please fill out the form below to apply for leave. Ensure all
            details are accurate before submitting.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Leave Details Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              <span className="underline">Leave Details</span>:
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Leave Type */}
              <div>
                <label
                  htmlFor="leaveType"
                  className="block font-semibold text-gray-700 mb-1"
                >
                  Leave Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="leaveType"
                  value={formData.leaveType}
                  onChange={handleChange}
                  name="leaveType"
                  className={`w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-black ${
                    mode === "view" ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  required
                  disabled={mode === "view"}
                >
                  <option value="">Select Leave Type</option>
                  {Object.entries(LEAVE_TYPES).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start & End Date + No. of Days */}
              <div>
                <label
                  htmlFor="startDate"
                  className="block font-semibold text-gray-700 mb-1"
                >
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="startDate"
                  type="date"
                  name="startDate"
                  value={formData.startDate || ""}
                  onChange={handleChange}
                  className={`w-full border border-gray-300 rounded-md p-2 ${
                    mode === "view" ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  required
                  readOnly={mode === "view"}
                />
              </div>

              <div>
                <label
                  htmlFor="endDate"
                  className="block font-semibold text-gray-700 mb-1"
                >
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="endDate"
                  type="date"
                  name="endDate"
                  value={formData.endDate || ""}
                  onChange={handleChange}
                  className={`w-full border border-gray-300 rounded-md p-2 ${
                    mode === "view" ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  required
                  readOnly={mode === "view"}
                />
              </div>

              <div>
                <label
                  htmlFor="noOfdays"
                  className="block font-semibold text-gray-700 mb-1"
                >
                  No. of Days <span className="text-red-500">*</span>
                </label>
                <input
                  id="noOfdays"
                  type="number"
                  value={formData.noOfDays}
                  readOnly
                  className="w-full border border-gray-300 rounded-md p-2 bg-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              <span className="underline">Contact Details</span>:
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="addressDuringLeave"
                  className="block font-semibold text-gray-700 mb-1"
                >
                  Address During Leave <span className="text-red-500">*</span>
                </label>
                <input
                  id="addressDuringLeave"
                  type="text"
                  name="addressDuringLeave"
                  value={formData.addressDuringLeave}
                  onChange={handleChange}
                  placeholder="Enter your address during leave"
                  className={`w-full border border-gray-300 rounded-md p-2 ${
                    mode === "view" ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  required
                  readOnly={mode === "view"}
                />
              </div>
              <div>
                <label
                  htmlFor="emergencyContactName"
                  className="block font-semibold text-gray-700 mb-1"
                >
                  Emergency Contact Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="emergencyContactName"
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  placeholder="Enter your contact name"
                  className={`w-full border border-gray-300 rounded-md p-2 ${
                    mode === "view" ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  required
                  readOnly={mode === "view"}
                />
              </div>
              <div>
                <label
                  htmlFor="emergencyContactNumber"
                  className="block font-semibold text-gray-700 mb-1"
                >
                  Emergency Contact Number{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="emergencyContactNumber"
                  type="text"
                  name="emergencyContactNumber"
                  value={formData.emergencyContactNumber}
                  onChange={handleChange}
                  placeholder="Enter emergency number"
                  className={`w-full border border-gray-300 rounded-md p-2 ${
                    mode === "view" ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  required
                  readOnly={mode === "view"}
                />
              </div>
            </div>
          </div>

          {/* Reason and Delegation */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                <span className="underline">
                  Delegation of Duties & Project Handover
                </span>
                :
              </h2>
              {mode !== "view" && (
                <button
                  type="button"
                  onClick={addProject}
                  className={`bg-black text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-1 ${
                    formData.delegationOfDuties.length >= 3
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                  disabled={formData.delegationOfDuties.length >= 3}
                >
                  <Plus className="w-5 h-5 text-white" />
                  Add Project
                </button>
              )}
            </div>

            <div className="space-y-4 mt-4">
              {formData.delegationOfDuties.map((project, index) => (
                <div key={index} className="grid gap-4 md:grid-cols-2">
                  {index === 0 && (
                    <h3 className="text-lg font-semibold text-gray-800 col-span-2">
                      Project {index + 1}{" "}
                      <span className="text-red-500">*</span>{" "}
                      {
                        <span className="text-sm font-normal text-gray-600">
                          (At least one project is required)
                        </span>
                      }
                    </h3>
                  )}

                  {index !== 0 && (
                    <div className="flex items-center justify-between col-span-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Project {index + 1}{" "}
                      </h3>
                      <button
                        type="button"
                        onClick={() => removeProject(index)}
                        className={`px-4 py-2 border border-red-600 hover:border-red-800 rounded-lg font-medium duration-200 flex items-center gap-1 text-red-600 hover:text-red-800 transition cursor-pointer ${
                          mode === "view" ? "hidden" : ""
                        }`}
                      >
                        <X className="w-5 h-5" /> Remove
                      </button>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor={`project-${index}`}
                      className="block font-semibold text-gray-700 mb-1"
                    >
                      Project Name{" "}
                      {index === 0 && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      id={`project-${index}`}
                      type="text"
                      name="delegatedTo"
                      value={project.project}
                      onChange={(e) =>
                        handleProjectChange(index, "project", e.target.value)
                      }
                      placeholder="Enter project name"
                      className={`w-full border border-gray-300 rounded-md p-2 ${
                        mode === "view" ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                      required
                      readOnly={mode === "view"}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`deadline-${index}`}
                      className="block font-semibold text-gray-700 mb-1"
                    >
                      Deadline{" "}
                      {index === 0 && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      id={`deadline-${index}`}
                      type="date"
                      name="deadline"
                      value={project.deadline}
                      onChange={(e) =>
                        handleProjectChange(index, "deadline", e.target.value)
                      }
                      className={`w-full border border-gray-300 rounded-md p-2 ${
                        mode === "view" ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                      required
                      readOnly={mode === "view"}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label
                      htmlFor={`delegatedTo-${index}`}
                      className="block font-semibold text-gray-700 mb-1"
                    >
                      Delegated To{" "}
                      {index === 0 && <span className="text-red-500">*</span>}
                    </label>
                    <textarea
                      id={`delegatedTo-${index}`}
                      name="delegatedTo"
                      value={project.delegatedTo}
                      onChange={(e) =>
                        handleProjectChange(
                          index,
                          "delegatedTo",
                          e.target.value
                        )
                      }
                      placeholder="Enter delegate's name"
                      rows={3}
                      className={`w-full border border-gray-300 rounded-md p-2 ${
                        mode === "view" ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                      required
                      readOnly={mode === "view"}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              <span className="underline">Leave Justification</span>:
            </h2>
            <label
              htmlFor="reason"
              className="block font-semibold text-gray-700 mb-1"
            >
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reason"
              name="reason"
              onChange={handleChange}
              value={formData.reason}
              placeholder="State your reason"
              rows={3}
              className={`w-full border border-gray-300 rounded-md p-2 ${
                mode === "view" ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
              required
              readOnly={mode === "view"}
            />
          </div>

          {/* Attachment Section */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Attachment (if any)
            </h2>
            {attachmentPreview ? (
              <>
                <div className="relative w-60">
                  {isImage(attachmentPreview) ? (
                    <Image
                      src={attachmentPreview}
                      width={9999}
                      height={9999}
                      alt="Attachment Preview"
                      className="max-h-60 w-full rounded-md border object-contain"
                    />
                  ) : (
                    <a
                      href={attachmentPreview}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      className="w-full h-20 bg-gray-200 rounded-md flex items-center justify-center text-gray-700 hover:bg-gray-300 transition"
                    >
                      <span className="text-sm">View Attachment</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setAttachment(null);
                      setAttachmentPreview(null);
                    }}
                    className="absolute cursor-pointer top-2 right-2 bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-black hover:text-white transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p>{attachment?.name && `Attachment: ${attachment.name}`}</p>
              </>
            ) : (
              <>
                <input
                  id="attachments"
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg, .png"
                  onChange={handleFileChange}
                  className={`w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-black ${
                    mode === "view" ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                  readOnly={mode === "view"}
                />
                <p className="text-gray-500 text-sm">
                  Attach any relevant documents (PDF, JPG, JPEG) with max size
                  5-MB.
                  <br />
                  <span className="text-red-500">
                    Note: Only one file can be attached.
                  </span>
                </p>
              </>
            )}
          </div>

          {/* Submit Buttons */}
          {mode !== "view" && (
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="text-white bg-red-600 hover:bg-red-700 px-6 py-2 rounded-md font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 cursor-pointer"
                } text-white font-semibold px-6 py-2 rounded-md`}
              >
                {isSubmitting
                  ? mode === "edit"
                    ? "Updating..."
                    : "Submitting..."
                  : mode === "edit"
                  ? "Update Request"
                  : "Submit Request"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
