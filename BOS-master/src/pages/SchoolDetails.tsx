import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Download, Star, School } from "lucide-react";
import { API_URL } from "../config/api";

const SchoolDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [school, setSchool] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchSchool = async () => {
      setIsLoading(true);
      setNotFound(false);
      try {
        const res = await fetch(`${API_URL}/schools/${id}`);
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        const data = await res.json();
        setSchool(data);
      } catch {
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchool();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
          Loading school data...
        </div>
      </div>
    );
  }

  if (notFound || !school) {
    return (
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <School className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-medium">School not found.</p>
          <Link
            to="/"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const fundAllocation = parseFloat(school.fund_allocation) || 0;
  const fundUsagePercentage = parseFloat(school.fund_usage_percentage) || 0;
  const averageRating = parseFloat(school.average_rating) || 0;
  const totalStudents = school.total_students || 0;
  const fundPerStudent = totalStudents > 0 ? fundAllocation / totalStudents : 0;

  const totalCategoryAmount =
    school.fundCategories?.reduce(
      (sum: number, c: any) => sum + parseFloat(c.amount),
      0,
    ) || 0;

  return (
    <div className="container mx-auto px-4">
      <div className="relative mb-6 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="h-48 bg-gray-200 flex items-center justify-center">
          <School className="h-20 w-20 text-gray-300" />
        </div>

        <div className="relative -mt-16 px-6 pb-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <School className="h-10 w-10 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {school.name}
                  </h1>
                  <p className="text-gray-600">
                    {school.education_level || "Unknown Level"} •{" "}
                    {school.region || "Unknown Region"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex items-center bg-yellow-100 px-3 py-1 rounded-full">
                  <Star className="h-5 w-5 text-yellow-500 fill-current mr-1" />
                  <span className="font-medium">
                    {averageRating.toFixed(1)}
                  </span>
                </div>
                <Link
                  to={`/review/${school.id}`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Write a Review
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-xs text-gray-500 mb-1">Total BOS Fund</p>
                <p className="text-lg font-bold text-gray-900">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    maximumFractionDigits: 0,
                  }).format(fundAllocation)}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-xs text-gray-500 mb-1">Fund per Student</p>
                <p className="text-lg font-bold text-gray-900">
                  {totalStudents > 0
                    ? new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        maximumFractionDigits: 0,
                      }).format(fundPerStudent)
                    : "—"}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-xs text-gray-500 mb-1">Total Students</p>
                <p className="text-lg font-bold text-gray-900">
                  {totalStudents > 0 ? totalStudents.toLocaleString() : "—"}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-xs text-gray-500 mb-1">Fund Usage</p>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                    <div
                      className={`h-2.5 rounded-full ${
                        fundUsagePercentage >= 90
                          ? "bg-red-500"
                          : fundUsagePercentage >= 70
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                      style={{
                        width: `${Math.min(fundUsagePercentage, 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {fundUsagePercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                BOS Fund Allocation
              </h2>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                <Download className="h-4 w-4 mr-1" />
                Download Report
              </button>
            </div>

            {school.fundCategories?.length > 0 ? (
              <div className="space-y-4">
                {school.fundCategories.map((category: any) => {
                  const amount = parseFloat(category.amount);
                  const percentage =
                    totalCategoryAmount > 0
                      ? Math.round((amount / totalCategoryAmount) * 100)
                      : 0;
                  return (
                    <div key={category.category}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {category.category}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            maximumFractionDigits: 0,
                          }).format(amount)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full bg-blue-600"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {percentage}% of total usage
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">
                No fund usage data available.
              </p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Historical Fund Usage
              </h2>
            </div>

            {school.fundHistory?.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {school.fundHistory.slice(-4).map((entry: any) => {
                  const allocated = parseFloat(entry.allocated);
                  const used = parseFloat(entry.used);
                  const pct = allocated > 0 ? used / allocated : 0;
                  return (
                    <div key={entry.year} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-medium text-gray-900">
                          {entry.year}
                        </p>
                        <div
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            pct > 0.95
                              ? "bg-red-100 text-red-800"
                              : pct > 0.8
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                          }`}
                        >
                          {Math.round(pct * 100)}%
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">Allocated</p>
                      <p className="font-bold text-gray-800">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          notation: "compact",
                          compactDisplay: "short",
                        }).format(allocated)}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">Used</p>
                      <p className="font-bold text-gray-800">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          notation: "compact",
                          compactDisplay: "short",
                        }).format(used)}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-6">
                No allocation history available.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              School Information
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">NPSN</p>
                <p className="font-medium">{school.npsn || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Education Level</p>
                <p className="font-medium">{school.education_level || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Region</p>
                <p className="font-medium">{school.region || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="font-medium">
                  {totalStudents > 0 ? totalStudents.toLocaleString() : "—"}
                </p>
              </div>
              {school.accreditation && (
                <div>
                  <p className="text-sm text-gray-500">Accreditation</p>
                  <p className="font-medium">{school.accreditation}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Recent Reviews
              </h2>
              <Link
                to={`/review/${school.id}`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Write a Review
              </Link>
            </div>

            {school.recentReviews?.length > 0 ? (
              <div className="space-y-4">
                {school.recentReviews.map((review: any) => (
                  <div key={review.id} className="border-b pb-4 last:border-0">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(review.score)
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          {Number(review.score).toFixed(1)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(review.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">
                      By{" "}
                      {review.author_name || review.author_role || "Anonymous"}
                    </p>
                    {review.comments && (
                      <p className="text-sm">{review.comments}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">
                No reviews yet. Be the first!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolDetails;
