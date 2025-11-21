// app/profile/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { 
  fetchAddresses, 
  createAddress, 
  updateAddressAsync, 
  deleteAddressAsync, 
  setDefaultAddressAsync 
} from '@/redux/slices/addressSlice';
import { fetchUserProfile } from '@/redux/slices/userSlice';
import AddressForm from '@/components/AddressForm';
import { User, MapPin, Plus, Edit, Trash2, Star, Phone, Home, Mail, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading: authLoading } = useAppSelector(state => state.auth);
  const { addresses, loading: addressLoading, error } = useAppSelector(state => state.address);
  
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // Fetch user profile and addresses
    const loadData = async () => {
      try {
        await dispatch(fetchUserProfile()).unwrap();
        await dispatch(fetchAddresses()).unwrap();
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    
    loadData();
  }, [isAuthenticated, router, dispatch]);

  const handleAddAddress = async (addressData) => {
    try {
      await dispatch(createAddress(addressData)).unwrap();
      setShowAddressForm(false);
    } catch (error) {
      console.error('Failed to add address:', error);
    }
  };

  const handleEditAddress = async (addressData) => {
    try {
      await dispatch(updateAddressAsync({
        addressId: editingAddress.address_id,
        addressData
      })).unwrap();
      setEditingAddress(null);
    } catch (error) {
      console.error('Failed to update address:', error);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (confirm('Are you sure you want to delete this address?')) {
      try {
        await dispatch(deleteAddressAsync(addressId)).unwrap();
      } catch (error) {
        console.error('Failed to delete address:', error);
      }
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await dispatch(setDefaultAddressAsync(addressId)).unwrap();
    } catch (error) {
      console.error('Failed to set default address:', error);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const loading = authLoading || addressLoading;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your personal information and addresses</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{user?.full_name || 'User'}</h3>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition ${
                    activeTab === 'profile' 
                      ? 'bg-blue-50 text-blue-600 font-medium' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <User size={18} />
                  Personal Info
                </button>
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition ${
                    activeTab === 'addresses' 
                      ? 'bg-blue-50 text-blue-600 font-medium' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <MapPin size={18} />
                  Addresses
                  <span className="ml-auto bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {addresses.length}
                  </span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
                
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                        <User className="text-gray-400" size={20} />
                        <div>
                          <p className="text-sm text-gray-500">Full Name</p>
                          <p className="font-medium text-gray-900">
                            {user?.full_name || 'Not provided'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                        <Mail className="text-gray-400" size={20} />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium text-gray-900">{user?.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                        <Phone className="text-gray-400" size={20} />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium text-gray-900">
                            {user?.phone || 'Not provided'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                        <Calendar className="text-gray-400" size={20} />
                        <div>
                          <p className="text-sm text-gray-500">Member Since</p>
                          <p className="font-medium text-gray-900">
                            {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t">
                      <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                        Edit Profile
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Add Address Button */}
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">My Addresses</h2>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    <Plus size={18} />
                    Add New Address
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Addresses Grid */}
                {addressLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                      <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <MapPin className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses yet</h3>
                    <p className="text-gray-500 mb-6">Add your first address to get started</p>
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      Add Your First Address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                      <div
                        key={address.address_id}
                        className={`bg-white rounded-xl shadow-sm p-6 border-2 ${
                          address.is_default ? 'border-blue-500' : 'border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <Home size={18} className="text-gray-400" />
                            <span className="font-medium text-gray-900 capitalize">
                              {address.address_type} Address
                            </span>
                            {address.is_default && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                                <Star size={12} fill="currentColor" />
                                Default
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingAddress(address)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address.address_id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Phone size={14} />
                            <span>{address.phone}</span>
                          </div>
                          <p>{address.address_line1}</p>
                          <p>Landmark: {address.landmark}</p>
                          <p>
                            {address.city} - {address.postal_code}
                          </p>
                        </div>

                        {!address.is_default && (
                          <div className="mt-4 pt-4 border-t">
                            <button
                              onClick={() => handleSetDefault(address.address_id)}
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Set as Default
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Address Form Modal */}
      {(showAddressForm || editingAddress) && (
        <AddressForm
          address={editingAddress}
          onSave={editingAddress ? handleEditAddress : handleAddAddress}
          onCancel={() => {
            setShowAddressForm(false);
            setEditingAddress(null);
          }}
          loading={addressLoading}
        />
      )}
    </div>
  );
}