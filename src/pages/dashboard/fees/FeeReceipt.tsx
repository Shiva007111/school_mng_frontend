import React from 'react';
import { X, Printer, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/Button';

interface FeeReceiptProps {
  invoice: any;
  student: any;
  onClose: () => void;
}

export const FeeReceipt: React.FC<FeeReceiptProps> = ({ invoice, student, onClose }) => {
  const totalPaid = invoice.payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
  const balance = Number(invoice.totalAmount) - totalPaid;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 print:shadow-none print:rounded-none">
        {/* Header - Hidden in print */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between print:hidden">
          <h3 className="font-bold text-gray-900">Fee Receipt Preview</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="p-8 space-y-8 print:p-12" id="receipt-content">
          {/* School Header */}
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-indigo-600 tracking-tight">EDUMANAGE</h1>
              <div className="text-sm text-gray-500">
                <p>123 Education Lane, Knowledge City</p>
                <p>Contact: +91 98765 43210</p>
                <p>Email: contact@edumanage.com</p>
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider border border-green-100">
                <CheckCircle2 className="h-3 w-3" />
                Payment Receipt
              </div>
              <p className="text-sm font-medium text-gray-900 mt-2">Receipt No: RCP-{Date.now().toString().slice(-6)}</p>
              <p className="text-xs text-gray-500">Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="h-px bg-gray-100 w-full" />

          {/* Student & Invoice Info */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Student Details</h4>
              <div className="space-y-1">
                <p className="font-bold text-gray-900">{student.student?.user?.email.split('@')[0]}</p>
                <p className="text-sm text-gray-600">Admission No: {student.student?.admissionNo}</p>
                <p className="text-sm text-gray-600">Class: {student.classSection?.gradeLevel?.displayName} - {student.classSection?.section}</p>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fee Details</h4>
              <div className="space-y-1">
                <p className="font-bold text-gray-900">{invoice.feeStructure.name}</p>
                <p className="text-sm text-gray-600">Invoice No: {invoice.invoiceNo}</p>
                <p className="text-sm text-gray-600">Frequency: {invoice.feeStructure.frequency.toUpperCase()}</p>
              </div>
            </div>
          </div>

          {/* Components Table */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Breakdown</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="pb-3 font-semibold text-gray-600">Description</th>
                  <th className="pb-3 font-semibold text-gray-600 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {invoice.feeStructure.components.map((comp: any, i: number) => (
                  <tr key={i}>
                    <td className="py-3 text-gray-700">{comp.label}</td>
                    <td className="py-3 text-right font-medium text-gray-900">₹{Number(comp.amount).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200">
                  <td className="pt-4 font-bold text-gray-900">Total Invoice Amount</td>
                  <td className="pt-4 text-right font-bold text-gray-900">₹{Number(invoice.totalAmount).toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-2 text-green-600 font-semibold">Total Paid to Date</td>
                  <td className="py-2 text-right text-green-600 font-bold">₹{totalPaid.toLocaleString()}</td>
                </tr>
                <tr className="border-t border-gray-100">
                  <td className="pt-2 text-red-600 font-semibold">Outstanding Balance</td>
                  <td className="pt-2 text-right text-red-600 font-bold">₹{balance.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="pt-8 flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Payment Method</p>
              <p className="text-sm font-medium text-gray-900">{invoice.payments[0]?.method.toUpperCase() || 'N/A'}</p>
            </div>
            <div className="text-center space-y-4">
              <div className="h-12 w-40 border-b border-gray-300" />
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Authorized Signatory</p>
            </div>
          </div>

          <div className="pt-8 text-center">
            <p className="text-xs text-gray-400 italic">This is a computer-generated receipt and does not require a physical signature.</p>
          </div>
        </div>

        {/* Footer Actions - Hidden in print */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 print:hidden">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Receipt
          </Button>
        </div>
      </div>
    </div>
  );
};
