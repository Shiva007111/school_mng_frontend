import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  Loader2, 
  User, 
  IndianRupee,
  ChevronRight,
  Receipt,
  Plus
} from 'lucide-react';
import { feeService } from '@/services/fee.service';
import { academicService } from '@/services/academic.service';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { toast } from 'react-hot-toast';
import { clsx } from 'clsx';
import { FeeReceipt } from './FeeReceipt';

export const StudentFeePage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [paymentData, setPaymentData] = useState({
    feeInvoiceId: '',
    amount: 0,
    method: 'cash',
    transactionRef: ''
  });
  const [showReceipt, setShowReceipt] = useState<any>(null);

  // Fetch Students (Enrollments)
  const { data: studentsData, isLoading: isLoadingStudents } = useQuery({
    queryKey: ['enrollments'],
    queryFn: () => academicService.getEnrollments(),
  });

  // Fetch Invoices for selected student
  const { data: invoicesData, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['student-invoices', selectedStudent?.studentId],
    queryFn: () => feeService.getStudentInvoices(selectedStudent.studentId),
    enabled: !!selectedStudent,
  });

  const paymentMutation = useMutation({
    mutationFn: (data: any) => feeService.recordPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-invoices', selectedStudent?.studentId] });
      toast.success('Payment recorded successfully');
      setIsRecordingPayment(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to record payment');
    }
  });

  const filteredStudents = studentsData?.data?.filter(s => 
    s.student?.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.student?.admissionNo.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleRecordPayment = (invoice: any) => {
    setPaymentData({
      feeInvoiceId: invoice.id,
      amount: Number(invoice.totalAmount) - invoice.payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0),
      method: 'cash',
      transactionRef: ''
    });
    setIsRecordingPayment(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
      {/* Student List */}
      <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 space-y-4">
          <h2 className="font-bold text-gray-900">Students</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoadingStudents ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
            </div>
          ) : (
            filteredStudents.map((enrollment) => (
              <button
                key={enrollment.id}
                onClick={() => setSelectedStudent(enrollment)}
                className={clsx(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left group",
                  selectedStudent?.id === enrollment.id 
                    ? "bg-indigo-50 border-indigo-100" 
                    : "hover:bg-gray-50 border-transparent"
                )}
              >
                <div className={clsx(
                  "h-10 w-10 rounded-full flex items-center justify-center transition-colors",
                  selectedStudent?.id === enrollment.id ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"
                )}>
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {enrollment.student?.user?.email.split('@')[0]}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {enrollment.classSection?.gradeLevel?.displayName} - {enrollment.classSection?.section}
                  </p>
                </div>
                <ChevronRight className={clsx(
                  "h-4 w-4 transition-transform",
                  selectedStudent?.id === enrollment.id ? "text-indigo-600 translate-x-1" : "text-gray-300"
                )} />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Fee Details */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
        {selectedStudent ? (
          <>
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-indigo-600 shadow-sm">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedStudent.student?.user?.email.split('@')[0]}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Admission No: {selectedStudent.student?.admissionNo} • Roll No: {selectedStudent.rollNumber}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {isLoadingInvoices ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Fee Invoices</h3>
                  {invoicesData?.data?.map((invoice) => {
                    const totalPaid = invoice.payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
                    const balance = Number(invoice.totalAmount) - totalPaid;
                    
                    return (
                      <div key={invoice.id} className="border border-gray-200 rounded-2xl overflow-hidden">
                        <div className="p-4 bg-gray-50/50 flex items-center justify-between border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg border border-gray-200">
                              <Receipt className="h-4 w-4 text-gray-400" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{invoice.feeStructure.name}</p>
                              <p className="text-xs text-gray-500">#{invoice.invoiceNo}</p>
                            </div>
                          </div>
                          <div className={clsx(
                            "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                            invoice.status === 'paid' ? "bg-green-100 text-green-700" :
                            invoice.status === 'partial' ? "bg-amber-100 text-amber-700" :
                            "bg-red-100 text-red-700"
                          )}>
                            {invoice.status}
                          </div>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <p className="text-xs text-gray-400 uppercase font-semibold">Total Amount</p>
                            <p className="text-lg font-bold text-gray-900">₹{Number(invoice.totalAmount).toLocaleString()}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-gray-400 uppercase font-semibold">Paid</p>
                            <p className="text-lg font-bold text-green-600">₹{totalPaid.toLocaleString()}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-gray-400 uppercase font-semibold">Balance</p>
                            <p className="text-lg font-bold text-red-600">₹{balance.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="px-4 py-3 bg-gray-50/30 border-t border-gray-100 flex justify-end gap-2">
                          {invoice.status !== 'paid' && (
                            <Button 
                              size="sm" 
                              className="bg-indigo-600 hover:bg-indigo-700 text-white"
                              onClick={() => handleRecordPayment(invoice)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Record Payment
                            </Button>
                          )}
                          {invoice.payments.length > 0 && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setShowReceipt({ invoice, student: selectedStudent })}
                            >
                              <Receipt className="h-3 w-3 mr-1" />
                              View Receipt
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {invoicesData?.data?.length === 0 && (
                    <div className="py-10 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                      <p className="text-gray-500">No invoices generated for this student.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <div className="h-20 w-20 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-200 mb-6">
              <IndianRupee className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Select a student</h3>
            <p className="text-gray-500 max-w-xs mt-2">
              Choose a student from the list to view their fee status and record payments.
            </p>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {isRecordingPayment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">Record Payment</h3>
              <p className="text-sm text-gray-500">Enter payment details for the selected invoice.</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Amount to Pay</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({ ...paymentData, amount: Number(e.target.value) })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Payment Method</label>
                <select 
                  className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={paymentData.method}
                  onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                  <option value="online">Online</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Transaction Reference (Optional)</label>
                <Input 
                  placeholder="e.g. TXN123456"
                  value={paymentData.transactionRef}
                  onChange={(e) => setPaymentData({ ...paymentData, transactionRef: e.target.value })}
                />
              </div>
            </div>
            <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsRecordingPayment(false)}>Cancel</Button>
              <Button 
                onClick={() => paymentMutation.mutate(paymentData)}
                isLoading={paymentMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Confirm Payment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Preview Modal */}
      {showReceipt && (
        <FeeReceipt 
          invoice={showReceipt.invoice} 
          student={showReceipt.student} 
          onClose={() => setShowReceipt(null)} 
        />
      )}
    </div>
  );
};
