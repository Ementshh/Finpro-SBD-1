import React, { useEffect, useMemo, useState } from 'react';
import ReportGenerator, { ReportOptions } from '../components/reports/ReportGenerator';
import { FileText, AlertCircle } from 'lucide-react';
import { API_URL, parseJsonResponse } from '../config/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type SchoolApiRow = {
  id: number | string;
  name: string;
  region?: string | null;
  education_level?: string | null;
  average_rating?: number | string | null;
  fund_allocation?: number | string | null;
  fund_usage_percentage?: number | string | null;
};

type DashboardApi = {
  summary?: { total?: number | string; used?: number | string };
  categories?: { category: string; amount: number | string }[];
};

type GeneratedReport = {
  id: string;
  name: string;
  generatedAt: Date;
  format: ReportOptions['format'];
  fileName: string;
  blob: Blob;
};

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const formatIdr = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
};

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

const describeTimeRange = (options: ReportOptions): string => {
  if (options.timeRange !== 'custom') return options.timeRange;
  const start = options.customDateRange?.start || '-';
  const end = options.customDateRange?.end || '-';
  return `custom (${start} → ${end})`;
};

const getReportName = (options: ReportOptions): string => {
  if (options.reportType === 'bosFund') return 'BOS Fund Report';
  if (options.reportType === 'performance') return 'Performance Metrics Report';
  if (options.reportType === 'feedback') return 'Feedback Summary Report';
  return 'Custom BOS Report';
};

