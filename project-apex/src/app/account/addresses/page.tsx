'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Plus, MapPin, Trash2, CheckCircle2, AlertCircle, ChevronRight, X } from 'lucide-react';

interface Address {
  id: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
  instructions?: string;
}

export default function AddressesPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [phone, setPhone] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login?callbackUrl=/account/addresses');
    } else if (session?.user) {
      fetchAddresses();
    }
  }, [session, isPending, router]);

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/user/addresses');
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFormSubmitting(true);

    try {
      const res = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          street,
          city,
          state,
          zipCode,
          phone,
          isDefault,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save address');
      }

      await fetchAddresses();
      setShowModal(false);
      // Reset form
      setFullName('');
      setStreet('');
      setCity('');
      setState('');
      setZipCode('');
      setPhone('');
      setIsDefault(false);
    } catch {
      setError('Unable to save address. Please check all fields and try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const res = await fetch(`/api/user/addresses?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      }
    } catch {
      alert('Failed to delete address.');
    }
  };

  if (isPending || !session?.user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f08804]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eaeded] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500">
          <Link href="/account" className="text-[#007185] hover:underline">Your Account</Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          <span className="text-gray-800 font-medium">Your Addresses</span>
        </nav>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Addresses</h1>
          <p className="text-xs text-gray-600 mt-1">
            Manage your delivery locations for orders and gifts.
          </p>
        </div>

        {/* Address Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Add Address Card */}
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="border-2 border-dashed border-gray-300 hover:border-gray-400 bg-white rounded-lg p-6 min-h-[220px] flex flex-col items-center justify-center text-center cursor-pointer group transition-colors shadow-2xs"
          >
            <div className="w-12 h-12 rounded-full bg-gray-50 group-hover:bg-[#fef0c7] flex items-center justify-center mb-2 transition-colors">
              <Plus className="w-6 h-6 text-gray-400 group-hover:text-[#f08804]" />
            </div>
            <span className="text-base font-bold text-gray-900 group-hover:text-[#007185]">
              Add Address
            </span>
          </button>

          {/* Existing Addresses */}
          {addresses.map((address) => (
            <div
              key={address.id}
              className="bg-white rounded-lg border border-gray-300 p-5 flex flex-col justify-between shadow-2xs relative"
            >
              <div>
                {address.isDefault && (
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200 pb-1 mb-2 w-full">
                    Default: <span className="text-[#007185]">Apex</span>
                  </span>
                )}
                <h2 className="text-sm font-bold text-gray-900 mb-1">
                  {address.fullName}
                </h2>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {address.street}
                </p>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {address.city}, {address.state} {address.zipCode}
                </p>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {address.country}
                </p>
                {address.phone && (
                  <p className="text-xs text-gray-500 mt-1">
                    Phone: {address.phone}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs mt-4">
                <span className="text-[#007185] hover:underline cursor-pointer">
                  Edit
                </span>
                <button
                  onClick={() => handleDeleteAddress(address.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors p-1 cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Address Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <h3 className="text-lg font-bold text-gray-900">Add a new address</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-xs text-red-800 rounded border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreateAddress} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-gray-900 mb-1">Full name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-400 rounded outline-none focus:border-[#e77600]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-900 mb-1">Street address</label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Street and house number, P.O. box"
                    required
                    className="w-full px-3 py-2 border border-gray-400 rounded outline-none focus:border-[#e77600]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-900 mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-400 rounded outline-none focus:border-[#e77600]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-900 mb-1">State / Province</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-400 rounded outline-none focus:border-[#e77600]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-900 mb-1">ZIP / Postal code</label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-400 rounded outline-none focus:border-[#e77600]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-900 mb-1">Phone number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="For delivery updates"
                      className="w-full px-3 py-2 border border-gray-400 rounded outline-none focus:border-[#e77600]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    id="isDefault"
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="rounded text-[#f08804] w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="isDefault" className="text-gray-800 cursor-pointer">
                    Make this my default address
                  </label>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="py-2 px-4 border border-gray-300 rounded-full font-semibold hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="py-2 px-5 bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-semibold rounded-full border border-[#fcd34d] cursor-pointer shadow-sm"
                  >
                    {formSubmitting ? 'Saving...' : 'Add address'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
