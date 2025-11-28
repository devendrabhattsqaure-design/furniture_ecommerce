// admin-panel/src/pages/dashboard/AttendanceManagement.jsx
import React, { useState, useEffect } from "react";
import { Calendar, Users, CheckCircle, XCircle, Clock, Sun, Ban, Plus, X, Loader2, Filter, Download } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AttendanceManagement = () => {
  const [attendance, setAttendance] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filters, setFilters] = useState({
    user_id: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    status: ''
  });

  const [formData, setFormData] = useState({
    user_id: "",
    attendance_date: new Date().toISOString().split('T')[0],
    status: "present",
    work_hours: 8.00,
    notes: ""
  });

  const [bulkFormData, setBulkFormData] = useState({
    attendance_date: new Date().toISOString().split('T')[0],
    attendances: []
  });

  const API_BASE_URL = "http://localhost:5000/api";

  const statusOptions = [
    { value: 'present', label: 'Present', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    { value: 'absent', label: 'Absent', color: 'bg-red-100 text-red-800', icon: XCircle },
    { value: 'half_day', label: 'Half Day', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    { value: 'late', label: 'Late', color: 'bg-orange-100 text-orange-800', icon: Clock },
    { value: 'holiday', label: 'Holiday', color: 'bg-blue-100 text-blue-800', icon: Sun }
  ];

  // Fetch data on component mount
  useEffect(() => {
    fetchUsers();
    fetchAttendance();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/attendance/users?date=${selectedDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        toast.error("Failed to fetch users");
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error("Error loading users");
    }
  };

  const fetchAttendance = async () => {
    try {
      setFetching(true);
      const token = localStorage.getItem('token');
      
      const queryParams = new URLSearchParams();
      if (filters.user_id) queryParams.append('user_id', filters.user_id);
      if (filters.month) queryParams.append('month', filters.month);
      if (filters.year) queryParams.append('year', filters.year);
      if (filters.status) queryParams.append('status', filters.status);

      const response = await fetch(`${API_BASE_URL}/attendance?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAttendance(data.attendance || []);
      } else {
        toast.error("Failed to fetch attendance");
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error("Error loading attendance");
    } finally {
      setFetching(false);
    }
  };

  const fetchAttendanceSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      if (filters.month) queryParams.append('month', filters.month);
      if (filters.year) queryParams.append('year', filters.year);

      const response = await fetch(`${API_BASE_URL}/attendance/summary?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.summary;
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
    return null;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-set work hours based on status
    if (name === 'status') {
      let workHours = 8.00;
      switch (value) {
        case 'present':
          workHours = 8.00;
          break;
        case 'half_day':
          workHours = 4.00;
          break;
        case 'late':
          workHours = 7.00;
          break;
        case 'absent':
        case 'holiday':
          workHours = 0.00;
          break;
      }
      setFormData(prev => ({ ...prev, work_hours: workHours }));
    }
  };

  const handleBulkInputChange = (e) => {
    const { name, value } = e.target;
    setBulkFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUserStatusChange = (userId, status) => {
    const updatedAttendances = [...bulkFormData.attendances];
    const existingIndex = updatedAttendances.findIndex(att => att.user_id === userId);
    
    if (existingIndex >= 0) {
      updatedAttendances[existingIndex].status = status;
    } else {
      updatedAttendances.push({
        user_id: userId,
        status: status,
        work_hours: getDefaultWorkHours(status),
        notes: ""
      });
    }
    
    setBulkFormData(prev => ({ ...prev, attendances: updatedAttendances }));
  };

  const getDefaultWorkHours = (status) => {
    switch (status) {
      case 'present': return 8.00;
      case 'half_day': return 4.00;
      case 'late': return 7.00;
      case 'absent':
      case 'holiday': return 0.00;
      default: return 8.00;
    }
  };

  const getUserAttendanceStatus = (userId) => {
    const userAttendance = bulkFormData.attendances.find(att => att.user_id === userId);
    return userAttendance ? userAttendance.status : '';
  };

  const resetForm = () => {
    setFormData({
      user_id: "",
      attendance_date: new Date().toISOString().split('T')[0],
      status: "present",
      work_hours: 8.00,
      notes: ""
    });
  };

  const resetBulkForm = () => {
    setBulkFormData({
      attendance_date: new Date().toISOString().split('T')[0],
      attendances: []
    });
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openBulkModal = () => {
    resetBulkForm();
    setBulkFormData(prev => ({ ...prev, attendance_date: selectedDate }));
    setIsBulkModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const closeBulkModal = () => {
    setIsBulkModalOpen(false);
    resetBulkForm();
  };

  const validateForm = () => {
    if (!formData.user_id) {
      toast.error("Please select a user");
      return false;
    }
    if (!formData.attendance_date) {
      toast.error("Please select a date");
      return false;
    }
    if (!formData.status) {
      toast.error("Please select a status");
      return false;
    }
    return true;
  };

  const validateBulkForm = () => {
    if (!bulkFormData.attendance_date) {
      toast.error("Please select a date");
      return false;
    }
    if (bulkFormData.attendances.length === 0) {
      toast.error("Please mark attendance for at least one user");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/attendance/mark`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Attendance marked successfully");
        closeModal();
        fetchAttendance();
      } else {
        toast.error(data.message || "Failed to mark attendance");
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateBulkForm()) return;

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/attendance/mark-bulk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bulkFormData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Bulk attendance completed! Success: ${data.results?.success?.length || 0} users`);
        closeBulkModal();
        fetchAttendance();
      } else {
        toast.error(data.message || "Failed to mark bulk attendance");
      }
    } catch (error) {
      console.error('Error marking bulk attendance:', error);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (attendanceId) => {
    if (!window.confirm("Are you sure you want to delete this attendance record?")) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/attendance/${attendanceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success("Attendance record deleted successfully");
        fetchAttendance();
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to delete attendance record");
      }
    } catch (error) {
      console.error('Error deleting attendance:', error);
      toast.error("Network error. Please try again.");
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const getStatusIcon = (status) => {
    const statusObj = statusOptions.find(s => s.value === status);
    const IconComponent = statusObj?.icon || CheckCircle;
    return <IconComponent className="w-4 h-4" />;
  };

  const getStatusColor = (status) => {
    const statusObj = statusOptions.find(s => s.value === status);
    return statusObj?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      {/* Toast Container */}
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

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance Management</h1>
        <p className="text-gray-600">Manage and track employee attendance</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Present</p>
              <p className="text-2xl font-bold text-gray-900">
                {attendance.filter(a => a.status === 'present').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Absent</p>
              <p className="text-2xl font-bold text-gray-900">
                {attendance.filter(a => a.status === 'absent').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Half Day</p>
              <p className="text-2xl font-bold text-gray-900">
                {attendance.filter(a => a.status === 'half_day').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Late</p>
              <p className="text-2xl font-bold text-gray-900">
                {attendance.filter(a => a.status === 'late').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Sun className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Holiday</p>
              <p className="text-2xl font-bold text-gray-900">
                {attendance.filter(a => a.status === 'holiday').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <select
              value={filters.user_id}
              onChange={(e) => handleFilterChange('user_id', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Users</option>
              {users.map(user => (
                <option key={user.user_id} value={user.user_id}>
                  {user.full_name}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            <select
              value={filters.month}
              onChange={(e) => handleFilterChange('month', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>

            <select
              value={filters.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - 2 + i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          </div>

          <div className="flex gap-3">
            <button
              onClick={openBulkModal}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Users className="w-5 h-5" />
              Bulk Mark
            </button>
            <button
              onClick={openModal}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Mark Attendance
            </button>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Attendance Records</h2>
        </div>

        {fetching ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : attendance.length === 0 ? (
          <div className="text-center p-12 text-gray-500">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No attendance records found</p>
            <p className="text-sm">Mark attendance to see records here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Work Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Notes</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Marked By</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendance.map((record) => (
                  <tr key={record.attendance_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-semibold text-sm">
                            {record.full_name?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{record.full_name}</div>
                          <div className="text-sm text-gray-500">{record.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {new Date(record.attendance_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                        {getStatusIcon(record.status)}
                        {statusOptions.find(s => s.value === record.status)?.label || record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {record.work_hours} hours
                    </td>
                    <td className="px-6 py-4 text-gray-700 max-w-xs truncate">
                      {record.notes || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {record.marked_by_name || "System"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(record.attendance_id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Single Attendance Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800">Mark Attendance</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    User <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="user_id"
                    value={formData.user_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select User</option>
                    {users.map(user => (
                      <option key={user.user_id} value={user.user_id}>
                        {user.full_name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="attendance_date"
                    value={formData.attendance_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {statusOptions.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
                

<div>
  <label className="block text-sm font-semibold text-gray-700 mb-2">
    Sales Amount (₹)
  </label>
  <input
    type="number"
    name="sales_amount"
    value={formData.sales_amount || ''}
    onChange={handleInputChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    placeholder="Enter sales amount for today"
    min="0"
    step="0.01"
  />
  <p className="text-xs text-gray-500 mt-1">
    Incentive: 2% on sales above ₹10,000
  </p>
</div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Work Hours
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    name="work_hours"
                    value={formData.work_hours}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Optional notes..."
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Mark Attendance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Attendance Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-800">Bulk Mark Attendance</h3>
              <button onClick={closeBulkModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleBulkSubmit} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="attendance_date"
                  value={bulkFormData.attendance_date}
                  onChange={handleBulkInputChange}
                  className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Current Status</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Mark Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map(user => (
                      <tr key={user.user_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                              <span className="text-blue-600 font-semibold text-sm">
                                {user.full_name?.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{user.full_name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.today_attendance ? (
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.today_attendance.status)}`}>
                              {getStatusIcon(user.today_attendance.status)}
                              {statusOptions.find(s => s.value === user.today_attendance.status)?.label}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <Ban className="w-3 h-3" />
                              Not Marked
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-2">
                            {statusOptions.map(status => (
                              <button
                                key={status.value}
                                type="button"
                                onClick={() => handleUserStatusChange(user.user_id, status.value)}
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                  getUserAttendanceStatus(user.user_id) === status.value
                                    ? status.color
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {getStatusIcon(status.value)}
                                {status.label}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeBulkModal}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || bulkFormData.attendances.length === 0}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Mark {bulkFormData.attendances.length} Users
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;