const buildBosFundCsv = (
  options: ReportOptions,
  dashboard: DashboardApi,
  schools: SchoolApiRow[],
  generatedAt: Date,
): Blob => {
  const total = toNumber(dashboard.summary?.total);
  const used = toNumber(dashboard.summary?.used);
  const remaining = Math.max(0, total - used);

  const esc = (v: unknown) => {
    const s = String(v ?? '');
    if (/[\n\r,\"]/g.test(s)) return `"${s.replace(/\"/g, '""')}"`;
    return s;
  };

  const lines: string[] = [];
  lines.push(`Report,${esc(getReportName(options))}`);
  lines.push(`Generated At,${esc(generatedAt.toISOString())}`);
  lines.push(`Time Range,${esc(describeTimeRange(options))}`);
  lines.push('');

  lines.push('Summary,Amount');
  lines.push(`Total Received,${esc(total)}`);
  lines.push(`Total Used,${esc(used)}`);
  lines.push(`Remaining,${esc(remaining)}`);
  lines.push('');

  if (options.includeMetrics.includes('fundCategories') && (dashboard.categories?.length || 0) > 0) {
    lines.push('Categories,Amount');
    for (const c of dashboard.categories || []) {
      lines.push(`${esc(c.category)},${esc(toNumber(c.amount))}`);
    }
    lines.push('');
  }

  const header = [
    'School ID',
    'School Name',
    'Region',
    'Education Level',
    ...(options.includeMetrics.includes('fundAllocation') ? ['Fund Allocation'] : []),
    ...(options.includeMetrics.includes('fundUsage') ? ['Fund Usage %', 'Estimated Used', 'Estimated Remaining'] : []),
    ...(options.includeMetrics.includes('rating') ? ['Average Rating'] : []),
  ];
  lines.push(header.map(esc).join(','));

  for (const s of schools) {
    const allocation = toNumber(s.fund_allocation);
    const usagePct = toNumber(s.fund_usage_percentage);
    const estimatedUsed = allocation * (usagePct / 100);
    const estimatedRemaining = allocation - estimatedUsed;
    const row = [
      s.id,
      s.name,
      s.region ?? '',
      s.education_level ?? '',
      ...(options.includeMetrics.includes('fundAllocation') ? [allocation] : []),
      ...(options.includeMetrics.includes('fundUsage')
        ? [usagePct, estimatedUsed, estimatedRemaining]
        : []),
      ...(options.includeMetrics.includes('rating') ? [toNumber(s.average_rating)] : []),
    ];
    lines.push(row.map(esc).join(','));
  }

  return new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
};

const buildBosFundPdf = (
  options: ReportOptions,
  dashboard: DashboardApi,
  schools: SchoolApiRow[],
  generatedAt: Date,
): Blob => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const left = 40;
  let y = 48;

  const title = getReportName(options);
  doc.setFontSize(18);
  doc.text(title, left, y);
  y += 18;
  doc.setFontSize(11);
  doc.text(
    'Comprehensive overview of BOS fund allocation and utilization across schools',
    left,
    y,
  );
  y += 22;
  doc.setFontSize(10);

  const metaLines = [
    `Generated: ${generatedAt.toLocaleString()}`,
    `Time range: ${describeTimeRange(options)}`,
    `Schools included: ${schools.length}`,
  ];
  for (const line of metaLines) {
    doc.text(line, left, y);
    y += 14;
  }
  y += 8;

  const total = toNumber(dashboard.summary?.total);
  const used = toNumber(dashboard.summary?.used);
  const remaining = Math.max(0, total - used);

  autoTable(doc, {
    startY: y,
    head: [['Summary', 'Amount']],
    body: [
      ['Total Received', formatIdr(total)],
      ['Total Used', formatIdr(used)],
      ['Remaining', formatIdr(remaining)],
    ],
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [37, 99, 235] },
  });

  const docAny = doc as any;
  y = (docAny.lastAutoTable?.finalY ?? y) + 18;

  if (options.includeMetrics.includes('fundCategories') && (dashboard.categories?.length || 0) > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Category', 'Amount']],
      body: (dashboard.categories || []).map((c) => [c.category, formatIdr(toNumber(c.amount))]),
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [37, 99, 235] },
    });
    y = (docAny.lastAutoTable?.finalY ?? y) + 18;
  }

  const schoolHead: string[] = ['School', 'Region', 'Level'];
  if (options.includeMetrics.includes('fundAllocation')) schoolHead.push('Allocated');
  if (options.includeMetrics.includes('fundUsage')) schoolHead.push('Usage %', 'Used (est.)', 'Remaining (est.)');
  if (options.includeMetrics.includes('rating')) schoolHead.push('Rating');

  const schoolBody = schools.map((s) => {
    const allocation = toNumber(s.fund_allocation);
    const usagePct = toNumber(s.fund_usage_percentage);
    const usedEst = allocation * (usagePct / 100);
    const remainingEst = allocation - usedEst;

    const row: (string | number)[] = [
      s.name,
      s.region ?? '-',
      s.education_level ?? '-',
    ];
    if (options.includeMetrics.includes('fundAllocation')) row.push(formatIdr(allocation));
    if (options.includeMetrics.includes('fundUsage'))
      row.push(`${usagePct.toFixed(1)}%`, formatIdr(usedEst), formatIdr(remainingEst));
    if (options.includeMetrics.includes('rating')) row.push(toNumber(s.average_rating).toFixed(2));
    return row;
  });

  autoTable(doc, {
    startY: y,
    head: [schoolHead],
    body: schoolBody,
    theme: 'grid',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [37, 99, 235] },
    columnStyles: {
      0: { cellWidth: 160 },
    },
  });

  return doc.output('blob');
};

const Reports: React.FC = () => {
  const [generatingReport, setGeneratingReport] = useState<ReportOptions | null>(null);
  const [schoolsData, setSchoolsData] = useState<SchoolApiRow[]>([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [recentReports, setRecentReports] = useState<GeneratedReport[]>([]);

  useEffect(() => {
    const fetchSchools = async () => {
      setIsLoadingSchools(true);
      setErrorMsg('');
      try {
        const res = await fetch(`${API_URL}/schools`);
        const data = await parseJsonResponse<SchoolApiRow[]>(res);
        if (!res.ok) {
          throw new Error('Failed to fetch schools data');
        }
        setSchoolsData(data);
      } catch (err) {
        setSchoolsData([]);
        setErrorMsg(err instanceof Error ? err.message : 'Failed to fetch schools data');
      } finally {
        setIsLoadingSchools(false);
      }
    };
    fetchSchools();
  }, []);

  const schoolOptions = useMemo(() => {
    return schoolsData.map((s) => ({ id: String(s.id), name: s.name }));
  }, [schoolsData]);

  const generateReport = async (options: ReportOptions) => {
    setGeneratingReport(options);
    setErrorMsg('');
    try {
      const dashboardRes = await fetch(`${API_URL}/funds/dashboard`);
      const dashboard = await parseJsonResponse<DashboardApi>(dashboardRes);
      if (!dashboardRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const selectedAll = options.schoolIds.includes('all') || options.schoolIds.length === 0;
      const selectedSet = new Set(options.schoolIds.map(String));
      const filteredSchools = selectedAll
        ? schoolsData
        : schoolsData.filter((s) => selectedSet.has(String(s.id)));

      const generatedAt = new Date();
      const baseName = getReportName(options);
      const dateTag = generatedAt.toISOString().slice(0, 10);

      let blob: Blob;
      let fileName: string;

      if (options.format === 'pdf') {
        blob = buildBosFundPdf(options, dashboard, filteredSchools, generatedAt);
        fileName = `${baseName.replace(/\s+/g, '-').toLowerCase()}_${dateTag}.pdf`;
      } else {
        blob = buildBosFundCsv(options, dashboard, filteredSchools, generatedAt);
        // Excel can open CSV; keep it explicit for users.
        fileName = `${baseName.replace(/\s+/g, '-').toLowerCase()}_${dateTag}.csv`;
      }

      const report: GeneratedReport = {
        id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
        name: baseName,
        generatedAt,
        format: options.format,
        fileName,
        blob,
      };

      setRecentReports((prev) => [report, ...prev].slice(0, 10));
      downloadBlob(blob, fileName);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setGeneratingReport(null);
    }
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
      
      {generatingReport && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 animate-pulse">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold">Generating your report...</h2>
              <p className="text-sm text-gray-600">
                Format: {generatingReport.format.toUpperCase()} • 
                Time Range: {describeTimeRange(generatingReport)} • 
                Metrics: {generatingReport.includeMetrics.length}
              </p>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full mt-4">
            <div className="h-2 bg-blue-600 rounded-full" style={{ width: "70%" }}></div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Report Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{errorMsg}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <ReportGenerator schools={schoolOptions} generateReport={generateReport} />
      
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
              {recentReports.length === 0 ? (
                <tr>
                  <td className="px-6 py-6 text-sm text-gray-500" colSpan={4}>
                    {isLoadingSchools
                      ? 'Loading schools data…'
                      : 'No reports generated yet. Use the generator above.'}
                  </td>
                </tr>
              ) : (
                recentReports.map((r) => (
                  <tr key={r.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {r.generatedAt.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {r.format.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => downloadBlob(r.blob, r.fileName)}
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;