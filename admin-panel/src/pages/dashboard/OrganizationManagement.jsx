import React, { useState, useEffect } from "react";
import { Building2, Edit2, Trash2, X, Plus, Upload, Loader2, Eye, Users, FileText, Phone, MapPin, Percent, UserPlus } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";

const OrganizationManagement = () => {
  const [organizations, setOrganizations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingOrgs, setFetchingOrgs] = useState(true);
  const [users, setUsers] = useState([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  
  const [formData, setFormData] = useState({
    org_name: "",
    gst_number: "",
    gst_type: "NONE",
    gst_percentage: "",
    address: "",
    contact_person_name: "",
    primary_phone: "",
    secondary_phone: "",
    logo: null
  });

  // New user form data for adding user to organization
  const [newUserForm, setNewUserForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "employee",
    base_salary: "",
    date_of_birth: "",
    gender: ""
  });

  const navigate = useNavigate();
  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    fetchOrganizations();
    fetchUsersForSelect();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setFetchingOrgs(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/organizations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations || data);
      } else {
        toast.error("Failed to fetch organizations");
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast.error("Error loading organizations");
    } finally {
      setFetchingOrgs(false);
    }
  };

  const fetchUsersForSelect = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNewUserInputChange = (e) => {
    const { name, value } = e.target;
    setNewUserForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      
      setFormData(prev => ({ ...prev, logo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      org_name: "",
      gst_number: "",
      gst_type: "NONE",
      gst_percentage: "",
      address: "",
      contact_person_name: "",
      primary_phone: "",
      secondary_phone: "",
      logo: null
    });
    setPreviewImage(null);
    setEditingOrg(null);
  };

  const resetNewUserForm = () => {
    setNewUserForm({
      full_name: "",
      email: "",
      phone: "",
      role: "employee",
      base_salary: "",
      date_of_birth: "",
      gender: ""
    });
  };

  const openModal = (org = null) => {
    if (org) {
      setEditingOrg(org);
      setFormData({
        org_name: org.org_name || "",
        gst_number: org.gst_number || "",
        gst_type: org.gst_type || "NONE",
        gst_percentage: org.gst_percentage || "",
        address: org.address || "",
        contact_person_name: org.contact_person_name || "",
        primary_phone: org.primary_phone || "",
        secondary_phone: org.secondary_phone || "",
        logo: null
      });
      setPreviewImage(org.org_logo || null);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const openAddUserModal = (org) => {
    setSelectedOrg(org);
    setIsAddUserModalOpen(true);
  };

  const openDetailModal = async (org) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/organizations/${org.org_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedOrg({
          ...data.organization,
          users: data.users || []
        });
        setIsDetailModalOpen(true);
      } else {
        toast.error("Failed to fetch organization details");
      }
    } catch (error) {
      console.error('Error fetching organization details:', error);
      toast.error("Error loading details");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const closeAddUserModal = () => {
    setIsAddUserModalOpen(false);
    setSelectedOrg(null);
    resetNewUserForm();
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedOrg(null);
  };

  const validateForm = () => {
    if (!formData.org_name.trim()) {
      toast.error("Organization name is required");
      return false;
    }
    if (!formData.contact_person_name.trim()) {
      toast.error("Contact person name is required");
      return false;
    }
    if (!formData.primary_phone.trim()) {
      toast.error("Primary phone is required");
      return false;
    }
    if (formData.gst_type !== "NONE" && !formData.gst_number.trim()) {
      toast.error("GST number is required when GST type is selected");
      return false;
    }
    if (formData.gst_type !== "NONE" && !formData.gst_percentage) {
      toast.error("GST percentage is required when GST type is selected");
      return false;
    }
    return true;
  };

  const validateNewUserForm = () => {
    if (!newUserForm.full_name.trim()) {
      toast.error("Full name is required");
      return false;
    }
    if (!newUserForm.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserForm.email)) {
      toast.error("Please enter a valid email");
      return false;
    }
    if (!newUserForm.phone.trim()) {
      toast.error("Phone number is required");
      return false;
    }
    if (!newUserForm.base_salary || parseFloat(newUserForm.base_salary) < 0) {
      toast.error("Please enter a valid base salary");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (editingOrg) {
        await updateOrganization(editingOrg.org_id);
      } else {
        await addOrganization();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("Operation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateNewUserForm()) return;

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('full_name', newUserForm.full_name);
      submitData.append('email', newUserForm.email);
      submitData.append('phone', newUserForm.phone);
      submitData.append('role', newUserForm.role);
      submitData.append('base_salary', newUserForm.base_salary);
      submitData.append('org_id', selectedOrg.org_id);
      
      if (newUserForm.date_of_birth) {
        submitData.append('date_of_birth', newUserForm.date_of_birth);
      }
      if (newUserForm.gender) {
        submitData.append('gender', newUserForm.gender);
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/admin/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });
      
      const data = await response.json();

      if (response.ok) {
        toast.success(`User added successfully to ${selectedOrg.org_name}`);
        closeAddUserModal();
        fetchOrganizations();
        fetchUsersForSelect();
      } else {
        toast.error(data.message || data.errors?.[0]?.msg || "Failed to add user");
      }
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addOrganization = async () => {
    try {
      const submitData = new FormData();
      submitData.append('org_name', formData.org_name);
      submitData.append('contact_person_name', formData.contact_person_name);
      submitData.append('primary_phone', formData.primary_phone);
      submitData.append('gst_type', formData.gst_type);
      
      if (formData.gst_number) {
        submitData.append('gst_number', formData.gst_number);
      }
      if (formData.gst_percentage) {
        submitData.append('gst_percentage', formData.gst_percentage);
      }
      if (formData.address) {
        submitData.append('address', formData.address);
      }
      if (formData.secondary_phone) {
        submitData.append('secondary_phone', formData.secondary_phone);
      }
      if (formData.logo) {
        submitData.append('logo', formData.logo);
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/organizations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });
      
      const data = await response.json();

      if (response.ok) {
        toast.success("Organization added successfully");
        closeModal();
        fetchOrganizations();
      } else {
        toast.error(data.message || "Failed to add organization");
      }
    } catch (error) {
      console.error('Error adding organization:', error);
      toast.error("Network error. Please try again.");
    }
  };

  const updateOrganization = async (orgId) => {
    try {
      const submitData = new FormData();
      submitData.append('org_name', formData.org_name);
      submitData.append('contact_person_name', formData.contact_person_name);
      submitData.append('primary_phone', formData.primary_phone);
      submitData.append('gst_type', formData.gst_type);
      
      if (formData.gst_number) {
        submitData.append('gst_number', formData.gst_number);
      }
      if (formData.gst_percentage) {
        submitData.append('gst_percentage', formData.gst_percentage);
      }
      if (formData.address) {
        submitData.append('address', formData.address);
      }
      if (formData.secondary_phone) {
        submitData.append('secondary_phone', formData.secondary_phone);
      }
      if (formData.logo) {
        submitData.append('logo', formData.logo);
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/organizations/${orgId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Organization updated successfully");
        closeModal();
        fetchOrganizations();
      } else {
        toast.error(data.message || "Failed to update organization");
      }
    } catch (error) {
      console.error('Error updating organization:', error);
      toast.error("Network error. Please try again.");
    }
  };

  const handleDelete = async (orgId) => {
    if (!window.confirm("Are you sure you want to delete this organization?")) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/organizations/${orgId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Organization deleted successfully");
        fetchOrganizations();
      } else {
        toast.error(data.message || "Failed to delete organization");
      }
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast.error("Network error. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Stats Card */}
      <div className="mb-8 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="relative flex flex-col bg-clip-border rounded-xl bg-white text-gray-700 shadow-md">
          <div className="bg-clip-border mx-4 rounded-xl overflow-hidden bg-gradient-to-tr from-purple-600 to-purple-400 text-white shadow-purple-500/40 shadow-lg absolute -mt-4 grid h-16 w-16 place-items-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div className="p-6 text-right">
            <p className="text-sm text-gray-600 font-medium">Total Organizations</p>
            <h4 className="text-3xl font-bold text-gray-900">{organizations.length}</h4>
          </div>
        </div>
      </div>

      {/* Organization Management Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Organization Management</h2>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Organization
          </button>
        </div>

        {fetchingOrgs ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : organizations.length === 0 ? (
          <div className="text-center p-12 text-gray-500">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No organizations found</p>
            <p className="text-sm">Click "Add Organization" to create your first organization</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Logo</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Organization</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Contact Person</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">GST Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">GST %</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Total Users</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {organizations.map((org) => (
                  <tr key={org.org_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {org.org_logo ? (
                        <img src={org.org_logo} alt={org.org_name} className="w-12 h-12 rounded-lg object-cover border" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-purple-600" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{org.org_name}</div>
                        {org.gst_number && (
                          <div className="text-sm text-gray-500">{org.gst_number}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {org.contact_person_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      <div>{org.primary_phone}</div>
                      {org.secondary_phone && (
                        <div className="text-sm text-gray-500">{org.secondary_phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        org.gst_type === 'CGST_SGST' ? 'bg-green-100 text-green-800' :
                        org.gst_type === 'IGST' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {org.gst_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-medium">
                      {org.gst_percentage > 0 ? `${org.gst_percentage}%` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{org.total_users || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openDetailModal(org)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openAddUserModal(org)}
                          className="text-green-600 hover:text-green-800 transition-colors"
                          title="Add User to Organization"
                        >
                          <UserPlus className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openModal(org)}
                          className="text-yellow-600 hover:text-yellow-800 transition-colors"
                          title="Edit Organization"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(org.org_id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete Organization"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Organization Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingOrg ? "Edit Organization" : "Add New Organization"}
              </h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Organization Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Organization Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="org_name"
                    value={formData.org_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter organization name"
                    required
                  />
                </div>

                {/* Contact Person Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Person Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="contact_person_name"
                    value={formData.contact_person_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter contact person name"
                    required
                  />
                </div>

                {/* Primary Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Primary Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="primary_phone"
                    value={formData.primary_phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter primary phone number"
                    required
                  />
                </div>

                {/* Secondary Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Secondary Phone
                  </label>
                  <input
                    type="tel"
                    name="secondary_phone"
                    value={formData.secondary_phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter secondary phone number"
                  />
                </div>

                {/* GST Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    GST Type
                  </label>
                  <select
                    name="gst_type"
                    value={formData.gst_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="NONE">No GST</option>
                    <option value="CGST_SGST">CGST + SGST</option>
                    <option value="IGST">IGST</option>
                  </select>
                </div>

                {/* GST Number */}
                {formData.gst_type !== "NONE" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      GST Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="gst_number"
                      value={formData.gst_number}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter GST number"
                      required={formData.gst_type !== "NONE"}
                    />
                  </div>
                )}

                {/* GST Percentage */}
                {formData.gst_type !== "NONE" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      GST Percentage <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="gst_percentage"
                      value={formData.gst_percentage}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter GST percentage"
                      min="0"
                      max="100"
                      step="0.01"
                      required={formData.gst_type !== "NONE"}
                    />
                  </div>
                )}
              </div>

              {/* Address */}
              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter full address"
                  rows="3"
                />
              </div>

              {/* Logo Upload */}
              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Organization Logo
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <Upload className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-700">Choose Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  {previewImage && (
                    <img src={previewImage} alt="Preview" className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">Maximum file size: 5MB</p>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingOrg ? "Update Organization" : "Add Organization"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add User to Organization Modal */}
      {isAddUserModalOpen && selectedOrg && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-2xl font-bold text-gray-800">
                Add User to {selectedOrg.org_name}
              </h3>
              <button onClick={closeAddUserModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="p-6">
              <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3">
                  {selectedOrg.org_logo ? (
                    <img src={selectedOrg.org_logo} alt={selectedOrg.org_name} className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-purple-600" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-purple-800">{selectedOrg.org_name}</h4>
                    <p className="text-sm text-purple-600">User will be added to this organization</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={newUserForm.full_name}
                    onChange={handleNewUserInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={newUserForm.email}
                    onChange={handleNewUserInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={newUserForm.phone}
                    onChange={handleNewUserInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                {/* Base Salary */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Base Salary (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="base_salary"
                    value={newUserForm.base_salary}
                    onChange={handleNewUserInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter base salary"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="role"
                    value={newUserForm.role}
                    onChange={handleNewUserInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={newUserForm.gender || ''}
                    onChange={handleNewUserInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={newUserForm.date_of_birth}
                    onChange={handleNewUserInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Note about default password */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Default password will be set as <strong>name@12345</strong>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeAddUserModal}
                  disabled={loading}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Add User to Organization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Organization Detail Modal */}
      {isDetailModalOpen && selectedOrg && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-2xl font-bold text-gray-800">Organization Details</h3>
              <button onClick={closeDetailModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Organization Header */}
              <div className="flex items-start gap-4 mb-6">
                {selectedOrg.org_logo ? (
                  <img src={selectedOrg.org_logo} alt={selectedOrg.org_name} className="w-24 h-24 rounded-lg object-cover border" />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-purple-600" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedOrg.org_name}</h2>
                  <div className="flex items-center gap-4 mt-2">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                      selectedOrg.gst_type === 'CGST_SGST' ? 'bg-green-100 text-green-800' :
                      selectedOrg.gst_type === 'IGST' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedOrg.gst_type}
                    </span>
                    {selectedOrg.gst_number && (
                      <span className="text-sm text-gray-600">
                        <FileText className="w-4 h-4 inline mr-1" />
                        {selectedOrg.gst_number}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      closeDetailModal();
                      openAddUserModal(selectedOrg);
                    }}
                    className="mt-4 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add User to this Organization
                  </button>
                </div>
              </div>

              {/* Organization Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-600">Contact Person</div>
                        <div className="font-medium">{selectedOrg.contact_person_name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-600">Primary Phone</div>
                        <div className="font-medium">{selectedOrg.primary_phone}</div>
                        {selectedOrg.secondary_phone && (
                          <div className="text-sm text-gray-500 mt-1">Secondary: {selectedOrg.secondary_phone}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">GST Details</h4>
                  <div className="space-y-3">
                    {selectedOrg.gst_type !== "NONE" ? (
                      <>
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-500" />
                          <div>
                            <div className="text-sm text-gray-600">GST Number</div>
                            <div className="font-medium">{selectedOrg.gst_number}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Percent className="w-5 h-5 text-gray-500" />
                          <div>
                            <div className="text-sm text-gray-600">GST Percentage</div>
                            <div className="font-medium">{selectedOrg.gst_percentage}%</div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-gray-500 italic">No GST registered</div>
                    )}
                  </div>
                </div>

                {selectedOrg.address && (
                  <div className="md:col-span-2">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Address</h4>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                      <div className="text-gray-700 whitespace-pre-line">{selectedOrg.address}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Organization Users */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-800">
                    Users ({selectedOrg.users?.length || 0})
                  </h4>
                  <button
                    onClick={() => {
                      closeDetailModal();
                      openAddUserModal(selectedOrg);
                    }}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg font-medium transition-colors text-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add User
                  </button>
                </div>
                {selectedOrg.users && selectedOrg.users.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Phone</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Role</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedOrg.users.map((user) => (
                          <tr key={user.user_id}>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                {user.profile_image ? (
                                  <img src={user.profile_image} alt={user.full_name} className="w-8 h-8 rounded-full mr-2" />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                                    <span className="text-blue-600 text-xs font-semibold">{user.full_name.charAt(0)}</span>
                                  </div>
                                )}
                                <span>{user.full_name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{user.phone}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                user.role === "admin" ? "bg-purple-100 text-purple-800" :
                                user.role === "manager" ? "bg-orange-100 text-orange-800" :
                                "bg-blue-100 text-blue-800"
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                user.status === "active" ? "bg-green-100 text-green-800" :
                                "bg-red-100 text-red-800"
                              }`}>
                                {user.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center p-6 bg-gray-50 rounded-lg">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">No users assigned to this organization</p>
                    <button
                      onClick={() => {
                        closeDetailModal();
                        openAddUserModal(selectedOrg);
                      }}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors mx-auto"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add First User
                    </button>
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="font-medium text-gray-600">Created</div>
                    <div>{formatDate(selectedOrg.created_at)} by {selectedOrg.added_by_name || 'System'}</div>
                  </div>
                  {selectedOrg.updated_at && (
                    <div>
                      <div className="font-medium text-gray-600">Last Updated</div>
                      <div>{formatDate(selectedOrg.updated_at)} by {selectedOrg.updated_by_name || 'System'}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationManagement;