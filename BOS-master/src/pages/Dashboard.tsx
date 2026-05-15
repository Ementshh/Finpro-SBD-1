import FundAllocationChart from "../components/dashboard/FundAllocationChart";
import FundUsageDonut from "../components/dashboard/FundUsageDonut";
import SchoolsTable from "../components/dashboard/SchoolsTable";
import { BarChart3, Filter, Download } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import React, { useState, useEffect } from "react";

const API_URL = 'http://localhost:5000/api';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    schoolLevel: "all",
    location: "all",
    fundRange: "all",
    usageRange: "all",
  });

  const [schoolsData, setSchoolsData] = useState<any[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const schoolsRes = await fetch(`${API_URL}/schools`);
        const schoolsJson = await schoolsRes.json();
        
        const mappedSchools = schoolsJson.map((s: any) => ({
          id: s.id.toString(),
          name: s.name,
          level: s.education_level || "Unknown",
          location: s.region || "Unknown",
          rating: parseFloat(s.average_rating) || 0,
          fundAllocation: parseFloat(s.fund_allocation) || 0,
          fundUsagePercentage: parseFloat(s.fund_usage_percentage) || 0,
        }));
        setSchoolsData(mappedSchools);

        const dashRes = await fetch(`${API_URL}/funds/dashboard`);
        const dashJson = await dashRes.json();
        setDashboardData(dashJson);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const allocationData = schoolsData.map((s: any) => ({
    name: s.name,
    allocated: s.fundAllocation,
    used: s.fundAllocation * (s.fundUsagePercentage / 100),
    remaining: s.fundAllocation - (s.fundAllocation * (s.fundUsagePercentage / 100))
  }));

  const usageData = dashboardData?.categories?.length > 0 
    ? dashboardData.categories.map((c: any, index: number) => ({
        name: c.category,
        value: parseFloat(c.amount),
        color: ['#0052CC', '#00B8D9', '#36B37E', '#FF8B00', '#6554C0'][index % 5]
      }))
    : [];

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const filteredSchools = schoolsData.filter((school) => {
    if (filters.schoolLevel !== "all" && school.level !== filters.schoolLevel)
      return false;
    if (filters.location !== "all" && school.location !== filters.location)
      return false;
    if (filters.fundRange !== "all") {
      const fund = school.fundAllocation;
      if (filters.fundRange === "low" && fund >= 400000000) return false;
      if (
        filters.fundRange === "medium" &&
        (fund < 400000000 || fund >= 500000000)
      )
        return false;
      if (filters.fundRange === "high" && fund < 500000000) return false;
    }
    if (filters.usageRange !== "all") {
      const usage = school.fundUsagePercentage;
      if (filters.usageRange === "low" && usage >= 75) return false;
      if (filters.usageRange === "medium" && (usage < 75 || usage >= 85))
        return false;
      if (filters.usageRange === "high" && usage < 85) return false;
    }
    return true;
  });

  if (isLoading) {
    return <div className="p-8 text-center bg-white rounded-lg mt-6">Loading dashboard data...</div>;
  }

  return (
    <div className="container mx-auto px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">BOS Fund Dashboard</h1>
        <p className="text-gray-600">
          Overview of School Operational Assistance Fund allocation and
          utilization
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between mb-6">
        <div className="flex space-x-2 mb-4 sm:mb-0">
          <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
            <BarChart3 className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">2023/2024 Academic Year</span>
          </div>
          <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full">
            <span className="text-sm font-medium">Updated: May 15, 2025</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="w-4 h-4 mr-1" />
            {showFilters ? "Hide Filters" : "Filters"}
          </button>
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <Download className="w-4 h-4 mr-1" />
            Export
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label
                htmlFor="schoolLevel"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                School Level
              </label>
              <select
                id="schoolLevel"
                name="schoolLevel"
                value={filters.schoolLevel}
                onChange={handleFilterChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="Elementary">Elementary</option>
                <option value="Junior High">Junior High</option>
                <option value="Senior High">Senior High</option>
                <option value="Vocational High">Vocational High</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Location
              </label>
              <select
                id="location"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All Locations</option>
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
              <label
                htmlFor="fundRange"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Fund Allocation
              </label>
              <select
                id="fundRange"
                name="fundRange"
                value={filters.fundRange}
                onChange={handleFilterChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All Ranges</option>
                <option value="low">&lt; 400M IDR</option>
                <option value="medium">400M - 500M IDR</option>
                <option value="high">&gt; 500M IDR</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="usageRange"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Fund Usage
              </label>
              <select
                id="usageRange"
                name="usageRange"
                value={filters.usageRange}
                onChange={handleFilterChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All Ranges</option>
                <option value="low">&lt; 75%</option>
                <option value="medium">75% - 85%</option>
                <option value="high">&gt; 85%</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() =>
                setFilters({
                  schoolLevel: "all",
                  location: "all",
                  fundRange: "all",
                  usageRange: "all",
                })
              }
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <FundAllocationChart 
          data={dashboardData?.summary ? [
            { 
              name: "Overall Allocation", 
              allocated: parseFloat(dashboardData.summary.total) || 500000000, 
              used: parseFloat(dashboardData.summary.used) || 400000000, 
              remaining: (parseFloat(dashboardData.summary.total) - parseFloat(dashboardData.summary.used)) || 100000000 
            }
          ] : allocationData} 
        />
        <FundUsageDonut data={usageData} />
      </div>

      <div className="mb-8">
        <SchoolsTable schools={filteredSchools} />
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Updates</h3>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All
          </button>
        </div>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4 py-1">
            <p className="text-sm text-gray-600">
              Fund disbursement for Quarter 2 completed
            </p>
            <p className="text-xs text-gray-400">May 10, 2025</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4 py-1">
            <p className="text-sm text-gray-600">
              New transparency guidelines published
            </p>
            <p className="text-xs text-gray-400">May 5, 2025</p>
          </div>
          <div className="border-l-4 border-orange-500 pl-4 py-1">
            <p className="text-sm text-gray-600">
              Annual audit for all schools scheduled for June
            </p>
            <p className="text-xs text-gray-400">April 28, 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
