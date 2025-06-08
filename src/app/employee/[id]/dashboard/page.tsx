"use client";

// import {
//   Badge,
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/app/components/card";
// import Link from "next/link";
// import data from "@/app/data.json";
// import { useParams } from "next/navigation";

const DashboardPage = () => {
  // const { id } = useParams() as { id: string };
  // const colors = [
  //   "#8742f5",
  //   "#f542e0",
  //   "#f5a742",
  //   "#4287f5",
  //   "#42f5c8",
  //   "#f5e142",
  // ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] lg:p-6 p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Employee Dashboard</h1>
      </div>

      <p>Under Developement</p>

      {/* <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {[
          "Total Leaves",
          "Pending Leaves",
          "Approved Leaves",
          "Rejected Leaves",
        ].map((type, i) => {
          const used = i * 2 + 2;
          const total = i * 2 + 4;
          const percentage = (used / total) * 100;

          return (
            <Card key={type} className="pt-6">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div
                  className="mb-4 h-24 w-24 rounded-full flex items-center justify-center"
                  style={{
                    background: `conic-gradient(${colors[i]} ${percentage}%, #e5e7eb ${percentage}% 100%)`,
                  }}
                >
                  <div className="h-20 w-20 bg-white rounded-full flex flex-col items-center justify-center">
                    <div className="text-xs text-gray-400">Available</div>
                    <div className="text-xl font-bold">
                      {used}/{total}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-bold uppercase text-gray-700">
                  {type}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Leave History</CardTitle>

              <Link href={`/employee/${id}/leaves`} className="text-sm">
                <button className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
                  View All
                </button>
              </Link>
            </div>
          </CardHeader>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="text-gray-600">
                <tr>
                  {["Type", "No. of Days", "Status"].map((header) => (
                    <th
                      key={header}
                      className={`px-4 py-2 ${
                        header !== "Type" ? "text-center" : "text-left"
                      } uppercase text-gray-600`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-gray-800 text-center">
                {data.slice(0, 5).map((leave) => (
                  <tr key={leave.id} className="border-t">
                    <td className="p-4 text-left">{leave.leave}</td>
                    <td className="p-4">{leave.days}</td>
                    <td className="p-4">
                      <Badge
                        className={`${
                          leave.status === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : leave.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {leave.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Public Holidays</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            {[
              ["Republic Day", "26th Jan, Thu"],
              ["Holi", "8th Mar, Wed"],
              ["Ram Navami", "30th Mar, Thu"],
              ["Good Friday", "7th Apr, Fri"],
            ].map(([name, date]) => (
              <div
                key={name}
                className="flex items-center justify-between rounded bg-gray-100 px-3 py-2 text-sm"
              >
                <div>{name}</div>
                <div className="text-gray-500">{date}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
};

export default DashboardPage;
