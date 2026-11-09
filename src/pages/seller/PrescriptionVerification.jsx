import { useState } from 'react';
import { CheckCircle2, Eye, FileText, XCircle, Clock3, ShieldAlert } from 'lucide-react';

const initialPrescriptions = [
  {
    id: 'RX-1042',
    customer: 'Nusrat Jahan',
    orderId: 'SB-78234',
    product: 'Seclo 20mg',
    uploadedAt: 'Today, 10:20 AM',
    status: 'Pending Review',
    fileName: 'prescription-1.pdf',
  },
  {
    id: 'RX-1043',
    customer: 'Arif Hossain',
    orderId: 'SB-78241',
    product: 'Monas 10mg',
    uploadedAt: 'Today, 8:45 AM',
    status: 'Approved',
    fileName: 'monas-rx.jpg',
  },
  {
    id: 'RX-1044',
    customer: 'Sadia Ahmed',
    orderId: 'SB-78252',
    product: 'Sergel 20mg',
    uploadedAt: 'Yesterday, 5:15 PM',
    status: 'Rejected',
    fileName: 'sergel-rx.png',
  },
];

export default function PrescriptionVerification() {
  const [prescriptions, setPrescriptions] = useState(initialPrescriptions);

  const updateStatus = (id, status) => {
    setPrescriptions((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status } : item,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Verification Queue</p>
          <h1 className="text-3xl font-bold text-slate-900">Prescription Review Panel</h1>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-xs">
          <Clock3 className="h-4 w-4 text-teal-700" />
          3 submissions awaiting action
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Pending</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">1</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Approved</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">1</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Rejected</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">1</p>
        </div>
      </div>

      <div className="space-y-4">
        {prescriptions.map((prescription) => (
          <div key={prescription.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-900">{prescription.customer}</p>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                    {prescription.id}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1"><FileText className="h-4 w-4" /> {prescription.fileName}</span>
                  <span>Order: {prescription.orderId}</span>
                  <span>Product: {prescription.product}</span>
                </div>
                <p className="text-xs text-slate-500">Submitted {prescription.uploadedAt}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                  prescription.status === 'Pending Review'
                    ? 'bg-amber-100 text-amber-700'
                    : prescription.status === 'Approved'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700'
                }`}>
                  {prescription.status}
                </span>
                <button className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700">
                  <Eye className="h-4 w-4" /> View
                </button>
              </div>
            </div>

            {prescription.status === 'Pending Review' && (
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => updateStatus(prescription.id, 'Approved')}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  <CheckCircle2 className="h-4 w-4" /> Approve
                </button>
                <button
                  onClick={() => updateStatus(prescription.id, 'Rejected')}
                  className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                >
                  <XCircle className="h-4 w-4" /> Reject
                </button>
              </div>
            )}

            {prescription.status !== 'Pending Review' && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600 border border-slate-200">
                <ShieldAlert className="h-4 w-4 text-slate-500" />
                This prescription is currently marked as {prescription.status.toLowerCase()}.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
