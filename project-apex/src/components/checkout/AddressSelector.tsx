'use client';

import React, { useState } from 'react';
import { MapPin, Plus, CheckCircle2, Home } from 'lucide-react';

export interface Address {
  id: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string | null;
  isDefault: boolean;
  instructions?: string | null;
}

interface AddressSelectorProps {
  addresses: Address[];
  selectedAddressId: string | null;
  onSelectAddress: (address: Address) => void;
  onAddressCreated: (address: Address) => void;
}

export function AddressSelector({
  addresses,
  selectedAddressId,
  onSelectAddress,
  onAddressCreated,
}: AddressSelectorProps) {
  const [showAddForm, setShowAddForm] = useState(addresses.length === 0);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    instructions: '',
    isDefault: false,
  });

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.fullName.trim() || !formData.street.trim() || !formData.city.trim() || !formData.state.trim() || !formData.zipCode.trim()) {
      setFormError('Please fill in all required address fields.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          country: 'United States',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save address');
      }

      onAddressCreated(data.address);
      onSelectAddress(data.address);
      setShowAddForm(false);
      setFormData({
        fullName: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
        instructions: '',
        isDefault: false,
      });
    } catch (err: any) {
      setFormError(err.message || 'Error saving address');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-900 text-white text-sm font-bold">1</span>
          Select a delivery address
        </h2>
        {!showAddForm && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="text-sm text-cyan-700 hover:text-amber-600 font-medium flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add new address
          </button>
        )}
      </div>

      {addresses.length > 0 && !showAddForm && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => {
            const isSelected = selectedAddressId === addr.id;
            return (
              <div
                key={addr.id}
                onClick={() => onSelectAddress(addr)}
                className={`cursor-pointer rounded-lg border p-4 transition-all relative ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/30 ring-2 ring-amber-500/20'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={isSelected}
                      onChange={() => onSelectAddress(addr)}
                      className="text-amber-600 focus:ring-amber-500 h-4 w-4"
                    />
                    <span className="font-bold text-gray-900">{addr.fullName}</span>
                  </div>
                  {addr.isDefault && (
                    <span className="text-[11px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                      Default
                    </span>
                  )}
                </div>

                <div className="mt-2 text-sm text-gray-600 pl-6 space-y-0.5">
                  <p>{addr.street}</p>
                  <p>{addr.city}, {addr.state} {addr.zipCode}</p>
                  <p>{addr.country}</p>
                  {addr.phone && <p className="text-xs text-gray-500 mt-1">Phone: {addr.phone}</p>}
                </div>

                {isSelected && (
                  <div className="mt-3 pl-6">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Selected for Delivery
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleCreateAddress} className="mt-4 border-t pt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Home className="w-4 h-4 text-gray-600" />
              Add a new delivery address
            </h3>
            {addresses.length > 0 && (
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs text-gray-500 hover:text-gray-800"
              >
                Cancel
              </button>
            )}
          </div>

          {formError && (
            <div className="mb-4 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded p-2.5">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">Full Name (First and Last name) *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                placeholder="e.g. Alex Morgan"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">Street Address *</label>
              <input
                type="text"
                required
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                placeholder="Street address, P.O. box, company name, c/o"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                placeholder="City"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">State *</label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  placeholder="State (e.g. CA)"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ZIP Code *</label>
                <input
                  type="text"
                  required
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  placeholder="ZIP Code"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                placeholder="For delivery updates"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Delivery Instructions (Optional)</label>
              <input
                type="text"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                placeholder="e.g. Leave at side door, security gate code #1234"
              />
            </div>
          </div>

          <div className="mt-3 flex items-center">
            <input
              type="checkbox"
              id="isDefaultAddress"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <label htmlFor="isDefaultAddress" className="ml-2 text-xs text-gray-700">
              Use as my default delivery address
            </label>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-5 py-2 rounded-lg text-sm shadow-sm transition disabled:opacity-50"
            >
              {saving ? 'Saving Address...' : 'Use this address'}
            </button>
            {addresses.length > 0 && (
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium px-4 py-2 rounded-lg text-sm transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
