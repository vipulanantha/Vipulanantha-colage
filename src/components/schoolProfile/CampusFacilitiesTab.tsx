import React, { useState } from 'react';
import { CampusFacility } from '../../types/schoolProfile';
import {
  Building,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Users,
  Search,
  X,
  Save,
  Layers,
  Sparkles,
} from 'lucide-react';

interface CampusFacilitiesTabProps {
  facilities: CampusFacility[];
  onSaveFacility: (facility: CampusFacility) => Promise<void>;
  onDeleteFacility: (id: string) => Promise<void>;
  canEdit: boolean;
}

export const CampusFacilitiesTab: React.FC<CampusFacilitiesTabProps> = ({
  facilities,
  onSaveFacility,
  onDeleteFacility,
  canEdit,
}) => {
  const [search, setSearch] = useState('');
  const [selectedFacility, setSelectedFacility] = useState<CampusFacility | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [facilityToDelete, setFacilityToDelete] = useState<CampusFacility | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formState, setFormState] = useState<Partial<CampusFacility>>({
    facilityName: '',
    category: 'Classroom Block',
    unitCount: 1,
    capacity: 50,
    status: 'Operational',
    equipmentDetails: '',
    managedBy: '',
  });

  const getFacilityName = (f?: Partial<CampusFacility> | null) => f?.facilityName || f?.name || 'Campus Facility';
  const getFacilityManager = (f?: Partial<CampusFacility> | null) => f?.managedBy || f?.responsibleStaff || '';

  const filteredFacilities = (facilities || []).filter((f) => {
    if (!f) return false;
    const name = (f.facilityName || f.name || '').toLowerCase();
    const cat = (f.category || '').toLowerCase();
    const mgr = (f.managedBy || f.responsibleStaff || '').toLowerCase();
    const desc = (f.description || f.equipmentDetails || '').toLowerCase();
    const q = (search || '').toLowerCase().trim();
    if (!q) return true;
    return name.includes(q) || cat.includes(q) || mgr.includes(q) || desc.includes(q);
  });

  const handleOpenAddModal = () => {
    setSelectedFacility(null);
    setFormState({
      id: `fac-${Date.now()}`,
      name: '',
      facilityName: '',
      category: 'Science & Computer Labs',
      unitCount: 1,
      capacity: 45,
      status: 'Operational',
      equipmentDetails: '',
      managedBy: 'Head of Science',
      responsibleStaff: 'Head of Science',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (facility: CampusFacility) => {
    setSelectedFacility(facility);
    setFormState({
      ...facility,
      facilityName: facility.facilityName || facility.name || '',
      name: facility.name || facility.facilityName || '',
      managedBy: facility.managedBy || facility.responsibleStaff || '',
      responsibleStaff: facility.responsibleStaff || facility.managedBy || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    const chosenName = formState.facilityName?.trim() || formState.name?.trim();
    if (!chosenName) {
      setNotification({ type: 'error', message: 'Facility name is required.' });
      return;
    }

    setIsSaving(true);
    setNotification(null);

    try {
      const payload: CampusFacility = {
        ...formState,
        id: formState.id || `fac-${Date.now()}`,
        name: chosenName,
        facilityName: chosenName,
        category: formState.category || 'Classroom Block',
        managedBy: formState.managedBy || formState.responsibleStaff || '',
        responsibleStaff: formState.responsibleStaff || formState.managedBy || '',
        status: formState.status || 'Operational',
        unitCount: formState.unitCount ?? 1,
        capacity: formState.capacity ?? 40,
        features: formState.features || [],
      } as CampusFacility;

      await onSaveFacility(payload);
      setIsModalOpen(false);
      setNotification({
        type: 'success',
        message: `${chosenName} saved to campus inventory!`,
      });
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      setNotification({ type: 'error', message: err?.message || 'Failed to save facility.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!facilityToDelete || !canEdit) return;

    const delName = getFacilityName(facilityToDelete);
    try {
      await onDeleteFacility(facilityToDelete.id);
      setNotification({
        type: 'success',
        message: `Removed ${delName} from campus inventory.`,
      });
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      setNotification({ type: 'error', message: err?.message || 'Failed to delete facility.' });
    } finally {
      setFacilityToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-purple-900 font-bold text-xs uppercase tracking-wider mb-1">
            <Building className="w-4 h-4 text-purple-700" />
            <span>Infrastructure & Campus Assets</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-cinzel text-slate-900">
            Campus Infrastructure, Laboratories & Grounds
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track laboratories, smart classrooms, ICT centers, libraries, athletic grounds, and shrines
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-purple-900 hover:bg-purple-950 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xs cursor-pointer transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Add Facility Unit</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs sm:text-sm shadow-xs ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs underline font-bold ml-3 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center bg-white rounded-2xl border border-slate-200 px-4 py-2.5 shadow-xs max-w-md">
        <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search classrooms, laboratories, sports grounds..."
          className="w-full text-xs sm:text-sm text-slate-900 focus:outline-none bg-transparent"
        />
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFacilities.map((facility) => (
          <div
            key={facility.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-block px-2.5 py-0.5 bg-purple-50 text-purple-950 font-bold text-[10px] uppercase tracking-wider rounded-md border border-purple-200">
                    {facility.category}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-1.5">
                    {getFacilityName(facility)}
                  </h3>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    (facility.status || 'Operational') === 'Operational'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : facility.status === 'Under Maintenance'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  }`}
                >
                  {facility.status || 'Operational'}
                </span>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 my-3 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Units / Rooms</div>
                  <div className="font-extrabold text-slate-800 text-sm">{facility.unitCount ?? 1}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Capacity</div>
                  <div className="font-extrabold text-slate-800 text-sm">{facility.capacity ?? 50} Persons</div>
                </div>
              </div>

              {(facility.equipmentDetails || facility.description) && (
                <div className="text-xs text-slate-600 bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                  <strong className="text-slate-800">Details:</strong> {facility.equipmentDetails || facility.description}
                </div>
              )}

              {getFacilityManager(facility) && (
                <div className="text-[11px] text-slate-500 mt-2">
                  Officer in-charge: <strong className="text-slate-700">{getFacilityManager(facility)}</strong>
                </div>
              )}
            </div>

            {/* Actions */}
            {canEdit && (
              <div className="flex items-center justify-end space-x-2 pt-4 mt-4 border-t border-slate-100">
                <button
                  onClick={() => handleOpenEditModal(facility)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer transition-all"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setFacilityToDelete(facility)}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-cinzel font-bold text-lg text-slate-900">
                {selectedFacility ? 'Edit Campus Facility' : 'Add Campus Facility'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Facility Name *
                </label>
                <input
                  type="text"
                  value={formState.facilityName || ''}
                  onChange={(e) => setFormState({ ...formState, facilityName: e.target.value })}
                  placeholder="e.g. Advanced Chemistry Lab (A/L)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={formState.category || 'Classroom Block'}
                    onChange={(e) => setFormState({ ...formState, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900"
                  >
                    <option value="Classroom Block">Classroom Block</option>
                    <option value="Science Laboratory">Science Laboratory</option>
                    <option value="Computer Lab / ICT Center">Computer Lab / ICT Center</option>
                    <option value="Library & Resource Center">Library & Resource Center</option>
                    <option value="Sports Grounds / Pavilion">Sports Grounds / Pavilion</option>
                    <option value="Auditorium / Main Hall">Auditorium / Main Hall</option>
                    <option value="Medical / First Aid Room">Medical / First Aid Room</option>
                    <option value="Prayer Hall / Temple / Shrine">Prayer Hall / Shrine</option>
                    <option value="Staff Room / Administrative Office">Staff Room / Admin Office</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={formState.status || 'Operational'}
                    onChange={(e) => setFormState({ ...formState, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900"
                  >
                    <option value="Operational">Operational</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Scheduled Upgrade">Scheduled Upgrade</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Units / Rooms Count
                  </label>
                  <input
                    type="number"
                    value={formState.unitCount || 1}
                    onChange={(e) => setFormState({ ...formState, unitCount: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Student Capacity
                  </label>
                  <input
                    type="number"
                    value={formState.capacity || 40}
                    onChange={(e) => setFormState({ ...formState, capacity: parseInt(e.target.value) || 40 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Officer In-Charge / Custodian
                </label>
                <input
                  type="text"
                  value={formState.managedBy || ''}
                  onChange={(e) => setFormState({ ...formState, managedBy: e.target.value })}
                  placeholder="e.g. Mr. K. Kumar (Lab Attendant)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Equipment, Assets & Safety Amenities
                </label>
                <textarea
                  rows={2}
                  value={formState.equipmentDetails || ''}
                  onChange={(e) => setFormState({ ...formState, equipmentDetails: e.target.value })}
                  placeholder="e.g. 50 Dell Optiplex PCs, Smart Interactive Panel, Fiber 100Mbps..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-xs disabled:opacity-50"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  <span>{isSaving ? 'Saving...' : 'Save Facility'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {facilityToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Remove Facility?</h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Are you sure you want to remove{' '}
              <strong className="text-slate-900">{facilityToDelete.facilityName}</strong> from the campus inventory?
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setFacilityToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
              >
                Confirm Removal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
