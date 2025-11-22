// app/profile/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { 
  fetchAddresses, 
  createAddress, 
  updateAddressAsync, 
  deleteAddressAsync, 
  setDefaultAddressAsync 
} from '@/redux/slices/addressSlice';
import { 
  fetchUserProfile, 
  updateUserProfileAsync,
  uploadProfileImageAsync 
} from '@/redux/slices/userSlice';
import AddressForm from '@/components/AddressForm';
import UserEditForm from '@/components/UserEditForm';
import { User, MapPin, Plus, Edit, Trash2, Star, Phone, Home, Mail, Calendar, Camera, Menu, X } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading: userLoading, error: userError } = useAppSelector(state => state.user);
  const { addresses, loading: addressLoading, error: addressError } = useAppSelector(state => state.address);
  
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showUserEditForm, setShowUserEditForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    const loadData = async () => {
      try {
        await dispatch(fetchUserProfile()).unwrap();
        await dispatch(fetchAddresses()).unwrap();
      } catch (error) {
        console.error('Failed to load data:', error);
        if (error.message.includes('401') || error.message.includes('token')) {
          localStorage.removeItem('token');
          router.push('/login');
        }
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

  const handleUpdateUser = async (userData) => {
    try {
      await dispatch(updateUserProfileAsync(userData)).unwrap();
      setShowUserEditForm(false);
    } catch (error) {
      console.error('Failed to update user profile:', error);
    }
  };

  const handleUploadProfileImage = async (imageFile) => {
    try {
      await dispatch(uploadProfileImageAsync(imageFile)).unwrap();
      await dispatch(fetchUserProfile()).unwrap();
    } catch (error) {
      console.error('Failed to upload profile image:', error);
      throw error;
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  const loading = userLoading || addressLoading;

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Mobile Header */}
        <div className="md:hidden mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg bg-white shadow-sm"
            >
              <Menu size={20} />
            </button>
            
            <div className="text-center flex-1 mx-4">
              <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
            </div>
            
            <div className="w-8"></div> {/* Spacer for balance */}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          {/* Mobile Menu Overlay */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                  onClick={() => setMobileMenuOpen(false)}
                />
                <motion.div
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                  className="fixed left-0 top-0 bottom-0 w-80 bg-white z-50 md:hidden p-6 overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-lg font-semibold">Menu</h2>
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="p-2 rounded-lg hover:bg-gray-100"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  
                  {/* Mobile Profile Summary */}
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                    <div className="relative">
                      {user?.profile_image ? (
                        <img 
                          src={user.profile_image} 
                          alt="Profile" 
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="text-blue-600" size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{user?.full_name || 'User'}</h3>
                      <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="space-y-2">
                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition ${
                        activeTab === 'profile' 
                          ? 'bg-blue-50 text-blue-600 font-medium' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <User size={20} />
                      Personal Info
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('addresses');
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition ${
                        activeTab === 'addresses' 
                          ? 'bg-blue-50 text-blue-600 font-medium' 
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <MapPin size={20} />
                      Addresses
                      <span className="ml-auto bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                        {addresses?.length || 0}
                      </span>
                    </button>
                  </nav>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Desktop Sidebar */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                <div className="relative">
                  {user?.profile_image ? (
                    <img 
                      src={user.profile_image} 
                      alt="Profile" 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="text-blue-600" size={24} />
                    </div>
                  )}
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
                    {addresses?.length || 0}
                  </span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Mobile Tab Switcher */}
            <div className="md:hidden mb-6">
              <div className="bg-white rounded-xl shadow-sm p-1 flex">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex-1 py-3 px-4 text-center rounded-lg transition ${
                    activeTab === 'profile'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Personal Info
                </button>
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`flex-1 py-3 px-4 text-center rounded-lg transition ${
                    activeTab === 'addresses'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Addresses
                </button>
              </div>
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm p-4 md:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900">Personal Information</h2>
                  <button
                    onClick={() => setShowUserEditForm(true)}
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm md:text-base"
                  >
                    Edit Profile
                  </button>
                </div>
                
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
                    {/* Profile Image - Mobile Optimized */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          {user?.profile_image ? (
                            <img 
                              src={user.profile_image} 
                              alt="Profile" 
                              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="text-blue-600" size={24} />
                            </div>
                          )}
                        </div>
                        <div className="sm:hidden">
                          <h3 className="font-medium text-gray-900">Profile Photo</h3>
                          <p className="text-sm text-gray-500">
                            {user?.profile_image ? 'Update photo' : 'Add photo'}
                          </p>
                        </div>
                      </div>
                      <div className="hidden sm:block flex-1">
                        <h3 className="font-medium text-gray-900">Profile Photo</h3>
                        <p className="text-sm text-gray-500">
                          {user?.profile_image ? 'Update your profile photo' : 'Add a profile photo'}
                        </p>
                      </div>
                    </div>

                    {/* Info Grid - Stack on mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                      <InfoCard
                        icon={<User size={18} className="text-gray-400" />}
                        label="Full Name"
                        value={user?.full_name || 'Not provided'}
                      />
                      
                      <InfoCard
                        icon={<Mail size={18} className="text-gray-400" />}
                        label="Email"
                        value={user?.email}
                      />
                      
                      <InfoCard
                        icon={<Phone size={18} className="text-gray-400" />}
                        label="Phone"
                        value={user?.phone || 'Not provided'}
                      />

                      {user?.gender && (
                        <InfoCard
                          icon={<User size={18} className="text-gray-400" />}
                          label="Gender"
                          value={user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}
                        />
                      )}

                      {user?.date_of_birth && (
                        <InfoCard
                          icon={<Calendar size={18} className="text-gray-400" />}
                          label="Date of Birth"
                          value={new Date(user.date_of_birth).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        />
                      )}
                      
                      <InfoCard
                        icon={<Calendar size={18} className="text-gray-400" />}
                        label="Member Since"
                        value={user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'N/A'}
                      />
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Header with Add Button */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900">My Addresses</h2>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm md:text-base"
                  >
                    <Plus size={18} />
                    Add New Address
                  </button>
                </div>

                {/* Error Message */}
                {addressError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {addressError}
                  </div>
                )}

                {/* Addresses List */}
                {addressLoading ? (
                  <div className="grid grid-cols-1 gap-4 md:gap-6">
                    {[1, 2].map((i) => (
                      <div key={i} className="bg-white rounded-xl shadow-sm p-4 md:p-6 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 rounded"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !addresses || addresses.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm p-8 md:p-12 text-center">
                    <MapPin className="mx-auto text-gray-400 mb-4" size={40} />
                    <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">No addresses yet</h3>
                    <p className="text-gray-500 mb-6 text-sm md:text-base">Add your first address to get started</p>
                    <button
                      onClick={() => setShowAddressForm(true)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm md:text-base"
                    >
                      Add Your First Address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:gap-6">
                    {addresses.map((address) => (
                      <AddressCard
                        key={address.address_id}
                        address={address}
                        onEdit={() => setEditingAddress(address)}
                        onDelete={() => handleDeleteAddress(address.address_id)}
                        onSetDefault={() => handleSetDefault(address.address_id)}
                      />
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

      {/* User Edit Form Modal */}
      {showUserEditForm && (
        <UserEditForm
          user={user}
          onSave={handleUpdateUser}
          onUploadImage={handleUploadProfileImage}
          onCancel={() => setShowUserEditForm(false)}
          loading={userLoading}
        />
      )}
    </div>
  );
}

// Reusable Info Card Component
const InfoCard = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 p-3 md:p-4 border border-gray-200 rounded-lg">
    {icon}
    <div className="min-w-0 flex-1">
      <p className="text-xs md:text-sm text-gray-500">{label}</p>
      <p className="font-medium text-gray-900 text-sm md:text-base truncate">
        {value}
      </p>
    </div>
  </div>
);

// Reusable Address Card Component
const AddressCard = ({ address, onEdit, onDelete, onSetDefault }) => (
  <div
    className={`bg-white rounded-xl shadow-sm p-4 md:p-6 border-2 ${
      address.is_default ? 'border-blue-500' : 'border-transparent'
    }`}
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Home size={16} className="text-gray-400 flex-shrink-0" />
        <span className="font-medium text-gray-900 capitalize text-sm md:text-base truncate">
          {address.address_type} Address
        </span>
        {address.is_default && (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full flex-shrink-0">
            <Star size={10} fill="currentColor" />
            Default
          </span>
        )}
      </div>
      <div className="flex gap-1 ml-2">
        <button
          onClick={onEdit}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
        >
          <Edit size={14} />
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>

    <div className="space-y-2 text-xs md:text-sm text-gray-600">
      <div className="flex items-center gap-2">
        <Phone size={12} className="flex-shrink-0" />
        <span className="truncate">{address.phone}</span>
      </div>
      <p className="break-words">{address.address_line1}</p>
      {address.address_line2 && <p className="break-words">{address.address_line2}</p>}
      {address.landmark && <p className="break-words">Landmark: {address.landmark}</p>}
      <p className="break-words">
        {address.city}, {address.state} - {address.postal_code}
      </p>
      <p className="break-words">{address.country}</p>
    </div>

    {!address.is_default && (
      <div className="mt-4 pt-4 border-t">
        <button
          onClick={onSetDefault}
          className="text-xs md:text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Set as Default
        </button>
      </div>
    )}
  </div>
);