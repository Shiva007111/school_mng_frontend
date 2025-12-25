import React, { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Printer, 
  Download, 
  ArrowLeft,
  Loader2,
  GraduationCap,
  Trophy,
  Target,
  BarChart
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { examService } from '@/services/exam.service';
import { Button } from '@/components/Button';

export const ReportCardPage: React.FC = () => {
  const { studentId, sessionId } = useParams<{ studentId: string, sessionId: string }>();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);

  // Fetch Report Card Data
  const { data: reportData, isLoading: isLoadingReport } = useQuery({
    queryKey: ['report-card', studentId, sessionId],
    queryFn: () => examService.getReportCard(studentId!, sessionId!),
    enabled: !!studentId && !!sessionId,
  });

  // Fetch Session Details
  const { data: sessionData } = useQuery({
    queryKey: ['exam-session', sessionId],
    queryFn: () => examService.getExamSessionById(sessionId!),
    enabled: !!sessionId,
  });

  const report = reportData?.data;
  const session = sessionData?.data;
  const percentage = report ? (report.overallTotalObtained / report.overallTotalMax) * 100 : 0;

  const handlePrint = () => {
    window.print();
  };

  if (isLoadingReport) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-500">Generating report card...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">No report card data found for this session.</p>
        <Button onClick={() => navigate(-1)} variant="outline" className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Report Card</h1>
            <p className="text-gray-500">{session?.name}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button className="bg-indigo-600 text-white">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Report Card Content */}
      <div ref={printRef} className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden print:shadow-none print:border-none">
        {/* Header */}
        <div className="bg-indigo-600 p-8 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">EduManage School</h2>
              <p className="text-indigo-100">Academic Progress Report</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-indigo-100">Academic Session</p>
            <p className="text-lg font-bold">{session?.academicYear?.name}</p>
          </div>
        </div>

        {/* Student Info Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Overall Score</p>
              <p className="text-lg font-bold text-gray-900">{report.overallTotalObtained} / {report.overallTotalMax}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <BarChart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Percentage</p>
              <p className="text-lg font-bold text-gray-900">{percentage.toFixed(1)}%</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Grade</p>
              <p className="text-lg font-bold text-gray-900">
                {percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : 'D'}
              </p>
            </div>
          </div>
        </div>

        {/* Marks Table */}
        <div className="p-8">
          <div className="overflow-hidden rounded-2xl border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-sm font-bold text-gray-900">Subject</th>
                  {report.subjects[0]?.marks.map((m, i) => (
                    <th key={i} className="px-6 py-4 text-sm font-bold text-gray-900 text-center">
                      {m.examTitle}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-sm font-bold text-gray-900 text-center bg-indigo-50/50">Total</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-900 text-center bg-indigo-50/50">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {report.subjects.map((subject) => {
                  const subPercentage = (subject.totalObtained / subject.totalMax) * 100;
                  return (
                    <tr key={subject.subjectId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">
                        {subject.subjectName}
                      </td>
                      {subject.marks.map((m, i) => (
                        <td key={i} className="px-6 py-4 text-sm text-gray-600 text-center">
                          <span className="font-medium text-gray-900">{m.score}</span>
                          <span className="text-xs text-gray-400 ml-1">/ {m.maxScore}</span>
                        </td>
                      ))}
                      <td className="px-6 py-4 text-sm font-bold text-indigo-600 text-center bg-indigo-50/30">
                        {subject.totalObtained} / {subject.totalMax}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-indigo-600 text-center bg-indigo-50/30">
                        {subPercentage.toFixed(0)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer / Remarks */}
        <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-between items-end">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Teacher's Remarks</h4>
            <div className="h-20 w-80 border-b-2 border-dashed border-gray-300"></div>
          </div>
          <div className="text-center space-y-8">
            <div className="h-10 w-48 border-b-2 border-gray-900 mx-auto"></div>
            <p className="text-sm font-bold text-gray-900 uppercase tracking-widest">Principal's Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
};
