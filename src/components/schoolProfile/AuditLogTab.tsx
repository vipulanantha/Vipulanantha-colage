import React, { useState } from 'react';
import { SchoolProfileAuditLog } from '../../types/schoolProfile';
import {
  History,
  Search,
  Download,
  Filter,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileCode,
  ShieldCheck,
  X,
} from 'lucide-react';

interface AuditLogTabProps {
  auditLogs: SchoolProfileAuditLog[];
}

export const AuditLogTab: React.FC<AuditLogTabProps> = ({ auditLogs }) => {
  const [search, setSearch] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [inspectingLog, setInspectingLog] = useState<SchoolProfileAuditLog | null>(null);

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.actorName.toLowerCase().includes(search.toLowerCase()) ||
      log.module.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase());

    const matchesModule = selectedModule === 'ALL' || log.module === selectedModule;
    const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;

    return matchesSearch && matchesModule && matchesAction;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Actor Name', 'Role', 'Module', 'Action', 'Details', 'IP Address'];
    const rows = filteredLogs.map((l) => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.actorName}"`,
      `"${l.actorRole}"`,
      `"${l.module}"`,
      `"${l.action}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.ipAddress || '127.0.0.1'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `vipulananda_audit_log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `vipulananda_audit_log_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-purple-900 font-bold text-xs uppercase tracking-wider mb-1">
            <History className="w-4 h-4 text-purple-700" />
            <span>Security Compliance • Immutable Audit Trail</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-cinzel text-slate-900">
            System Activity & Profile Change Audit Logs
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tamper-evident record of all administrative updates, branding changes, and confidential case access
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-start md:self-auto">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 bg-purple-900 hover:bg-purple-950 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer transition-all"
          >
            <FileCode className="w-3.5 h-3.5 text-amber-300" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 flex items-center bg-slate-50 rounded-xl border border-slate-200 px-3 py-2 w-full">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by actor, module, action or details..."
            className="w-full text-xs sm:text-sm text-slate-900 focus:outline-none bg-transparent"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={selectedModule}
            onChange={(e) => setSelectedModule(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700"
          >
            <option value="ALL">All Modules</option>
            <option value="Basic Information">Basic Information</option>
            <option value="Branding">Branding</option>
            <option value="Leadership">Leadership</option>
            <option value="Student Protection">Student Protection</option>
            <option value="Emergency Contacts">Emergency Contacts</option>
            <option value="Health & Welfare">Health & Welfare</option>
            <option value="Campus Facilities">Campus Facilities</option>
            <option value="Policies">Policies</option>
            <option value="School Configuration">School Configuration</option>
          </select>

          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700"
          >
            <option value="ALL">All Actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="VIEW_CONFIDENTIAL">VIEW_CONFIDENTIAL</option>
            <option value="RESTORE">RESTORE</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No matching audit log entries found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{log.actorName}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-950 border border-purple-200">
                        {log.actorRole}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{log.module}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.action === 'CREATE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : log.action === 'UPDATE'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : log.action === 'DELETE'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{log.details}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setInspectingLog(log)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Log Modal */}
      {inspectingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-purple-900" />
                <h3 className="font-cinzel font-bold text-lg text-purple-950">
                  Audit Entry Verification
                </h3>
              </div>
              <button
                onClick={() => setInspectingLog(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Actor</div>
                  <div className="font-bold text-slate-900">{inspectingLog.actorName}</div>
                  <div className="text-[11px] text-purple-900 font-semibold">{inspectingLog.actorRole}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Timestamp</div>
                  <div className="font-mono text-slate-700">{inspectingLog.timestamp}</div>
                  <div className="text-[10px] text-slate-400 font-mono">IP: {inspectingLog.ipAddress || '127.0.0.1'}</div>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Target Module & Action</div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-800">{inspectingLog.module}</span>
                  <span>•</span>
                  <span className="font-bold text-purple-900 font-mono">{inspectingLog.action}</span>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Detail Summary</div>
                <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800">
                  {inspectingLog.details}
                </p>
              </div>

              {(inspectingLog.oldValues || inspectingLog.newValues) && (
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">State Payload Diff</div>
                  <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl text-[11px] font-mono overflow-x-auto max-h-40">
                    {JSON.stringify(
                      {
                        previous: inspectingLog.oldValues,
                        updated: inspectingLog.newValues,
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectingLog(null)}
                className="px-5 py-2 bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold rounded-xl"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
