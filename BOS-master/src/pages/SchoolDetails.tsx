import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, Star, School } from 'lucide-react';

const SchoolDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // Mock data 
  const school = {
    id,
    name: 'SMA Negeri 2 Bandung',
    level: 'Senior High School',
    location: 'Jl. Cihampelas No. 173, Bandung',
    rating: 4.8,
    fundAllocation: 580000000,
    fundUsagePercentage: 72,
    transparencyScore: 92,
    fundEfficiency: 88,
    parentSatisfaction: 91,
    principal: 'Dr. Siti Rahayu',
    totalStudents: 1250,
    totalClasses: 36,
    fundPerStudent: 464000,
    image: 'https://images.pexels.com/photos/256395/pexels-photo-256395.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    fundCategories: [
      { name: 'Teacher Salaries', percentage: 45, amount: 261000000 },
      { name: 'Teaching Materials', percentage: 20, amount: 116000000 },
      { name: 'Infrastructure', percentage: 15, amount: 87000000 },
      { name: 'Student Activities', percentage: 12, amount: 69600000 },
      { name: 'Administrative', percentage: 8, amount: 46400000 },
    ],
    fundHistory: [
      { year: '2022', quarter: 'Q1', allocated: 140000000, used: 125000000 },
      { year: '2022', quarter: 'Q2', allocated: 140000000, used: 132000000 },
      { year: '2022', quarter: 'Q3', allocated: 140000000, used: 138000000 },
      { year: '2022', quarter: 'Q4', allocated: 140000000, used: 135000000 },
      { year: '2023', quarter: 'Q1', allocated: 145000000, used: 130000000 },
      { year: '2023', quarter: 'Q2', allocated: 145000000, used: 140000000 },
      { year: '2023', quarter: 'Q3', allocated: 145000000, used: 142000000 },
      { year: '2023', quarter: 'Q4', allocated: 145000000, used: 143000000 },
    ],
    recentReviews: [
      { 
        id: '1', 
        author: 'Parent', 
        date: '2025-05-02', 
        rating: 4.7, 
        text: 'The school is very transparent with their BOS funds usage. They publish regular reports and involve parents in decision-making.' 
      },
      { 
        id: '2', 
        author: 'Teacher', 
        date: '2025-04-18', 
        rating: 4.5, 
        text: 'School management has been efficient in allocating resources where they are most needed. Teaching materials are always adequate.' 
      },
      { 
        id: '3', 
        author: 'Anonymous', 
        date: '2025-04-05', 
        rating: 5.0, 
        text: 'Facilities are well-maintained and the extracurricular programs are well-funded. The BOS funds are clearly put to good use.' 
      },
    ],
  };

  return (
    <div className="container mx-auto px-4">
      {/* Header with school information */}
      <div className="relative mb-6 bg-white rounded-lg shadow-md overflow-hidden">
        <div className="h-48 bg-gray-300">
          {school.image && (
            <img
              src={school.image}
              alt={school.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-70"></div>
        </div>
        
        <div className="relative -mt-16 px-6 pb-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <School className="h-10 w-10 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{school.name}</h1>
                  <p className="text-gray-600">{school.level} • {school.location}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center bg-yellow-100 px-3 py-1 rounded-full">
                  <Star className="h-5 w-5 text-yellow-500 fill-current mr-1" />
                  <span className="font-medium">{school.rating.toFixed(1)}</span>
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
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    maximumFractionDigits: 0,
                  }).format(school.fundAllocation)}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-xs text-gray-500 mb-1">Fund per Student</p>
                <p className="text-lg font-bold text-gray-900">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    maximumFractionDigits: 0,
                  }).format(school.fundPerStudent)}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-xs text-gray-500 mb-1">Transparency Score</p>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                    <div
                      className="h-2.5 rounded-full bg-blue-600"
                      style={{ width: `${school.transparencyScore}%` }}
                    ></div>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{school.transparencyScore}%</span>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-xs text-gray-500 mb-1">Fund Usage</p>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                    <div
                      className={`h-2.5 rounded-full ${
                        school.fundUsagePercentage >= 90 ? 'bg-red-500' :
                        school.fundUsagePercentage >= 70 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${school.fundUsagePercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{school.fundUsagePercentage}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fund allocation and usage */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">BOS Fund Allocation</h2>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                <Download className="h-4 w-4 mr-1" />
                Download Report
              </button>
            </div>
            
            <div className="space-y-4">
              {school.fundCategories.map((category) => (
                <div key={category.name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{category.name}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        maximumFractionDigits: 0,
                      }).format(category.amount)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full bg-blue-600"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{category.percentage}% of total fund</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Historical Fund Usage</h2>
              <div className="flex space-x-2">
                <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  2022
                </button>
                <button className="inline-flex items-center px-3 py-1 border border-blue-600 text-sm leading-4 font-medium rounded-md text-white bg-blue-600">
                  2023
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {school.fundHistory.slice(-4).map((quarter) => (
                <div key={`${quarter.year}-${quarter.quarter}`} className="border rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium text-gray-900">{quarter.quarter}</p>
                    <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      (quarter.used / quarter.allocated) > 0.95 ? 'bg-red-100 text-red-800' :
                      (quarter.used / quarter.allocated) > 0.8 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {Math.round((quarter.used / quarter.allocated) * 100)}%
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Allocated</p>
                  <p className="font-bold text-gray-800">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      notation: 'compact',
                      compactDisplay: 'short',
                    }).format(quarter.allocated)}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Used</p>
                  <p className="font-bold text-gray-800">
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      notation: 'compact',
                      compactDisplay: 'short',
                    }).format(quarter.used)}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex justify-center">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View Complete History
              </button>
            </div>
          </div>
        </div>
        
        {/* School info and reviews */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">School Information</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Principal</p>
                <p className="font-medium">{school.principal}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="font-medium">{school.totalStudents.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Classes</p>
                <p className="font-medium">{school.totalClasses}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-medium">May 5, 2025</p>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-gray-900 mb-2">Performance Metrics</p>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-500">Transparency</span>
                      <span className="text-xs font-medium">{school.transparencyScore}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-blue-600"
                        style={{ width: `${school.transparencyScore}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-500">Fund Efficiency</span>
                      <span className="text-xs font-medium">{school.fundEfficiency}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-teal-600"
                        style={{ width: `${school.fundEfficiency}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-500">Parent Satisfaction</span>
                      <span className="text-xs font-medium">{school.parentSatisfaction}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-orange-600"
                        style={{ width: `${school.parentSatisfaction}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Recent Reviews</h2>
              <Link to={`/review/${school.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                Write a Review
              </Link>
            </div>
            
            <div className="space-y-4">
              {school.recentReviews.map((review) => (
                <div key={review.id} className="border-b pb-4 last:border-0">
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(review.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">{review.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(review.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">
                    By {review.author}
                  </p>
                  <p className="text-sm">{review.text}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex justify-center">
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View All Reviews
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolDetails;