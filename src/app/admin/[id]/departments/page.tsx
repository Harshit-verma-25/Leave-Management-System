"use client";

import { useState } from "react";
import { Edit2, Trash2, X } from "lucide-react";

type Department = {
  id: number;
  name: string;
};

export default function DepartmentPage() {
  const [departments, setDepartments] = useState<Department[]>([
    { id: 1, name: "Engineering" },
    { id: 2, name: "Marketing" },
  ]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setModalOpen] = useState(false);
  const [editingDepartmentId, setEditingDepartmentId] = useState<number | null>(
    null
  );
  const [departmentName, setDepartmentName] = useState("");

  const handleSave = () => {
    setLoading(true);
    if (editingDepartmentId !== null) {
      // Edit existing department
      setDepartments((prev) =>
        prev.map((dept) =>
          dept.id === editingDepartmentId
            ? { ...dept, name: departmentName }
            : dept
        )
      );
    } else {
      // Add new department
      const newDepartment: Department = {
        id: Math.max(...departments.map((d) => d.id), 0) + 1,
        name: departmentName,
      };
      setDepartments((prev) => [...prev, newDepartment]);
    }

    // Reset modal state
    setModalOpen(false);
    setDepartmentName("");
    setEditingDepartmentId(null);
    setLoading(false);
  };

  const openAddModal = () => {
    setModalOpen(true);
    setDepartmentName("");
    setEditingDepartmentId(null);
  };

  const openEditModal = (dept: Department) => {
    setModalOpen(true);
    setDepartmentName(dept.name);
    setEditingDepartmentId(dept.id);
  };

  const handleDelete = (id: number) => {
    setDepartments((prev) => prev.filter((dept) => dept.id !== id));
  };

  return (
    <>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingDepartmentId ? "Edit Department" : "Add Department"}
              </h2>

              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setModalOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <input
              type="text"
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              placeholder="Department Name"
              className="mt-4 w-full border p-2 rounded"
            />

            <button
              className="mt-4 rounded bg-green-500 px-4 py-2 text-white cursor-pointer"
              onClick={handleSave}
            >
              {editingDepartmentId
                ? loading
                  ? "Updating..."
                  : "Update"
                : loading
                ? "Adding..."
                : "Save"}
            </button>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[#f8f9fa] lg:p-6 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Department List</h1>
        </div>

        <div className="mb-6 flex items-center justify-end">
          <button
            className="rounded bg-black px-4 py-2 text-white cursor-pointer"
            onClick={openAddModal}
          >
            Add Department
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-2">Department Name</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-800">
              {departments.length > 0 ? (
                departments.map((department) => (
                  <tr key={department.id} className="border-t">
                    <td className="px-4 py-3">{department.name}</td>
                    <td className="px-4 py-3 flex gap-2 justify-center">
                      <button
                        className="rounded bg-blue-500 px-3 py-2 text-white cursor-pointer"
                        onClick={() => openEditModal(department)}
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>

                      <button
                        className="rounded bg-red-500 px-3 py-2 text-white cursor-pointer"
                        onClick={() => handleDelete(department.id)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={2} className="px-4 py-2 text-gray-500">
                    No departments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
