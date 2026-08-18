import React, { useState } from 'react';
import { EmergencyContact } from '../../types/schoolProfile';
import {
  PhoneCall,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  Search,
  X,
  Save,
  Radio,
  ExternalLink,
} from 'lucide-react';

interface EmergencyContactsTabProps {
  contacts: EmergencyContact[];
  onSaveContact: (contact: EmergencyContact) => Promise<void>;
  onDeleteContact: (id: string) => Promise<void>;
  canEdit: boolean;
}

export const EmergencyContactsTab: React.FC<EmergencyContactsTabProps> = ({
  contacts,
  onSaveContact,
  onDeleteContact,
  canEdit,
}) => {
  const [search, setSearch] = useState('');
  const [selectedContact, setSelectedContact] = useState<EmergencyContact | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<EmergencyContact | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formState, setFormState] = useState<Partial<EmergencyContact>>({
    serviceName: '',
    category: 'Police',
    contactPerson: '',
    telephone: '',
    alternativePhone: '',
    availableHours: '24/7 Emergency Service',
    isPrimary: false,
    address: '',
    notes: '',
  });

  const getContactName = (c?: Partial<EmergencyContact> | null) => c?.serviceName || c?.name || c?.designation || 'Emergency Contact';
  const getContactPhone = (c?: Partial<EmergencyContact> | null) => c?.telephone || c?.phone || '';
  const getContactCategory = (c?: Partial<EmergencyContact> | null) => c?.category || c?.designation || 'Emergency Desk';
  const getContactHours = (c?: Partial<EmergencyContact> | null) => c?.availableHours || c?.availability || '24/7 Service';

  const filteredContacts = (contacts || []).filter((c) => {
    if (!c) return false;
    const name = (c.serviceName || c.name || c.designation || '').toLowerCase();
    const cat = (c.category || c.designation || '').toLowerCase();
    const tel = (c.telephone || c.phone || '').toLowerCase();
    const person = (c.contactPerson || '').toLowerCase();
    const q = (search || '').toLowerCase().trim();
    if (!q) return true;
    return name.includes(q) || cat.includes(q) || tel.includes(q) || person.includes(q);
  });

  const handleOpenAddModal = () => {
    setSelectedContact(null);
    setFormState({
      id: `emg-${Date.now()}`,
      name: '',
      serviceName: '',
      category: 'Police',
      designation: 'Local Police Post (Bambalapitiya/Wellawatte)',
      contactPerson: '',
      telephone: '119',
      phone: '119',
      alternativePhone: '',
      availableHours: '24/7 Emergency Service',
      availability: '24/7 Hotline',
      isPrimary: false,
      address: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (contact: EmergencyContact) => {
    setSelectedContact(contact);
    setFormState({
      ...contact,
      serviceName: contact.serviceName || contact.name || contact.designation || '',
      name: contact.name || contact.serviceName || contact.designation || '',
      telephone: contact.telephone || contact.phone || '',
      phone: contact.phone || contact.telephone || '',
      category: contact.category || contact.designation || 'Emergency Service',
      availableHours: contact.availableHours || contact.availability || '24/7 Service',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    const chosenName = formState.serviceName?.trim() || formState.name?.trim() || formState.designation?.trim();
    const chosenPhone = formState.telephone?.trim() || formState.phone?.trim();

    if (!chosenName || !chosenPhone) {
      setNotification({ type: 'error', message: 'Service name and telephone are required.' });
      return;
    }

    setIsSaving(true);
    setNotification(null);

    try {
      const payload: EmergencyContact = {
        ...formState,
        id: formState.id || `emg-${Date.now()}`,
        name: chosenName,
        serviceName: chosenName,
        phone: chosenPhone,
        telephone: chosenPhone,
        category: formState.category || 'Emergency Service',
        designation: (formState.designation || chosenName) as any,
        email: formState.email || '',
        availableHours: formState.availableHours || '24/7 Service',
        availability: (formState.availability || '24/7 Hotline') as any,
        priority: (formState.priority || 'Critical') as any,
        isPrimary: Boolean(formState.isPrimary),
        isRestricted: Boolean(formState.isRestricted),
      } as EmergencyContact;

      await onSaveContact(payload);
      setIsModalOpen(false);
      setNotification({
        type: 'success',
        message: `Emergency contact ${chosenName} saved successfully!`,
      });
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      setNotification({ type: 'error', message: err?.message || 'Failed to save contact.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!contactToDelete || !canEdit) return;

    const delName = getContactName(contactToDelete);
    try {
      await onDeleteContact(contactToDelete.id);
      setNotification({
        type: 'success',
        message: `Removed ${delName} from emergency directory.`,
      });
      setTimeout(() => setNotification(null), 5000);
    } catch (err: any) {
      setNotification({ type: 'error', message: err?.message || 'Failed to delete contact.' });
    } finally {
      setContactToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-rose-600 font-bold text-xs uppercase tracking-wider mb-1">
            <PhoneCall className="w-4 h-4" />
            <span>Emergency Services & National Authority Dispatch</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold font-cinzel text-slate-900">
            Emergency Contacts & Crisis Hotlines
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official emergency hotlines for Police, Hospital, Fire, Child Protection Authority, and Campus Safety
          </p>
        </div>

        {canEdit && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center space-x-2 shadow-xs cursor-pointer transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Emergency Service</span>
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
          placeholder="Search emergency services, hotlines or stations..."
          className="w-full text-xs sm:text-sm text-slate-900 focus:outline-none bg-transparent"
        />
      </div>

      {/* Emergency Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            className={`bg-white rounded-2xl border p-6 shadow-xs hover:border-rose-300 transition-all flex flex-col justify-between ${
              contact.isPrimary ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-base shrink-0 ${
                      contact.isPrimary
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-[10px] uppercase tracking-wider rounded-md">
                      {getContactCategory(contact)}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-1">
                      {getContactName(contact)}
                    </h3>
                  </div>
                </div>

                {contact.isPrimary && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                    Primary SOS
                  </span>
                )}
              </div>

              {/* Number and Hours */}
              <div className="mt-4 space-y-2">
                <a
                  href={`tel:${getContactPhone(contact)}`}
                  className="flex items-center justify-between p-3 bg-slate-50 hover:bg-rose-50 rounded-xl border border-slate-200 hover:border-rose-300 text-rose-700 transition-all font-mono font-bold text-base sm:text-lg"
                >
                  <span>{getContactPhone(contact)}</span>
                  <PhoneCall className="w-4 h-4" />
                </a>

                {contact.alternativePhone && (
                  <div className="text-xs text-slate-500 font-mono flex items-center space-x-2 px-1">
                    <span>Alt:</span>
                    <span>{contact.alternativePhone}</span>
                  </div>
                )}

                <div className="flex items-center space-x-1.5 text-xs text-slate-600 pt-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{getContactHours(contact)}</span>
                </div>

                {contact.address && (
                  <div className="text-[11px] text-slate-500 pt-1">
                    {contact.address}
                  </div>
                )}

                {contact.notes && (
                  <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                    {contact.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {canEdit && (
              <div className="flex items-center justify-end space-x-2 pt-4 mt-4 border-t border-slate-100">
                <button
                  onClick={() => handleOpenEditModal(contact)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer transition-all"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setContactToDelete(contact)}
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
                {selectedContact ? 'Edit Emergency Service' : 'Add Emergency Hotline'}
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
                  Service / Station Name *
                </label>
                <input
                  type="text"
                  value={formState.serviceName || ''}
                  onChange={(e) => setFormState({ ...formState, serviceName: e.target.value })}
                  placeholder="e.g. National Child Protection Authority (NCPA)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-600"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={formState.category || 'Police'}
                    onChange={(e) => setFormState({ ...formState, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900"
                  >
                    <option value="Police">Police Department</option>
                    <option value="Hospital / Ambulance">Hospital / Ambulance</option>
                    <option value="Fire Department">Fire & Rescue</option>
                    <option value="Child Protection Authority">Child Protection Authority</option>
                    <option value="Disaster Management">Disaster Management</option>
                    <option value="School Safety Hotline">School Safety Hotline</option>
                    <option value="Other Emergency Service">Other Emergency Service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Person / Desk
                  </label>
                  <input
                    type="text"
                    value={formState.contactPerson || ''}
                    onChange={(e) => setFormState({ ...formState, contactPerson: e.target.value })}
                    placeholder="e.g. OIC Duty Officer"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Main Hotline *
                  </label>
                  <input
                    type="text"
                    value={formState.telephone || ''}
                    onChange={(e) => setFormState({ ...formState, telephone: e.target.value })}
                    placeholder="e.g. 1929"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Alternative Phone
                  </label>
                  <input
                    type="text"
                    value={formState.alternativePhone || ''}
                    onChange={(e) => setFormState({ ...formState, alternativePhone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Operating Hours
                  </label>
                  <input
                    type="text"
                    value={formState.availableHours || ''}
                    onChange={(e) => setFormState({ ...formState, availableHours: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="inline-flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formState.isPrimary || false}
                      onChange={(e) => setFormState({ ...formState, isPrimary: e.target.checked })}
                      className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                    />
                    <span className="text-xs font-bold text-slate-700">Set as Primary SOS</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Physical Location / Station Address
                </label>
                <input
                  type="text"
                  value={formState.address || ''}
                  onChange={(e) => setFormState({ ...formState, address: e.target.value })}
                  placeholder="e.g. Main Street, Batticaloa"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Protocol Notes & Dispatch Instructions
                </label>
                <textarea
                  rows={2}
                  value={formState.notes || ''}
                  onChange={(e) => setFormState({ ...formState, notes: e.target.value })}
                  placeholder="Direct emergency response team contact procedure..."
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
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow-xs disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Hotline'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {contactToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Remove Emergency Service?</h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Are you sure you want to remove{' '}
              <strong className="text-slate-900">{contactToDelete.serviceName}</strong> (
              {contactToDelete.telephone}) from the emergency contacts repository?
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setContactToDelete(null)}
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
