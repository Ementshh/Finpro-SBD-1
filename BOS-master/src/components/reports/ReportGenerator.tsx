import React, { useState } from 'react';
import { Download, FileText, Printer, BarChart3, Book, Filter } from 'lucide-react';

interface ReportGeneratorProps {
  schools: any[];
  generateReport: (options: ReportOptions) => void;
}

export interface ReportOptions {
  reportType?: 'bosFund' | 'performance' | 'feedback' | 'custom';
  format: 'pdf' | 'excel' | 'csv';
  timeRange: 'month' | 'quarter' | 'year' | 'custom';
  includeMetrics: string[];
  schoolIds: string[];
  customDateRange?: {
    start?: string;
    end?: string;
  };
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ schools, generateReport }) => {
  const [options, setOptions] = useState<ReportOptions>({
    format: 'pdf',
    timeRange: 'month',
    includeMetrics: ['fundAllocation', 'fundUsage', 'rating'],
    schoolIds: [],
    customDateRange: {
      start: '',
      end: '',
    },
    reportType: 'custom',
  });

  const [showFilters, setShowFilters] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setOptions({ ...options, [name]: value });
  };

  const handleMetricChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (checked) {
      setOptions({
        ...options,
        includeMetrics: [...options.includeMetrics, value],
      });
    } else {
      setOptions({
        ...options,
        includeMetrics: options.includeMetrics.filter((metric) => metric !== value),
      });
    }
  };

  const handleSchoolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
    setOptions({ ...options, schoolIds: selectedOptions });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOptions({
      ...options,
      customDateRange: {
        ...options.customDateRange,
        [name === 'startDate' ? 'start' : 'end']: value,
      },
    });
  };

  const handleGenerateReport = () => {
    generateReport(options);
  };

  const generateWithOptions = (nextOptions: ReportOptions) => {
    setOptions(nextOptions);
    generateReport(nextOptions);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Generate Reports</h2>
        <p className="text-gray-600 mt-1">
          Create customized reports for BOS fund data and school performance metrics
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="border rounded-lg p-4 bg-blue-50 border-blue-100">
          <div className="flex items-center mb-3">
            <FileText className="w-5 h-5 text-blue-700 mr-2" />
            <h3 className="font-semibold text-blue-800">BOS Fund Report</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Comprehensive overview of BOS fund allocation and utilization across schools
          </p>
          <button 
            onClick={() => {
              generateWithOptions({
                ...options,
                reportType: 'bosFund',
                includeMetrics: ['fundAllocation', 'fundUsage', 'fundCategories'],
                format: 'pdf',
              });
            }}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Generate Report
          </button>
        </div>
        
        <div className="border rounded-lg p-4 bg-teal-50 border-teal-100">
          <div className="flex items-center mb-3">
            <BarChart3 className="w-5 h-5 text-teal-700 mr-2" />
            <h3 className="font-semibold text-teal-800">Performance Metrics</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Analysis of school performance metrics and their correlation with funding
          </p>
          <button 
            onClick={() => {
              generateWithOptions({
                ...options,
                reportType: 'performance',
                includeMetrics: ['rating', 'transparencyScore', 'compliance'],
                format: 'excel',
              });
            }}
            className="w-full px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors flex items-center justify-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Generate Report
          </button>
        </div>
        
        <div className="border rounded-lg p-4 bg-orange-50 border-orange-100">
          <div className="flex items-center mb-3">
            <Book className="w-5 h-5 text-orange-700 mr-2" />
            <h3 className="font-semibold text-orange-800">Feedback Summary</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Summary of parent and student feedback on school resource management
          </p>
          <button 
            onClick={() => {
              generateWithOptions({
                ...options,
                reportType: 'feedback',
                includeMetrics: ['feedback', 'satisfactionScore', 'suggestions'],
                format: 'pdf',
              });
            }}
            className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors flex items-center justify-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Generate Report
          </button>
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-6">
        <button 
          onClick={toggleFilters}
          className="flex items-center text-gray-700 hover:text-gray-900 mb-4"
        >
          <Filter className="w-5 h-5 mr-2" />
          <span>{showFilters ? 'Hide' : 'Show'} Advanced Options</span>
        </button>
        
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Format
              </label>
              <select
                name="format"
                value={options.format}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="pdf">PDF Document</option>
                <option value="excel">Excel Spreadsheet</option>
                <option value="csv">CSV File</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Range
              </label>
              <select
                name="timeRange"
                value={options.timeRange}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            
            {options.timeRange === 'custom' && (
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={options.customDateRange?.start}
                    onChange={handleDateChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={options.customDateRange?.end}
                    onChange={handleDateChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schools to Include
              </label>
              <select
                multiple
                value={options.schoolIds}
                onChange={handleSchoolChange}
                className="w-full p-2 border border-gray-300 rounded-md h-32"
              >
                <option value="all">All Schools</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Hold Ctrl/Cmd to select multiple schools
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metrics to Include
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="fundAllocation"
                    value="fundAllocation"
                    checked={options.includeMetrics.includes('fundAllocation')}
                    onChange={handleMetricChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="fundAllocation" className="ml-2 text-sm text-gray-700">
                    Fund Allocation
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="fundUsage"
                    value="fundUsage"
                    checked={options.includeMetrics.includes('fundUsage')}
                    onChange={handleMetricChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="fundUsage" className="ml-2 text-sm text-gray-700">
                    Fund Usage
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rating"
                    value="rating"
                    checked={options.includeMetrics.includes('rating')}
                    onChange={handleMetricChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="rating" className="ml-2 text-sm text-gray-700">
                    School Ratings
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="feedback"
                    value="feedback"
                    checked={options.includeMetrics.includes('feedback')}
                    onChange={handleMetricChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="feedback" className="ml-2 text-sm text-gray-700">
                    Parent Feedback
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-8 flex justify-end space-x-3">
        <button 
          onClick={() => {
            setOptions({
              reportType: 'custom',
              format: 'pdf',
              timeRange: 'month',
              includeMetrics: ['fundAllocation', 'fundUsage', 'rating'],
              schoolIds: [],
              customDateRange: {
                start: '',
                end: '',
              },
            });
          }}
          className="px-4 py-2 text-gray-700 rounded-md border border-gray-300 hover:bg-gray-50"
        >
          Reset
        </button>
        <button 
          onClick={handleGenerateReport}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
        >
          <Printer className="w-4 h-4 mr-2" />
          Generate Custom Report
        </button>
      </div>
    </div>
  );
};

export default ReportGenerator;