"use client";
import LeaveApproval from "@/app/components/leave-approval";
import { useParams } from "next/navigation";

export default function LeaveApprovalPage() {
  const { id } = useParams() as { id: string };
  return <LeaveApproval id={id} />;
}
