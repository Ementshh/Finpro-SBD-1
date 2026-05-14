import React, { useState } from 'react';
import ReportGenerator, { ReportOptions } from '../components/reports/ReportGenerator';
import { FileText, AlertCircle } from 'lucide-react';

const Reports: React.FC = () => {
  const [generatedReport, setGeneratedReport] = useState<ReportOptions | null>(null);
  
  // Mock data 
  const schools = [
    { id: '1', name: 'SD Negeri 1 Jakarta' },
    { id: '2', name: 'SMP Negeri 3 Surabaya' },
    { id: '3', name: 'SMA Negeri 2 Bandung' },
    { id: '4', name: 'SD Negeri 5 Semarang' },
    { id: '5', name: 'SMK Negeri 1 Yogyakarta' },
    { id: '6', name: 'SD Negeri 2 Medan' },
    { id: '7', name: 'SMP Negeri 1 Makassar' },
  ];
  
  const generateReport = (options: ReportOptions) => {
    console.log('Generating report with options:', options);
    // mock report
    setGeneratedReport(options);
    
    setTimeout(() => {
      setGeneratedReport(null);
    }, 5000);
  };

  return (
    <div className="container mx-auto px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">BOS Fund Reports</h1>
        <p className="text-gray-600">
          Generate and download reports for BOS fund allocation and usage
        </p>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Report Information</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                These reports are generated based on the latest available data from the school management system.
                For specific data requests or custom reports, please contact the education department.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {generatedReport && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 animate-pulse">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold">Generating your report...</h2>
              <p className="text-sm text-gray-600">
                Format: {generatedReport.format.toUpperCase()} • 
                Time Range: {generatedReport.timeRange} • 
                Metrics: {generatedReport.includeMetrics.length}
              </p>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full mt-4">
            <div className="h-2 bg-blue-600 rounded-full" style={{ width: "70%" }}></div>
          </div>
        </div>
      )}
      
      <ReportGenerator schools={schools} generateReport={generateReport} />
      
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Reports</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Generated Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Format
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-gray-900">Annual BOS Fund Allocation Report</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  May 10, 2025
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    PDF
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">Download</button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-gray-900">School Performance Metrics (Q1 2025)</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  April 28, 2025
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    EXCEL
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">Download</button>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-orange-600 mr-2" />
                    <span className="text-sm font-medium text-gray-900">Parent Feedback Summary Report</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  April 15, 2025
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                    PDF
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">Download</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;