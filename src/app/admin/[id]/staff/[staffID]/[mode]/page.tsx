"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Link from "next/link";
import { SingleStaffData, StaffData } from "@/app/types/user";
import { getStaffID } from "@/app/actions/staff/getStaffID";
import { SignUp } from "@/app/actions/auth/signup";
import { getSingleStaff } from "@/app/actions/staff/getSingleStaff";
import Image from "next/image";
import { X } from "lucide-react";
import { uploadImage } from "@/app/actions/image/uploadImage";
import { updateStaff } from "@/app/actions/staff/updateStaff";
import { getAllStaff } from "@/app/actions/staff/getAllStaff";

type StaffMode = "create" | "edit" | "view";
interface StaffPageProps extends SingleStaffData {
  [key: string]: any;
}

export default function SingleStaffPage() {
  const {
    id: adminID,
    mode,
    staffID,
  } = useParams() as { id: string; mode: StaffMode; staffID: string };
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const [ID, setID] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [data, setData] = useState<StaffPageProps>({
    profile: null,
    firstName: "",
    lastName: "",
    phoneNo: "",
    designation: "",
    gender: "",
    role: "",
    assignedUnder: "",
    reportingAuthority: [],
  });
  const [managerList, setManagerList] = useState<
    { id: string; name: string; designation: string }[] | null
  >(null);
  const [adminList, setAdminList] = useState<
    { id: string; name: string; designation: string }[] | null
  >(null);

  useEffect(() => {
    const fetchLastID = async () => {
      const result = await getStaffID();
      setID(result);
    };

    const getManagerList = async () => {
      const response = await getAllStaff();
      if (response.status === 200) {
        const staffData = response.data as StaffData[];
        const managers = staffData
          .filter((staff) => staff.role === "manager")
          .map((staff) => ({
            name: `${staff.firstName} ${staff.lastName}`,
            id: staff.id,
            designation: staff.designation,
          }));

        const admins = staffData
          .filter((staff) => staff.role === "admin")
          .map((staff) => ({
            name: `${staff.firstName} ${staff.lastName}`,
            id: staff.id,
            designation: staff.designation,
          }));

        setManagerList(managers);
        setAdminList(admins);
      } else {
        console.error("Error fetching staff data:", response.message);
      }
    };

    fetchLastID();
    getManagerList();
  }, [mode]);

  useEffect(() => {
    if (mode !== "create") {
      const fetchStaffData = async () => {
        try {
          const response = await getSingleStaff(staffID);
          if (response.status === 200 && response.data) {
            setData(response.data);
            setID(response.data.staffID);
          } else {
            console.error("Error fetching staff data:", response.error);
          }
        } catch (error) {
          console.error("Error fetching staff data:", error);
        }
      };

      fetchStaffData();
    }
  }, [mode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    const maxSize = 1 * 1024 * 1024; // 1 MB

    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload JPG, JPEG, or PNG.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > maxSize) {
      toast.error("File size exceeds 1 MB. Please upload a smaller file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setData((prev) => ({
      ...prev,
      profile: file,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "role") {
      setData((prev) => ({
        ...prev,
        [name]: value,
        assignedUnder: "", // Reset assigned under when role changes
        reportingAuthority: [], // Reset reporting authority when assigned under changes
      }));
      return;
    }

    if (name === "assignedUnder") {
      setData((prev) => ({
        ...prev,
        [name]: value,
        reportingAuthority: [
          {
            id: value,
            name:
              managerList?.find((m) => m.id === value)?.name ||
              adminList?.find((a) => a.id === value)?.name ||
              "",
            designation:
              managerList?.find((m) => m.id === value)?.designation ||
              adminList?.find((a) => a.id === value)?.designation ||
              "",
          },
        ],
      }));
      return;
    }

    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  function toBase64(file: File): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate basic auth fields

    if (mode === "create" && (!email || !password || !confirmPassword)) {
      toast.error("Please fill in email and password fields.");
      setLoading(false);
      return;
    }

    // Validate required user fields
    const requiredFields = [
      { name: "firstName", label: "First Name" },
      { name: "lastName", label: "Last Name" },
      { name: "phoneNo", label: "Phone Number" },
      { name: "designation", label: "Designation" },
      { name: "gender", label: "Gender" },
      { name: "role", label: "Role" },
    ];

    // Conditionally require assignedUnder if role is employee
    if (data.role === "employee") {
      requiredFields.push({ name: "assignedUnder", label: "Assigned Under" });
    }

    const missingFields = requiredFields.filter((field) => !data[field.name]);
    if (missingFields.length > 0) {
      const missingNames = missingFields.map((f) => f.label).join(", ");
      toast.error(`Please fill in: ${missingNames}`);
      setLoading(false);
      return;
    }

    if (mode === "create" && password !== confirmPassword) {
      toast.error("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      let url: string | null = null;

      // Upload image if it exists
      if (data.profile && typeof data.profile !== "string") {
        const base64 = await toBase64(data.profile);
        if (typeof base64 === "string") {
          const response = await uploadImage(base64, ID, "profiles");
          url = response;
        }
      }

      const profileUrl = url || data.profile;

      // Edit or Create
      if (mode === "edit") {
        const response = await updateStaff(staffID, {
          ...(data as StaffData),
          profile: profileUrl,
        });

        if (response.status === 200) {
          toast.success("User updated successfully");
          router.push(`/admin/${adminID}/staff`);
        } else {
          setError(response.message);
        }
      } else if (mode === "create") {
        const response = await SignUp(
          email,
          password,
          {
            ...data,
            profile: profileUrl,
          },
          ID
        );

        if (response.status === 200) {
          toast.success("User created successfully");
          router.push(`/admin/${adminID}/staff`);
        } else {
          setError(response.message);
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] md:p-6 p-3">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {mode === "create"
            ? "New Staff"
            : mode === "edit"
            ? "Edit Staff"
            : "View Staff"}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid md:grid-cols-2 grid-cols-1 gap-4 mt-6"
      >
        <div className="flex flex-col gap-4 text-gray-500 bg-white p-4 shadow-md rounded">
          <h3 className="text-lg font-bold uppercase">Personal Details</h3>

          <div className="flex flex-col gap-1">
            <label htmlFor="profile" className="w-full font-semibold">
              Profile Picture: <span className="text-red-500">*</span>
            </label>

            {/* View Mode - Show button to open profile in new tab */}
            {mode === "view" &&
              data.profile &&
              typeof data.profile === "string" && (
                <div className="flex items-center gap-4">
                  <Image
                    width={9999}
                    height={9999}
                    src={data.profile}
                    alt="Profile"
                    className="h-24 w-24 object-cover rounded"
                  />
                  <a
                    href={data.profile}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <button
                      className="bg-blue-500 text-white text-sm px-3 py-1 w-fit rounded cursor-pointer"
                      type="button"
                    >
                      View Profile
                    </button>
                  </a>
                </div>
              )}

            {/* Edit Mode - Show image with remove button */}
            {mode === "edit" &&
              data.profile &&
              typeof data.profile === "string" && (
                <div className="flex flex-col gap-2">
                  <div className="relative h-24 w-24">
                    <Image
                      width={96}
                      height={96}
                      src={data.profile}
                      alt="Profile Preview"
                      className="h-full w-full object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setData((prev) => ({ ...prev, profile: null }));
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-md cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

            {/* Show input if mode is create OR profile has been removed in edit */}
            {(mode === "create" || mode === "edit") &&
              typeof data.profile !== "string" && (
                <input
                  type="file"
                  id="profile"
                  className={`${
                    mode === ("view" as StaffMode)
                      ? "w-full border bg-gray-400 text-white placeholder:text-white p-2 rounded cursor-not-allowed"
                      : "w-full border p-2 rounded"
                  }`}
                  accept=".png, .jpg, .jpeg"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
              )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="firstName" className="w-full font-semibold">
              First Name: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={data.firstName}
              className={`${
                mode === ("view" as StaffMode)
                  ? "w-full border bg-gray-400 text-white placeholder:text-white p-2 rounded cursor-not-allowed"
                  : "w-full border p-2 rounded"
              }`}
              placeholder="Enter first name"
              onChange={handleChange}
              readOnly={mode === "view"}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="lastName" className="w-full font-semibold">
              Last Name: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={data.lastName}
              onChange={handleChange}
              className={`${
                mode === ("view" as StaffMode)
                  ? "w-full border bg-gray-400 text-white placeholder:text-white p-2 rounded cursor-not-allowed"
                  : "w-full border p-2 rounded"
              }`}
              placeholder="Enter last name"
              readOnly={mode === "view"}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="phoneNo" className="w-full font-semibold">
              Phone Number: <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phoneNo"
              name="phoneNo"
              value={data.phoneNo}
              onChange={handleChange}
              className={`${
                mode === ("view" as StaffMode)
                  ? "w-full border bg-gray-400 text-white placeholder:text-white p-2 rounded cursor-not-allowed"
                  : "w-full border p-2 rounded"
              }`}
              placeholder="Enter phone number"
              readOnly={mode === "view"}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="designation" className="w-full font-semibold">
              Designation: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="designation"
              name="designation"
              value={data.designation}
              onChange={handleChange}
              className={`${
                mode === ("view" as StaffMode)
                  ? "w-full border bg-gray-400 text-white placeholder:text-white p-2 rounded cursor-not-allowed"
                  : "w-full border p-2 rounded"
              }`}
              placeholder="Enter Designation"
              readOnly={mode === "view"}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="gender" className="w-full font-semibold">
              Gender: <span className="text-red-500">*</span>
            </label>

            <div className="flex gap-4">
              {["male", "female", "other"].map((g) => (
                <div className="flex items-center gap-2" key={g}>
                  <input
                    id={`gender-${g}`}
                    name="gender"
                    type="radio"
                    value={g}
                    onChange={handleChange}
                    checked={data.gender === g}
                    disabled={mode === "view"}
                  />
                  <label htmlFor={`gender-${g}`}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 bg-white shadow-md rounded">
          <div className="flex flex-col gap-4 text-gray-500 p-4 pb-0">
            <h3 className="text-lg font-bold uppercase">Company Details</h3>

            <div className="flex flex-col gap-1">
              <label htmlFor="staffId" className="w-full font-semibold">
                Staff ID: <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="staffId"
                value={ID}
                className="w-full border bg-gray-400 text-white placeholder:text-white p-2 rounded cursor-not-allowed"
                placeholder="Enter staff ID"
                disabled
                readOnly
              />
            </div>

            {mode === "create" && (
              <>
                <div className="flex flex-col gap-1">
                  <label htmlFor="email" className="w-full font-semibold">
                    Email:
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border p-2 rounded"
                    placeholder="Enter staff email"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="password" className="w-full font-semibold">
                    Password: <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border p-2 rounded"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center p-3 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="confirmPassword"
                    className="w-full font-semibold"
                  >
                    Confirm Password: <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full border p-2 rounded"
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 flex items-center p-3 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="flex flex-col gap-1">
              <label htmlFor="role" className="w-full font-semibold">
                Role Type: <span className="text-red-500">*</span>
              </label>

              <div className="flex gap-4">
                {["Employee", "Manager", "Admin"].map((role) => {
                  const value = role.toLowerCase();
                  const isDisabled = mode === "view";

                  return (
                    <div className="flex items-center gap-2" key={role}>
                      <input
                        id={`role-${value}`}
                        name="role"
                        type="radio"
                        value={value}
                        onChange={handleChange}
                        checked={data.role === value}
                        disabled={isDisabled}
                      />
                      <label
                        htmlFor={`role-${value}`}
                        className={isDisabled ? "text-gray-500" : ""}
                      >
                        {role}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            {data.role === "employee" && (
              <div className="flex flex-col gap-1">
                <label className="w-full font-semibold" htmlFor="assignedUnder">
                  Assigned Under: <span className="text-red-500">*</span>
                </label>

                {mode !== "view" && (
                  <select
                    id="assignedUnder"
                    name="assignedUnder"
                    value={data.assignedUnder || ""}
                    onChange={handleChange}
                    className="w-full border p-2 rounded"
                  >
                    <option value="" title="Not Selected" disabled>
                      Not Selected
                    </option>
                    {managerList &&
                      managerList.map((m) => (
                        <option key={m.id} value={m.id} title={m.id}>
                          {m.name} | {m.designation}
                        </option>
                      ))}
                  </select>
                )}

                {mode === "view" && (
                  <input
                    type="text"
                    id="assignedUnder"
                    name="assignedUnder"
                    value={
                      managerList &&
                      managerList.find((m) => m.id === data.assignedUnder)
                        ? `${
                            managerList.find((m) => m.id === data.assignedUnder)
                              ?.name
                          } | ${
                            managerList.find((m) => m.id === data.assignedUnder)
                              ?.designation
                          }`
                        : ""
                    }
                    className="w-full border bg-gray-400 text-white placeholder:text-white p-2 rounded cursor-not-allowed"
                    placeholder="Assigned Under"
                    readOnly
                  />
                )}
              </div>
            )}

            {data.role !== "admin" && data.role !== "" && (
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="reportingAuthority"
                  className="w-full font-semibold"
                >
                  Reporting Authority (Ordered List):
                  <span className="text-red-500">*</span>
                </label>

                {mode !== "view" && (
                  <>
                    <div className="flex gap-2 mb-2">
                      <select
                        id="reportingAuthoritySelect"
                        className="w-full border p-2 rounded"
                        value=""
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          if (
                            selectedId &&
                            !data.reportingAuthority.some(
                              (authority) =>
                                (typeof authority === "string"
                                  ? authority
                                  : authority.id) === selectedId
                            )
                          ) {
                            const authorities =
                              managerList &&
                              adminList &&
                              [...managerList, ...adminList].find(
                                (authority) => authority.id === selectedId
                              );
                            if (authorities) {
                              setData((prev) => ({
                                ...prev,
                                reportingAuthority: [
                                  ...prev.reportingAuthority,
                                  {
                                    id: authorities.id,
                                    name: authorities.name,
                                    designation: authorities.designation,
                                  },
                                ],
                              }));
                            }
                          }
                        }}
                      >
                        <option value="" disabled>
                          Select Authority/Authorities to Add
                        </option>
                        {managerList &&
                          adminList &&
                          [...managerList, ...adminList]
                            .filter(
                              (authority) =>
                                !data.reportingAuthority.some(
                                  (a) =>
                                    (typeof a === "string" ? a : a.id) ===
                                    authority.id
                                )
                            )
                            .map((authority) => (
                              <option key={authority.id} value={authority.id}>
                                {authority.name} | {authority.designation}
                              </option>
                            ))}
                      </select>
                    </div>

                    {data.reportingAuthority.length > 0 && (
                      <ol className="list-decimal list-inside space-y-1">
                        {data.reportingAuthority.map((report, index) => {
                          const authorities =
                            managerList &&
                            adminList &&
                            [...managerList, ...adminList].find(
                              (authority) => authority.id === report.id
                            );
                          return (
                            <li
                              key={report.id}
                              className="flex justify-between items-center"
                            >
                              <span>
                                {index + 1}. {authorities && authorities.name}
                              </span>
                              <button
                                type="button"
                                className="text-red-500 hover:text-red-700 text-sm"
                                onClick={() =>
                                  setData((prev) => ({
                                    ...prev,
                                    reportingAuthority:
                                      prev.reportingAuthority.filter(
                                        (a) =>
                                          (typeof a === "string" ? a : a.id) !==
                                          report.id
                                      ),
                                  }))
                                }
                              >
                                Remove
                              </button>
                            </li>
                          );
                        })}
                      </ol>
                    )}
                  </>
                )}

                {mode === "view" && (
                  <ol className="list-decimal pl-5 space-y-1 text-gray-600">
                    {data.reportingAuthority.map((id) => {
                      const authorities =
                        managerList &&
                        adminList &&
                        [...managerList, ...adminList].find((authority) =>
                          authority.id === id.id ? authority : null
                        );
                      return (
                        <li key={id.id}>{authorities?.name || "Unknown"}</li>
                      );
                    })}
                  </ol>
                )}
              </div>
            )}
            {error && (
              <span className="text-red-500 text-sm mt-2">{error}</span>
            )}
          </div>

          <div className="flex items-center justify-center gap-4 p-4">
            <Link href={`/admin/${staffID}/staff`} className="w-full">
              <button className="mx-auto w-full bg-red-500 text-white py-2 rounded cursor-pointer">
                Cancel
              </button>
            </Link>

            {mode === "create" && (
              <button
                className={`${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                } text-white w-full font-semibold px-6 py-2 rounded-md cursor-pointer`}
                type="submit"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create"}
              </button>
            )}

            {mode === "edit" && (
              <button
                className="w-full bg-green-500 text-white py-2 rounded cursor-pointer"
                type="submit"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update"}
              </button>
            )}

            {mode === "view" && (
              <button
                className="w-full bg-blue-500 text-white py-2 rounded cursor-pointer"
                onClick={() => {
                  router.push(`/admin/${adminID}/staff/${staffID}/edit`);
                }}
                type="button"
              >
                Update
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
