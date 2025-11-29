// admin-panel/src/pages/dashboard/UserManagement.jsx
import React, { useState, useEffect } from "react";
import { Users, Edit2, Trash2, X, Plus, Upload, Loader2, Eye, Calendar, DollarSign, Target, TrendingUp } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(true);
  
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    gender: "",
    role: "employee",
    status: "active",
    base_salary: "",
    target_amount: "",
    incentive_percentage: "",
    profile_image: null
  });

  const navigate = useNavigate();
  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setFetchingUsers(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || data);
      } else {
        toast.error("Failed to fetch users");
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error("Error loading users");
    } finally {
      setFetchingUsers(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-calculate incentive amount when target amount or percentage changes
    if ((name === 'target_amount' || name === 'incentive_percentage') && 
        formData.target_amount && formData.incentive_percentage) {
      // This is just for display, the calculation happens on backend
    }
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
      
      setFormData(prev => ({ ...prev, profile_image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      date_of_birth: "",
      gender: "",
      role: "employee",
      status: "active",
      base_salary: "",
      target_amount: "",
      incentive_percentage: "",
      profile_image: null
    });
    setPreviewImage(null);
    setEditingUser(null);
  };

 const openModal = (user = null) => {
  if (user) {
    setEditingUser(user);
    setFormData({
      full_name: user.full_name || "",
      email: user.email || "",
      phone: user.phone || "",
      date_of_birth: user.date_of_birth || "",
      role: user.role || "employee",
      gender: user.gender || "",
      status: user.status || "active",
      base_salary: user.base_salary || "",
      target_amount: user.target_amount || "",
      incentive_percentage: user.incentive_percentage || "",
      profile_image: null
    });
    setPreviewImage(user.profile_image || null);
  } else {
    resetForm();
  }
  setIsModalOpen(true);
};

  const openTargetModal = (user) => {
    setSelectedUser(user);
    setFormData({
      base_salary: user.base_salary || "",
      target_amount: user.target_amount || "",
      incentive_percentage: user.incentive_percentage || ""
    });
    setIsTargetModalOpen(true);
  };

  const openDetailModal = async (user) => {
    navigate(`/dashboard/users/${user.user_id}`);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const closeTargetModal = () => {
    setIsTargetModalOpen(false);
    setSelectedUser(null);
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      toast.error("Full name is required");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email");
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return false;
    }
    if (!formData.role) {
      toast.error("Role is required");
      return false;
    }
    if (!formData.base_salary || parseFloat(formData.base_salary) < 0) {
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
      if (editingUser) {
        await updateUser(editingUser.user_id);
      } else {
        await addUser();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error("Operation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTargetSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.base_salary || parseFloat(formData.base_salary) < 0) {
      toast.error("Please enter a valid base salary");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users/${selectedUser.user_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          base_salary: parseFloat(formData.base_salary),
          target_amount: parseFloat(formData.target_amount) || 0,
          incentive_percentage: parseFloat(formData.incentive_percentage) || 0,
          full_name: selectedUser.full_name,
          email: selectedUser.email,
          phone: selectedUser.phone,
          role: selectedUser.role,
          status: selectedUser.status,
          gender: selectedUser.gender,
          date_of_birth: selectedUser.date_of_birth
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Salary and target updated successfully");
        closeTargetModal();
        fetchUsers();
      } else {
        toast.error(data.message || "Failed to update salary and target");
      }
    } catch (error) {
      console.error('Error updating salary:', error);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addUser = async () => {
  try {
    const submitData = new FormData();
    submitData.append('full_name', formData.full_name);
    submitData.append('email', formData.email);
    submitData.append('phone', formData.phone);
    submitData.append('role', formData.role);
    submitData.append('base_salary', formData.base_salary);
    submitData.append('target_amount', formData.target_amount || '0');
    submitData.append('incentive_percentage', formData.incentive_percentage || '0');
    
    if (formData.date_of_birth) {
      submitData.append('date_of_birth', formData.date_of_birth);
    }
    if (formData.gender) {
      submitData.append('gender', formData.gender);
    }
    if (formData.profile_image) {
      submitData.append('image', formData.profile_image);
    }

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/auth/admin/register`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
      body: submitData
    });
    
    const data = await response.json();

    if (response.ok) {
      toast.success("User added successfully");
      closeModal();
      fetchUsers();
    } else {
      toast.error(data.message || data.errors?.[0]?.msg || "Failed to add user");
    }
  } catch (error) {
    console.error('Error adding user:', error);
    toast.error("Network error. Please try again.");
  }
};

// Update the updateUser function to ensure all fields are included
const updateUser = async (userId) => {
  try {
    const submitData = new FormData();
    submitData.append('full_name', formData.full_name);
    submitData.append('email', formData.email);
    submitData.append('phone', formData.phone);
    submitData.append('gender', formData.gender || '');
    submitData.append('role', formData.role);
    submitData.append('status', formData.status);
    submitData.append('base_salary', formData.base_salary);
    submitData.append('target_amount', formData.target_amount || '0');
    submitData.append('incentive_percentage', formData.incentive_percentage || '0');
    
    if (formData.date_of_birth) {
      submitData.append('date_of_birth', formData.date_of_birth);
    }
    
    if (formData.profile_image) {
      submitData.append('image', formData.profile_image);
    }

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: submitData
    });

    const data = await response.json();

    if (response.ok) {
      toast.success("User updated successfully");
      closeModal();
      fetchUsers();
    } else {
      toast.error(data.message || "Failed to update user");
    }
  } catch (error) {
    console.error('Error updating user:', error);
    toast.error("Network error. Please try again.");
  }
};

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success("User deleted successfully");
        fetchUsers();
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to delete user");
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error("Network error. Please try again.");
    }
  };

  // Calculate incentive amount for display
  const calculateIncentiveAmount = () => {
    if (formData.target_amount && formData.incentive_percentage) {
      return (parseFloat(formData.target_amount) * parseFloat(formData.incentive_percentage)) / 100;
    }
    return 0;
  };

  // Calculate potential final salary
  const calculatePotentialSalary = () => {
    const baseSalary = parseFloat(formData.base_salary) || 0;
    const incentive = calculateIncentiveAmount();
    return baseSalary + incentive;
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
          <div className="bg-clip-border mx-4 rounded-xl overflow-hidden bg-gradient-to-tr from-blue-600 to-blue-400 text-white shadow-green-500/40 shadow-lg absolute -mt-4 grid h-16 w-16 place-items-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div className="p-6 text-right">
            <p className="text-sm text-gray-600 font-medium">Total Users</p>
            <h4 className="text-3xl font-bold text-gray-900">{users.length}</h4>
          </div>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add User
          </button>
        </div>

        {fetchingUsers ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center p-12 text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No users found</p>
            <p className="text-sm">Click "Add User" to create your first user</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Base Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Target</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Incentive</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.user_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.profile_image ? (
                          <img src={user.profile_image} alt={user.full_name} className="w-10 h-10 rounded-full mr-3 object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-semibold">{user.full_name.charAt(0)}</span>
                          </div>
                        )}
                        <span className="font-medium text-gray-900">{user.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{user.phone || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === "admin" ? "bg-purple-100 text-purple-800" : 
                        user.role === "manager" ? "bg-orange-100 text-orange-800" : "bg-blue-100 text-blue-800"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-medium">
                      ₹{parseFloat(user.base_salary || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {user.target_amount ? `₹${parseFloat(user.target_amount).toLocaleString()}` : "No target"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {user.incentive_percentage ? `${user.incentive_percentage}%` : "No incentive"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openDetailModal(user)}
                          className="text-green-600 hover:text-green-800 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openTargetModal(user)}
                          className="text-purple-600 hover:text-purple-800 transition-colors"
                          title="Set Salary & Target"
                        >
                          <Target className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => openModal(user)}
                          className="text-yellow-600 hover:text-yellow-800 transition-colors"
                          title="Edit User"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.user_id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete User"
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

      {/* Add/Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingUser ? "Edit User" : "Add New User"}
              </h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
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
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email"
                    disabled={editingUser}
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
                    value={formData.phone}
                    onChange={handleInputChange}
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
                    value={formData.base_salary}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter base salary"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                {/* Target Amount */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Target Amount (₹)
                  </label>
                  <input
                    type="number"
                    name="target_amount"
                    value={formData.target_amount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter target amount"
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Incentive Percentage */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Incentive Percentage (%)
                  </label>
                  <input
                    type="number"
                    name="incentive_percentage"
                    value={formData.incentive_percentage}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter incentive percentage"
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {/* Gender */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Role */}
                <div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Role <span className="text-red-500">*</span>
  </label>
  <select
    name="role"
    value={formData.role}
    onChange={handleInputChange}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    required
  >
    <option value="employee">Employee</option>
    <option value="admin">Admin</option>
    <option value="manager">Manager</option>
    {/* <option value="customer">Customer</option> */}
  </select>
</div>

                {/* Status */}
                {editingUser && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                      <option value="banned">Banned</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Salary Calculation Preview */}
              {(formData.base_salary || formData.target_amount) && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-semibold text-gray-800 mb-3">Salary Calculation Preview</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Base Salary</div>
                      <div className="text-lg font-bold text-blue-600">
                        ₹{parseFloat(formData.base_salary || 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Potential Incentive</div>
                      <div className="text-lg font-bold text-green-600">
                        ₹{calculateIncentiveAmount().toLocaleString()}
                      </div>
                      {formData.target_amount && formData.incentive_percentage && (
                        <div className="text-xs text-gray-500">
                          {formData.incentive_percentage}% of ₹{parseFloat(formData.target_amount).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Potential Final Salary</div>
                      <div className="text-lg font-bold text-purple-600">
                        ₹{calculatePotentialSalary().toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Final Salary = Base Salary + Incentive (when sales target is met)
                  </p>
                </div>
              )}

              {/* Profile Image */}
              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Profile Image
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <Upload className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-700">Choose File</span>
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

              {!editingUser && (
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Default password will be set as <strong>name@12345</strong>
                  </p>
                </div>
              )}

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
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingUser ? "Update User" : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Target & Salary Modal */}
      {isTargetModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">
                Set Salary & Target
              </h3>
              <button onClick={closeTargetModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleTargetSubmit} className="p-6">
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800">User: {selectedUser.full_name}</h4>
                <p className="text-sm text-blue-600">Email: {selectedUser.email}</p>
              </div>

              <div className="space-y-4">
                {/* Base Salary */}
                {/* In the modal form, update the base salary field to ensure it's properly handled */}
<div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Base Salary (₹) <span className="text-red-500">*</span>
  </label>
  <input
    type="number"
    name="base_salary"
    value={formData.base_salary}
    onChange={handleInputChange}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    placeholder="Enter base salary"
    min="0"
    step="0.01"
    required
  />
</div>

{/* Make sure target_amount and incentive_percentage are included */}
<div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Target Amount (₹)
  </label>
  <input
    type="number"
    name="target_amount"
    value={formData.target_amount}
    onChange={handleInputChange}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    placeholder="Enter target amount"
    min="0"
    step="0.01"
  />
</div>

<div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Incentive Percentage (%)
  </label>
  <input
    type="number"
    name="incentive_percentage"
    value={formData.incentive_percentage}
    onChange={handleInputChange}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    placeholder="Enter incentive percentage"
    min="0"
    max="100"
    step="0.01"
  />
</div>

                {/* Salary Calculation Preview */}
                {(formData.base_salary || formData.target_amount) && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Salary Calculation</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Base Salary:</span>
                        <span className="font-medium">₹{parseFloat(formData.base_salary || 0).toLocaleString()}</span>
                      </div>
                      {formData.target_amount && formData.incentive_percentage && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span>Potential Incentive:</span>
                            <span className="font-medium">₹{calculateIncentiveAmount().toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm font-bold">
                            <span>Potential Final Salary:</span>
                            <span>₹{calculatePotentialSalary().toLocaleString()}</span>
                          </div>
                          <p className="text-xs text-green-600 mt-1">
                            When sales reach ₹{parseFloat(formData.target_amount).toLocaleString()}, 
                            incentive will be {formData.incentive_percentage}%
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeTargetModal}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;