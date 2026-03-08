import { useState } from 'react';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface TeacherAttendanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacherName: string;
    onConfirm: (fromDate: string, toDate: string) => void;
    attendanceData?: {
        totalDays: number;
        presentDays: {
            id: string;
            date: string;
            markedAt: string;
            latitude: number;
            longitude: number;
        }[];
        absentDays: number;
        attendedDays: number;
    };
}

export default function TeacherAttendanceModal({
    isOpen,
    onClose,
    teacherName,
    onConfirm,
    attendanceData
}: TeacherAttendanceModalProps) {
    const [fromDate, setFromDate] = useState<Date | null>(new Date(new Date().setDate(new Date().getDate() - 30)));
    const [toDate, setToDate] = useState<Date | null>(new Date());

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (fromDate && toDate) {
            onConfirm(
                fromDate.toISOString().split('T')[0],
                toDate.toISOString().split('T')[0]
            );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-all animate-in fade-in duration-300">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in zoom-in-95 duration-300 border border-white/20">
                {/* Header Section */}
                <div className="bg-[#f0f9ff] p-8 pb-12 rounded-t-[2rem]">
                    <div className="flex justify-between items-start mb-6">
                        <h2 className="text-3xl font-extrabold text-[#1a1c1e] tracking-tight">Select Date</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/50 rounded-full transition-colors group"
                        >
                            <X className="h-6 w-6 text-gray-400 group-hover:text-gray-600" />
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <span className="text-sm font-semibold text-gray-500 mb-2 block ml-1">From</span>
                            <div className="relative">
                                <DatePicker
                                    selected={fromDate}
                                    onChange={(date: Date | null) => setFromDate(date)}
                                    dateFormat="dd MMMM, yyyy"
                                    className="w-full bg-white border-none rounded-2xl py-3 px-4 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                                />
                                <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        <span className="text-sm font-semibold text-gray-400 mt-6 font-mono">/</span>

                        <div className="flex-1">
                            <span className="text-sm font-semibold text-gray-500 mb-2 block ml-1">To</span>
                            <div className="relative">
                                <DatePicker
                                    selected={toDate}
                                    onChange={(date: Date | null) => setToDate(date)}
                                    dateFormat="dd MMMM, yyyy"
                                    className="w-full bg-white border-none rounded-2xl py-3 px-4 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                                    minDate={fromDate || undefined}
                                />
                                <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content / Summary area */}
                <div className="px-8 pb-8 -mt-6">
                    <div className="bg-white rounded-3xl shadow-lg border border-gray-50 p-6">
                        {attendanceData ? (
                            <div className="space-y-6">
                                <h3 className="text-center text-lg font-bold text-gray-800">Attendance Summary</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="text-center p-3 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col justify-center">
                                        <p className="text-xl font-black text-gray-900">{attendanceData.totalDays}</p>
                                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total Days</p>
                                    </div>
                                    <div className="text-center p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col justify-center">
                                        <p className="text-xl font-black text-emerald-600">{attendanceData.attendedDays}</p>
                                        <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Present</p>
                                    </div>
                                    <div className="text-center p-3 bg-rose-50 rounded-2xl border border-rose-100 flex flex-col justify-center">
                                        <p className="text-xl font-black text-rose-600">{attendanceData.absentDays}</p>
                                        <p className="text-[10px] uppercase font-bold text-rose-500 tracking-wider">Absent</p>
                                    </div>
                                </div>

                                {/* Detailed Log */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-bold text-gray-700 flex items-center justify-between">
                                        <span>Attendance Log</span>
                                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase">Recent First</span>
                                    </h4>
                                    <div className="max-h-48 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                        {attendanceData.presentDays && attendanceData.presentDays.length > 0 ? (
                                            attendanceData.presentDays.map((record) => (
                                                <div key={record.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:border-indigo-100 transition-colors">
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">
                                                            {new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400">Marked at {new Date(record.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                                                        <div className="h-1 w-1 rounded-full bg-emerald-500"></div>
                                                        PRESENT
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                                <p className="text-xs text-gray-400">No attendance records found for this period.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-2 flex gap-3">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 py-3 px-6 rounded-2xl font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        className="flex-1 py-3 px-6 rounded-2xl font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200"
                                    >
                                        Refresh
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-6">
                                <div className="py-12 text-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/30">
                                    <div className="h-12 w-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-gray-50">
                                        <CalendarIcon className="h-6 w-6 text-indigo-400" />
                                    </div>
                                    <p className="text-gray-400 font-medium px-4 text-sm leading-relaxed">
                                        Select a date range above to view attendance metrics for <span className="text-indigo-600 font-bold">{teacherName}</span>
                                    </p>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={onClose}
                                        className="flex-1 py-4 px-6 rounded-2xl font-bold text-rose-500 bg-rose-50 hover:bg-rose-100 transition-colors border border-rose-100"
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={handleConfirm}
                                        className="flex-1 py-4 px-6 rounded-2xl font-bold text-emerald-600 bg-[#eefce9] hover:bg-[#e4f7de] transition-colors shadow-sm border border-emerald-100"
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
