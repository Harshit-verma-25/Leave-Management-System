import { CheckCircle, Clock, XCircle, User } from "lucide-react";
import { ApprovalStatus } from "@/app/types/leaves";
import formatDate from "@/app/components/formatDate";

interface ApprovalTimelineProps {
  steps: ApprovalStatus[];
  currentStep: number;
}

export default function ApprovalTimeline({
  steps,
  currentStep,
}: ApprovalTimelineProps) {
  const getStepIcon = (status: string, isCurrentStep: boolean) => {
    if (status === "APPROVED") {
      return <CheckCircle className="w-6 h-6 text-green-600" />;
    } else if (status === "DISAPPROVED") {
      return <XCircle className="w-6 h-6 text-red-600" />;
    } else if (isCurrentStep) {
      return <Clock className="w-6 h-6 text-yellow-600 animate-pulse" />;
    } else {
      return <User className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStepColor = (status: string, isCurrentStep: boolean) => {
    if (status === "APPROVED") return "border-green-500 bg-green-50";
    if (status === "DISAPPROVED") return "border-red-500 bg-red-50";
    if (isCurrentStep) return "border-yellow-500 bg-yellow-50";
    return "border-gray-300 bg-gray-50";
  };

  return (
    <div className="mt-4 p-4 bg-white rounded-lg border">
      <h4 className="text-lg font-semibold mb-4 text-gray-900">
        Approval Timeline
      </h4>
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCurrentStep = index === currentStep;
          const isCompleted =
            step.status === "APPROVED" || step.status === "DISAPPROVED";

          return (
            <div key={step.id} className="flex items-start space-x-4">
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <div
                  className={`p-2 rounded-full border-2 ${getStepColor(
                    step.status,
                    isCurrentStep
                  )}`}
                >
                  {getStepIcon(step.status, isCurrentStep)}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-0.5 h-12 mt-2 ${
                      isCompleted ? "bg-green-300" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>

              {/* Step content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900">
                      {step.name}
                    </h5>
                    <p className="text-sm text-gray-500">{step.designation}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        step.status === "APPROVED"
                          ? "bg-green-100 text-green-800 border border-green-800"
                          : step.status === "DISAPPROVED"
                          ? "bg-red-100 text-red-800 border border-red-800"
                          : isCurrentStep
                          ? "bg-yellow-100 text-yellow-800 border border-yellow-800"
                          : "bg-gray-100 text-gray-800 border border-gray-800"
                      }`}
                    >
                      {step.status === "PENDING" && isCurrentStep
                        ? "In Review"
                        : step.status}
                    </span>
                    {step.approvedOn && (
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(step.approvedOn)}
                      </p>
                    )}
                  </div>
                </div>
                {step.comment && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                    <span className="font-medium">Comment: </span>
                    {step.comment}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
