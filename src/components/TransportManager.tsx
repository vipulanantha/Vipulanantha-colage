import React, { useState } from 'react';
import { TransportRoute } from '../types/sms';
import { Bus, Plus, Search, MapPin, Phone, Users, Clock, AlertCircle, X } from 'lucide-react';

interface TransportManagerProps {
  routes: TransportRoute[];
  onAddRoute: (route: Omit<TransportRoute, 'id'>) => void;
  canEdit: boolean;
}

export const TransportManager: React.FC<TransportManagerProps> = ({
  routes,
  onAddRoute,
  canEdit,
}) => {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [busNumber, setBusNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [routeTitle, setRouteTitle] = useState('');
  const [pickupStops, setPickupStops] = useState('');
  const [capacity, setCapacity] = useState(40);
  const [departureMorning, setDepartureMorning] = useState('06:45 AM');
  const [departureAfternoon, setDepartureAfternoon] = useState('02:00 PM');

  const filteredRoutes = routes.filter(
    (r) =>
      r.busNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.driverName.toLowerCase().includes(search.toLowerCase()) ||
      r.routeTitle.toLowerCase().includes(search.toLowerCase())
  );

  const totalBuses = routes.length;
  const totalRiders = routes.reduce((acc, r) => acc + r.studentsCount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!busNumber.trim() || !driverName.trim() || !routeTitle.trim()) return;

    onAddRoute({
      busNumber: busNumber.trim(),
      driverName: driverName.trim(),
      driverPhone: driverPhone.trim() || '+94 77 000 0000',
      routeTitle: routeTitle.trim(),
      pickupStops: pickupStops
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      vehicleCapacity: Number(capacity),
      studentsCount: 0,
      departureMorning,
      departureAfternoon,
      status: 'On Route',
    });

    setBusNumber('');
    setDriverName('');
    setRouteTitle('');
    setPickupStops('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 font-cinzel flex items-center space-x-2">
            <span>School Bus & Transport Fleet Management</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 font-sans font-semibold">
              {routes.length} Active Bus Routes
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Colombo metropolitan routes, bus stops, driver logistics & student rosters
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2A0845] to-[#3B185F] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>+ Add Transport Route</span>
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase">Active Fleet</div>
          <div className="text-2xl font-bold text-slate-900 mt-0.5">{totalBuses} College Buses</div>
          <div className="text-[11px] text-emerald-600 font-medium">GPS Tracking Active</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-purple-900 font-semibold uppercase">Daily Student Commuters</div>
          <div className="text-2xl font-bold text-purple-900 mt-0.5">{totalRiders} Students</div>
          <div className="text-[11px] text-slate-500 font-medium">Enrolled in Bus Service</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-emerald-700 font-semibold uppercase">Fleet Status</div>
          <div className="text-2xl font-bold text-emerald-700 mt-0.5">100% Operational</div>
          <div className="text-[11px] text-slate-500 font-medium">All Safety Checks Passed</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-amber-700 font-semibold uppercase">Morning Departure</div>
          <div className="text-2xl font-bold text-amber-700 mt-0.5">06:30 AM</div>
          <div className="text-[11px] text-slate-500 font-medium">On-Time Arrival: 07:15 AM</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search bus number, driver, or route..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-900 transition-all shadow-xs"
        />
      </div>

      {/* Grid of Transport Routes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredRoutes.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 flex items-center space-x-1">
                  <Bus className="w-3.5 h-3.5 text-purple-700" />
                  <span>{r.busNumber}</span>
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {r.status}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm mt-1">{r.routeTitle}</h3>

              <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-1 text-slate-500">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Driver: <strong className="text-slate-800">{r.driverName}</strong></span>
                  </span>
                  <a href={`tel:${r.driverPhone}`} className="text-purple-700 font-semibold flex items-center space-x-1">
                    <Phone className="w-3 h-3" />
                    <span>{r.driverPhone}</span>
                  </a>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block mb-1">Pick-up Points & Stops:</span>
                  <div className="flex flex-wrap gap-1">
                    {r.pickupStops.map((stop, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] flex items-center space-x-0.5">
                        <MapPin className="w-2.5 h-2.5 text-purple-600" />
                        <span>{stop}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-2 rounded-lg flex items-center justify-between text-[11px] text-slate-600">
                  <span>Enrolled: <strong>{r.studentsCount} / {r.vehicleCapacity}</strong> Students</span>
                  <span className="text-purple-900 font-semibold">Departs: {r.departureMorning}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
              <span className="text-[11px] text-emerald-700 font-semibold">Live GPS Telemetry Connected</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Route Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-purple-100 overflow-hidden my-auto p-5 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Bus className="w-5 h-5 text-purple-900" />
                <h3 className="text-base font-bold text-slate-900 font-cinzel">Register Bus Route</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bus Vehicle Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WP NA-4521 (Bus #04)"
                  value={busNumber}
                  onChange={(e) => setBusNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Route Title & Neighborhoods *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Moratuwa - Ratmalana - Wellawatte"
                  value={routeTitle}
                  onChange={(e) => setRouteTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Driver Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mr. P. Murugesapillai"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Driver Phone</label>
                  <input
                    type="text"
                    placeholder="+94 77 123 4567"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Stops & Pick-up Points (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Stop 1, Stop 2, College Gate"
                  value={pickupStops}
                  onChange={(e) => setPickupStops(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Morning Dep.</label>
                  <input
                    type="text"
                    value={departureMorning}
                    onChange={(e) => setDepartureMorning(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Capacity</label>
                  <input
                    type="number"
                    min={15}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
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
                  Register Bus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
