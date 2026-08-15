import React, { useState } from 'react';
import { FeeInvoice, Student } from '../types/sms';
import { DollarSign, Plus, Search, Receipt, CheckCircle, AlertCircle, Clock, Download, X } from 'lucide-react';

interface FinanceManagerProps {
  fees: FeeInvoice[];
  students: Student[];
  onRecordPayment: (invoiceId: string, amount: number) => void;
  onAddInvoice: (invoice: Omit<FeeInvoice, 'id'>) => void;
  canEdit: boolean;
}

export const FinanceManager: React.FC<FinanceManagerProps> = ({
  fees,
  students,
  onRecordPayment,
  onAddInvoice,
  canEdit,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<FeeInvoice | null>(null);

  // Form State
  const [studentId, setStudentId] = useState(students[0]?.id || '');
  const [category, setCategory] = useState<FeeInvoice['category']>('Term Facility Fee');
  const [amount, setAmount] = useState(15000);
  const [discount, setDiscount] = useState(0);
  const [dueDate, setDueDate] = useState('2026-08-30');

  // Stats
  const totalBilled = fees.reduce((acc, f) => acc + f.amount, 0);
  const totalCollected = fees.reduce((acc, f) => acc + f.paidAmount, 0);
  const totalOutstanding = fees.reduce((acc, f) => acc + f.balanceAmount, 0);
  const collectionRate = totalBilled > 0 ? ((totalCollected / totalBilled) * 100).toFixed(1) : '100';

  const filteredFees = fees.filter((f) => {
    const matchesSearch =
      f.studentName.toLowerCase().includes(search.toLowerCase()) ||
      f.admissionNo.toLowerCase().includes(search.toLowerCase()) ||
      f.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      f.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === studentId);
    if (!st) return;

    const net = Math.max(amount - discount, 0);
    onAddInvoice({
      invoiceNo: `INV-2026-${String(fees.length + 1).padStart(3, '0')}`,
      studentId: st.id,
      studentName: st.fullName,
      admissionNo: st.admissionNo,
      grade: `${st.grade}-${st.section}`,
      category,
      amount: Number(amount),
      discount: Number(discount),
      paidAmount: 0,
      balanceAmount: net,
      dueDate,
      status: 'Pending',
    });

    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 font-cinzel flex items-center space-x-2">
            <span>Fees, Payments & Financial Accounting</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 font-sans font-semibold">
              Bursar Portal
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Term fees, science lab funds, bursary discounts, receipts and outstanding ledger
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2A0845] to-[#3B185F] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>+ Generate Invoice</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">Total Billed</div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">LKR {totalBilled.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500 font-medium">Term 2 Academic Year</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-emerald-700 font-semibold uppercase">Collected Revenue</div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-700 mt-0.5">
            LKR {totalCollected.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium">Collection Rate: {collectionRate}%</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-rose-700 font-semibold uppercase">Outstanding Due</div>
          <div className="text-xl sm:text-2xl font-bold text-rose-700 mt-0.5">
            LKR {totalOutstanding.toLocaleString()}
          </div>
          <div className="text-[11px] text-rose-600 font-medium">Overdue Reminders Triggered</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-purple-900 font-semibold uppercase">Total Invoices</div>
          <div className="text-xl sm:text-2xl font-bold text-purple-900 mt-0.5">{fees.length} Records</div>
          <div className="text-[11px] text-slate-500 font-medium">Audited & Reconciled</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice no, student name, admission no..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-900 transition-all shadow-xs"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-900 shadow-xs"
        >
          <option value="All">All Invoices</option>
          <option value="Paid">Fully Paid</option>
          <option value="Partial">Partial Payment</option>
          <option value="Pending">Pending</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      {/* Fees Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-semibold">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Student & Class</th>
                <th className="py-3 px-4">Fee Category</th>
                <th className="py-3 px-4 text-right">Amount (LKR)</th>
                <th className="py-3 px-4 text-right">Paid (LKR)</th>
                <th className="py-3 px-4 text-right">Balance</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Receipt / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFees.map((fee) => (
                <tr key={fee.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-purple-900">{fee.invoiceNo}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{fee.studentName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {fee.admissionNo} • {fee.grade}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">{fee.category}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {fee.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                    {fee.paidAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-rose-700">
                    {fee.balanceAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        fee.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : fee.status === 'Partial'
                          ? 'bg-blue-100 text-blue-800'
                          : fee.status === 'Overdue'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {fee.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex items-center space-x-1.5">
                      {fee.paidAmount > 0 ? (
                        <button
                          onClick={() => setSelectedReceipt(fee)}
                          className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-900 font-semibold rounded-md border border-purple-200 text-xs flex items-center space-x-1"
                        >
                          <Receipt className="w-3 h-3" />
                          <span>Receipt</span>
                        </button>
                      ) : canEdit ? (
                        <button
                          onClick={() => onRecordPayment(fee.id, fee.amount)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-md text-xs"
                        >
                          Record Pay
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs">Unpaid</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Payment Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden my-auto p-6">
            <div className="text-center border-b border-slate-200 pb-3 mb-3">
              <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                OFFICIAL BURSARY RECEIPT
              </div>
              <h3 className="text-base font-bold text-purple-950 font-cinzel">
                VIPULANANTHA COLLEGE COLOMBO
              </h3>
              <p className="text-xs text-slate-500 font-mono">Receipt No: {selectedReceipt.receiptNo || 'REC-9912'}</p>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Student:</span>
                <strong className="text-slate-900">{selectedReceipt.studentName}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Admission No:</span>
                <strong className="font-mono text-slate-900">{selectedReceipt.admissionNo}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Class & Section:</span>
                <span className="font-semibold text-slate-900">{selectedReceipt.grade}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Fee Category:</span>
                <span className="font-semibold text-slate-900">{selectedReceipt.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Payment Date:</span>
                <span className="font-semibold text-slate-900">{selectedReceipt.paymentDate || '2026-08-15'}</span>
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex justify-between items-center text-sm font-bold text-emerald-950">
                <span>Amount Paid:</span>
                <span className="font-mono text-base">LKR {selectedReceipt.paidAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-5 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-3 py-1.5 bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => alert('Official Stamped Payment Receipt printed.')}
                className="px-3 py-1.5 bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold rounded-lg flex items-center space-x-1"
              >
                <Download className="w-3 h-3 text-amber-300" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Invoice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden my-auto p-5 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-purple-900" />
                <h3 className="text-base font-bold text-slate-900 font-cinzel">Generate Fee Invoice</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Student Candidate</label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.admissionNo} • {s.grade})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Fee Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FeeInvoice['category'])}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="Term Facility Fee">Term Facility Fee</option>
                  <option value="Lab & Science Equipment">Lab & Science Equipment</option>
                  <option value="Sports & Society Fund">Sports & Society Fund</option>
                  <option value="Examination Fee">Examination Fee</option>
                  <option value="Library & ICT">Library & ICT</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (LKR) *</label>
                  <input
                    type="number"
                    min={500}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Discount / Waiver (LKR)</label>
                  <input
                    type="number"
                    min={0}
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#2A0845] hover:bg-[#3B185F] text-white font-bold"
                >
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
