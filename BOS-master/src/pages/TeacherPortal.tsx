import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { API_URL } from "../config/api";
import {
  School,
  DollarSign,
  PieChart,
  CheckCircle,
  AlertCircle,
  GraduationCap,
} from "lucide-react";

type Tab = "school" | "usage" | "allocation";

interface SchoolOption {
  id: string;
  name: string;
}

const TeacherPortal: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Tab>("school");
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [schoolForm, setSchoolForm] = useState({
    name: "",
    education_level: "",
    region: "",
    principal: "",
    total_students: "",
    address: "",
  });

  const [usageForm, setUsageForm] = useState({
    school_id: "",
    category: "",
    amount: "",
    description: "",
    date: "",
  });

  const [allocationForm, setAllocationForm] = useState({
    school_id: "",
    amount: "",
    quarter: "",
    year: new Date().getFullYear().toString(),
    notes: "",
  });

  useEffect(() => {
    if (user?.role !== "teacher") {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await fetch(`${API_URL}/schools`);
        const data = await res.json();
        setSchools(
          data.map((s: any) => ({ id: s.id.toString(), name: s.name })),
        );
      } catch {
        setSchools([]);
      }
    };
    fetchSchools();
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setErrorMsg("");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setSuccessMsg("");
  };

  const handleSchoolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolForm.name || !schoolForm.education_level || !schoolForm.region) {
      showError("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/schools`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...schoolForm,
          total_students: schoolForm.total_students
            ? parseInt(schoolForm.total_students)
            : undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to register school");
      }
      const created = await res.json();
      setSchools((prev) => [
        ...prev,
        { id: created.id?.toString(), name: created.name },
      ]);
      setSchoolForm({
        name: "",
        education_level: "",
        region: "",
        principal: "",
        total_students: "",
        address: "",
      });
      showSuccess("School registered successfully!");
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to register school",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUsageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !usageForm.school_id ||
      !usageForm.category ||
      !usageForm.amount ||
      !usageForm.date
    ) {
      showError("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/funds/usage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...usageForm,
          amount: parseFloat(usageForm.amount),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to record fund usage");
      }
      setUsageForm({
        school_id: "",
        category: "",
        amount: "",
        description: "",
        date: "",
      });
      showSuccess("Fund usage recorded successfully!");
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to record fund usage",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAllocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !allocationForm.school_id ||
      !allocationForm.amount ||
      !allocationForm.quarter ||
      !allocationForm.year
    ) {
      showError("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/funds/allocation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...allocationForm,
          amount: parseFloat(allocationForm.amount),
          year: parseInt(allocationForm.year),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to record fund allocation");
      }
      setAllocationForm({
        school_id: "",
        amount: "",
        quarter: "",
        year: new Date().getFullYear().toString(),
        notes: "",
      });
      showSuccess("Fund allocation recorded successfully!");
    } catch (err) {
      showError(
        err instanceof Error ? err.message : "Failed to record fund allocation",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "school", label: "Register School", icon: School },
    { key: "usage", label: "Record Fund Usage", icon: DollarSign },
    { key: "allocation", label: "Fund Allocation", icon: PieChart },
  ];

  const inputClass =
    "w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const requiredMark = <span className="text-red-500 ml-0.5">*</span>;

  return (
    <div className="container mx-auto px-4">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-1">
          <div className="bg-blue-100 rounded-full p-2">
            <GraduationCap className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Portal</h1>
        </div>
        <p className="text-gray-600 ml-14">
          Manage school data, fund usage, and allocation records
        </p>
      </div>

      {successMsg && (
        <div className="mb-6 flex items-start p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="ml-3 text-sm text-green-800 font-medium">
            {successMsg}
          </p>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 flex items-start p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="ml-3 text-sm text-red-800 font-medium">{errorMsg}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setSuccessMsg("");
                    setErrorMsg("");
                  }}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-150 ${
                    isActive
                      ? "border-blue-600 text-blue-700 bg-blue-50"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 mr-2 ${isActive ? "text-blue-600" : "text-gray-400"}`}
                  />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "school" && (
            <form onSubmit={handleSchoolSubmit} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  Register New School
                </h2>
                <p className="text-sm text-gray-500">
                  Add a school to the BOS monitoring system.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className={labelClass}>
                    School Name {requiredMark}
                  </label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="e.g. SMA Negeri 1 Jakarta"
                    value={schoolForm.name}
                    onChange={(e) =>
                      setSchoolForm({ ...schoolForm, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Education Level {requiredMark}
                  </label>
                  <select
                    className={inputClass}
                    value={schoolForm.education_level}
                    onChange={(e) =>
                      setSchoolForm({
                        ...schoolForm,
                        education_level: e.target.value,
                      })
                    }
                  >
                    <option value="">Select level</option>
                    <option value="Elementary">Elementary</option>
                    <option value="Junior High">Junior High</option>
                    <option value="Senior High">Senior High</option>
                    <option value="Vocational High">Vocational High</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Region / City {requiredMark}
                  </label>
                  <select
                    className={inputClass}
                    value={schoolForm.region}
                    onChange={(e) =>
                      setSchoolForm({ ...schoolForm, region: e.target.value })
                    }
                  >
                    <option value="">Select region</option>
                    <option value="Jakarta Pusat">Jakarta Pusat</option>
                    <option value="Surabaya">Surabaya</option>
                    <option value="Bandung">Bandung</option>
                    <option value="Semarang">Semarang</option>
                    <option value="Yogyakarta">Yogyakarta</option>
                    <option value="Medan">Medan</option>
                    <option value="Makassar">Makassar</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Principal Name</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="e.g. Dr. Budi Santoso"
                    value={schoolForm.principal}
                    onChange={(e) =>
                      setSchoolForm({
                        ...schoolForm,
                        principal: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>Total Students</label>
                  <input
                    type="number"
                    min="0"
                    className={inputClass}
                    placeholder="e.g. 800"
                    value={schoolForm.total_students}
                    onChange={(e) =>
                      setSchoolForm({
                        ...schoolForm,
                        total_students: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>Address</label>
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="e.g. Jl. Sudirman No. 12, Jakarta"
                    value={schoolForm.address}
                    onChange={(e) =>
                      setSchoolForm({ ...schoolForm, address: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setSchoolForm({
                      name: "",
                      education_level: "",
                      region: "",
                      principal: "",
                      total_students: "",
                      address: "",
                    })
                  }
                  className="mr-3 px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving..." : "Register School"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "usage" && (
            <form onSubmit={handleUsageSubmit} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  Record Fund Usage
                </h2>
                <p className="text-sm text-gray-500">
                  Log actual BOS fund expenditure for a school.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className={labelClass}>School {requiredMark}</label>
                  <select
                    className={inputClass}
                    value={usageForm.school_id}
                    onChange={(e) =>
                      setUsageForm({ ...usageForm, school_id: e.target.value })
                    }
                  >
                    <option value="">Select school</option>
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Category {requiredMark}</label>
                  <select
                    className={inputClass}
                    value={usageForm.category}
                    onChange={(e) =>
                      setUsageForm({ ...usageForm, category: e.target.value })
                    }
                  >
                    <option value="">Select category</option>
                    <option value="Teacher Salaries">Teacher Salaries</option>
                    <option value="Teaching Materials">
                      Teaching Materials
                    </option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Student Activities">
                      Student Activities
                    </option>
                    <option value="Administrative">Administrative</option>
                    <option value="Technology">Technology</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Amount (IDR) {requiredMark}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    className={inputClass}
                    placeholder="e.g. 15000000"
                    value={usageForm.amount}
                    onChange={(e) =>
                      setUsageForm({ ...usageForm, amount: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className={labelClass}>Date {requiredMark}</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={usageForm.date}
                    onChange={(e) =>
                      setUsageForm({ ...usageForm, date: e.target.value })
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>Description</label>
                  <textarea
                    rows={3}
                    className={inputClass}
                    placeholder="Provide a brief description of how the funds were used..."
                    value={usageForm.description}
                    onChange={(e) =>
                      setUsageForm({
                        ...usageForm,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {usageForm.amount && (
                <div className="bg-blue-50 border border-blue-100 rounded-md px-4 py-3 flex items-center justify-between">
                  <span className="text-sm text-blue-700 font-medium">
                    Amount Preview
                  </span>
                  <span className="text-sm font-semibold text-blue-900">
                    Rp{" "}
                    {parseFloat(usageForm.amount || "0").toLocaleString(
                      "id-ID",
                    )}
                  </span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setUsageForm({
                      school_id: "",
                      category: "",
                      amount: "",
                      description: "",
                      date: "",
                    })
                  }
                  className="mr-3 px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving..." : "Record Usage"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "allocation" && (
            <form onSubmit={handleAllocationSubmit} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  Record Fund Allocation
                </h2>
                <p className="text-sm text-gray-500">
                  Enter the BOS fund allocation for a school by quarter.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className={labelClass}>School {requiredMark}</label>
                  <select
                    className={inputClass}
                    value={allocationForm.school_id}
                    onChange={(e) =>
                      setAllocationForm({
                        ...allocationForm,
                        school_id: e.target.value,
                      })
                    }
                  >
                    <option value="">Select school</option>
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Quarter {requiredMark}</label>
                  <select
                    className={inputClass}
                    value={allocationForm.quarter}
                    onChange={(e) =>
                      setAllocationForm({
                        ...allocationForm,
                        quarter: e.target.value,
                      })
                    }
                  >
                    <option value="">Select quarter</option>
                    <option value="Q1">Q1 (January – March)</option>
                    <option value="Q2">Q2 (April – June)</option>
                    <option value="Q3">Q3 (July – September)</option>
                    <option value="Q4">Q4 (October – December)</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Year {requiredMark}</label>
                  <input
                    type="number"
                    min="2020"
                    max="2099"
                    className={inputClass}
                    value={allocationForm.year}
                    onChange={(e) =>
                      setAllocationForm({
                        ...allocationForm,
                        year: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>
                    Allocated Amount (IDR) {requiredMark}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    className={inputClass}
                    placeholder="e.g. 150000000"
                    value={allocationForm.amount}
                    onChange={(e) =>
                      setAllocationForm({
                        ...allocationForm,
                        amount: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>Notes</label>
                  <textarea
                    rows={3}
                    className={inputClass}
                    placeholder="Optional notes about this allocation..."
                    value={allocationForm.notes}
                    onChange={(e) =>
                      setAllocationForm({
                        ...allocationForm,
                        notes: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {allocationForm.amount &&
                allocationForm.quarter &&
                allocationForm.year && (
                  <div className="bg-blue-50 border border-blue-100 rounded-md px-4 py-3">
                    <p className="text-sm text-blue-700 font-medium mb-1">
                      Allocation Summary
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-600">
                        {allocationForm.quarter} {allocationForm.year}
                      </span>
                      <span className="text-sm font-semibold text-blue-900">
                        Rp{" "}
                        {parseFloat(
                          allocationForm.amount || "0",
                        ).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setAllocationForm({
                      school_id: "",
                      amount: "",
                      quarter: "",
                      year: new Date().getFullYear().toString(),
                      notes: "",
                    })
                  }
                  className="mr-3 px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Saving..." : "Save Allocation"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherPortal;
