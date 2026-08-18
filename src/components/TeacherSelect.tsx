import React, { useState, useRef, useEffect } from 'react';
import { StaffMember } from '../types/sms';
import { Search, ChevronDown, Check, User, X } from 'lucide-react';

interface TeacherSelectProps {
  teachers: StaffMember[];
  value?: string;
  onChange: (teacherId: string, teacher?: StaffMember) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  allowClear?: boolean;
  includeInactive?: boolean;
  className?: string;
  label?: string;
}

export const TeacherSelect: React.FC<TeacherSelectProps> = ({
  teachers = [],
  value = '',
  onChange,
  placeholder = 'Select Teacher / Lecturer...',
  disabled = false,
  required = false,
  allowClear = true,
  includeInactive = false,
  className = '',
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Find currently selected teacher (match by id or employeeId or fullName)
  const selectedTeacher = teachers.find(
    (t) => t.id === value || t.employeeId === value || t.fullName === value
  );

  // Filter teachers list
  const filteredTeachers = teachers.filter((t) => {
    // Active filter unless includeInactive or currently selected
    const isActive = includeInactive || t.status === 'Active' || t.id === value;
    if (!isActive) return false;

    if (!search.trim()) return true;

    const q = search.toLowerCase().trim();
    const nameMatch = t.fullName.toLowerCase().includes(q);
    const idMatch = t.employeeId.toLowerCase().includes(q);
    const deptMatch = (t.department || '').toLowerCase().includes(q);
    const specMatch = (t.specialization || '').toLowerCase().includes(q);
    const subMatch = (t.subjectsTaught || []).some((s) => s.toLowerCase().includes(q));

    return nameMatch || idMatch || deptMatch || specMatch || subMatch;
  });

  const handleSelect = (teacher: StaffMember) => {
    onChange(teacher.id, teacher);
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('', undefined);
    setSearch('');
  };

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Select Trigger Box */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 bg-white border rounded-xl flex items-center justify-between cursor-pointer transition-all shadow-xs ${
          isOpen ? 'border-purple-900 ring-2 ring-purple-900/20' : 'border-slate-300 hover:border-slate-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100' : ''}`}
      >
        <div className="flex items-center space-x-2.5 overflow-hidden pr-2">
          {selectedTeacher ? (
            <>
              <div className="w-6 h-6 rounded-full bg-purple-900 text-amber-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                {selectedTeacher.fullName.charAt(0)}
              </div>
              <div className="flex items-center space-x-1.5 truncate text-xs sm:text-sm">
                <span className="font-bold text-slate-900 truncate">{selectedTeacher.fullName}</span>
                <span className="font-mono text-[11px] text-purple-900 font-semibold bg-purple-50 px-1.5 py-0.2 rounded border border-purple-100 shrink-0">
                  {selectedTeacher.employeeId}
                </span>
                {selectedTeacher.specialization && (
                  <span className="text-[10px] text-slate-500 hidden sm:inline truncate">
                    ({selectedTeacher.specialization})
                  </span>
                )}
              </div>
            </>
          ) : (
            <span className="text-slate-400 text-xs sm:text-sm">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center space-x-1 shrink-0">
          {allowClear && selectedTeacher && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden animate-fade-in max-h-72 flex flex-col">
          {/* Search Bar inside Combobox */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/80 sticky top-0 z-10">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search teacher by name, ID (TCH-001), or subject..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-900"
              />
            </div>
          </div>

          {/* Teacher Options List */}
          <div className="overflow-y-auto p-1 divide-y divide-slate-50">
            {filteredTeachers.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                <User className="w-5 h-5 text-slate-300 mx-auto mb-1" />
                <span>No active teachers found matching "{search}"</span>
              </div>
            ) : (
              filteredTeachers.map((teacher) => {
                const isSelected =
                  teacher.id === value || teacher.employeeId === value || teacher.fullName === value;

                return (
                  <div
                    key={teacher.id}
                    onClick={() => handleSelect(teacher)}
                    className={`p-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between text-xs ${
                      isSelected
                        ? 'bg-purple-900 text-white font-semibold'
                        : 'hover:bg-purple-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 overflow-hidden">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected ? 'bg-amber-300 text-purple-950' : 'bg-purple-100 text-purple-900'
                        }`}
                      >
                        {teacher.fullName.charAt(0)}
                      </div>

                      <div className="truncate">
                        <div className="flex items-center space-x-1.5">
                          <span className={`font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                            {teacher.fullName}
                          </span>
                          <span
                            className={`font-mono text-[10px] px-1.5 py-0.2 rounded border font-semibold ${
                              isSelected
                                ? 'bg-purple-800 text-amber-200 border-purple-700'
                                : 'bg-purple-50 text-purple-900 border-purple-100'
                            }`}
                          >
                            {teacher.employeeId}
                          </span>
                          {teacher.status !== 'Active' && (
                            <span className="text-[9px] bg-rose-100 text-rose-800 px-1 py-0.2 rounded font-bold">
                              {teacher.status}
                            </span>
                          )}
                        </div>

                        <div
                          className={`text-[11px] truncate mt-0.5 ${
                            isSelected ? 'text-purple-200' : 'text-slate-500'
                          }`}
                        >
                          {teacher.specialization || teacher.department}
                          {teacher.subjectsTaught && teacher.subjectsTaught.length > 0 && (
                            <span className="ml-1 opacity-80">
                              • {teacher.subjectsTaught.slice(0, 2).join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-amber-300 shrink-0 ml-2" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
