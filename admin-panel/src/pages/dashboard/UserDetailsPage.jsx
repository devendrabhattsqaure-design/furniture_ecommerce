// admin-panel/src/pages/dashboard/UserDetailsPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, User, Mail, Phone, Cake, Clock, DollarSign, TrendingUp, Loader2, Receipt } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Target, Percent } from "lucide-react";
const UserDetailsPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [salarySummary, setSalarySummary] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [fetchingData, setFetchingData] = useState(false);

  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  useEffect(() => {
    if (userId && user) {
      fetchAttendanceData();
    }
  }, [userId, selectedMonth, selectedYear, user]);

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user || data);
      } else if (response.status === 404) {
        // If single user endpoint doesn't exist, fall back to getting all users
        await fetchUserFromAllUsers();
      } else {
        toast.error("Failed to fetch user details");
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      // Fall back to getting all users
      await fetchUserFromAllUsers();
    } finally {
      setLoading(false);
    }
  };

  // Fallback method to get user from all users list
  const fetchUserFromAllUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const users = data.users || data;
        const foundUser = Array.isArray(users) ? users.find(u => u.user_id == userId) : null;
        if (foundUser) {
          setUser(foundUser);
        } else {
          toast.error("User not found");
          navigate('/dashboard/user-management');
        }
      } else {
        toast.error("Failed to fetch user details");
        navigate('/dashboard/user-management');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error("Error loading user details");
      navigate('/dashboard/user-management');
    }
  };

  const fetchAttendanceData = async () => {
    if (!user) return;
    
    try {
      setFetchingData(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${API_BASE_URL}/attendance/user/${userId}?month=${selectedMonth}&year=${selectedYear}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setAttendance(data.attendance || []);
        setSalarySummary(data.salarySummary);
      } else {
        toast.error("Failed to fetch attendance data");
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast.error("Error loading attendance data");
    } finally {
      setFetchingData(false);
    }
  };

  const DailySalaryBreakdown = ({ attendance, user }) => {
  if (!attendance || attendance.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Sales & Attendance</h3>
        <p className="text-gray-500 text-center py-4">No attendance records for this month</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Receipt className="w-5 h-5" />
        Daily Sales & Attendance - {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
      </h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Hours</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales (₹)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attendance.map((record) => (
              <tr key={record.attendance_id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {new Date(record.attendance_date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    record.status === 'present' ? 'bg-green-100 text-green-800' :
                    record.status === 'absent' ? 'bg-red-100 text-red-800' :
                    record.status === 'half_day' ? 'bg-yellow-100 text-yellow-800' :
                    record.status === 'late' ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1).replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {record.work_hours} hours
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {record.sales_amount ? `₹${parseFloat(record.sales_amount).toLocaleString()}` : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                  {record.notes || '-'}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan="3" className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                Monthly Sales Total:
              </td>
              <td className="px-4 py-3 text-sm font-bold text-gray-900">
                ₹{attendance.reduce((sum, record) => sum + parseFloat(record.sales_amount || 0), 0).toLocaleString()}
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};


  // Calendar component for attendance
  const AttendanceCalendar = ({ attendance }) => {
    const currentDate = new Date();
    const currentMonth = selectedMonth - 1;
    const currentYear = selectedYear;
    
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    
    const daysInMonth = lastDayOfMonth.getDate();
    const days = [];

    // Create attendance map for quick lookup
    const attendanceMap = {};
    attendance.forEach(record => {
      const recordDate = new Date(record.attendance_date);
      const date = recordDate.getDate();
      const month = recordDate.getMonth();
      const year = recordDate.getFullYear();
      
      if (month === currentMonth && year === currentYear) {
        attendanceMap[date] = {
          status: record.status,
          sales: record.sales_amount,
          incentive: record.incentive_amount,
          total: record.total_salary
        };
      }
    });

    // Add empty cells for days before the first day of month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    const getStatusColor = (status) => {
      switch (status) {
        case 'present': return 'bg-green-500';
        case 'absent': return 'bg-red-500';
        case 'half_day': return 'bg-yellow-500';
        case 'late': return 'bg-orange-500';
        case 'holiday': return 'bg-blue-500';
        default: return 'bg-gray-200';
      }
    };

    const getStatusTooltip = (attendanceData, date) => {
      if (!attendanceData) return `${date} - No Record`;
      
      const statusText = {
        'present': 'Present',
        'absent': 'Absent',
        'half_day': 'Half Day',
        'late': 'Late',
        'holiday': 'Holiday'
      }[attendanceData.status] || 'No Record';
      
      let tooltip = `${date} - ${statusText}`;
      if (attendanceData.sales > 0) {
        tooltip += `\nSales: ₹${attendanceData.sales}`;
      }
      if (attendanceData.incentive > 0) {
        tooltip += `\nIncentive: ₹${attendanceData.incentive}`;
      }
      tooltip += `\nTotal: ₹${parseFloat(attendanceData.total || 0).toFixed(2)}`;
      
      return tooltip;
    };

    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {firstDayOfMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h3>
          <Calendar className="w-5 h-5 text-gray-600" />
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div
              key={index}
              className={`h-8 rounded flex items-center justify-center text-sm relative ${
                day ? 'border border-gray-200' : ''
              } ${
                day === currentDate.getDate() && currentMonth === currentDate.getMonth() ? 'ring-2 ring-blue-500 ring-inset' : ''
              }`}
            >
              {day && (
                <>
                  <span className={`z-10 ${attendanceMap[day] ? 'text-white font-medium' : 'text-gray-700'}`}>
                    {day}
                  </span>
                  {attendanceMap[day] && (
                    <div
                      className={`absolute inset-0 rounded ${getStatusColor(attendanceMap[day].status)} opacity-80`}
                      title={getStatusTooltip(attendanceMap[day], day)}
                    ></div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {['present', 'absent', 'half_day', 'late', 'holiday'].map(status => (
            <div key={status} className="flex items-center gap-1">
              <div className={`w-3 h-3 rounded ${getStatusColor(status)}`}></div>
              <span className="text-xs text-gray-600">
                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

 // Salary Breakdown Component with CORRECT Deduction Details
const SalaryBreakdown = ({ summary, user }) => {
  if (!summary) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Salary Summary</h3>
        <p className="text-gray-500 text-center py-4">No salary data available for this month</p>
      </div>
    );
  }

  const targetAchieved = summary.targetAchieved;
  const achievementPercentage = summary.targetAmount > 0 ? 
    (summary.totalSales / summary.targetAmount) * 100 : 0;

  // Calculate free allowance usage
  const freeAllowanceUsed = Math.min(summary.totalEquivalentAbsents, summary.freeEquivalentAbsents);
  const isUsingHalfDayAllowance = summary.totalHalfDays >= 2 && summary.totalAbsent === 0;

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <DollarSign className="w-5 h-5" />
        Monthly Salary Summary - {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
      </h3>
      
      {/* Salary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Base Salary */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Base Salary</span>
          </div>
          <p className="text-2xl font-bold text-blue-900">
            ₹{summary.baseSalary?.toLocaleString() || '0'}
          </p>
        </div>

        {/* Total Sales */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Total Sales</span>
          </div>
          <p className="text-2xl font-bold text-green-900">
            ₹{summary.totalSales?.toLocaleString() || '0'}
          </p>
        </div>

        {/* Sales Target */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Sales Target</span>
          </div>
          <p className="text-2xl font-bold text-purple-900">
            ₹{summary.targetAmount?.toLocaleString() || '0'}
          </p>
        </div>

        {/* Incentive Rate */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Percent className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Incentive Rate</span>
          </div>
          <p className="text-2xl font-bold text-yellow-900">
            {summary.incentivePercentage || '0'}%
          </p>
        </div>

        {/* Incentive Earned */}
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-800">Incentive Earned</span>
          </div>
          <p className="text-2xl font-bold text-indigo-900">
            ₹{summary.totalIncentive?.toLocaleString() || '0'}
          </p>
        </div>

        {/* Final Salary */}
        <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Final Salary</span>
          </div>
          <p className="text-2xl font-bold text-green-900">
            ₹{summary.finalSalary?.toLocaleString() || '0'}
          </p>
        </div>
      </div>

      {/* Attendance Policy & Deductions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Attendance Summary */}
        <div className="bg-gray-50 rounded-lg p-4 border">
          <h4 className="font-semibold text-gray-800 mb-3">Attendance Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600">{summary.totalPresent || 0}</div>
              <div className="text-xs text-gray-600">Present</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-xl font-bold text-red-600">{summary.totalAbsent || 0}</div>
              <div className="text-xs text-gray-600">Absent</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-xl font-bold text-yellow-600">{summary.totalHalfDays || 0}</div>
              <div className="text-xs text-gray-600">Half Days</div>
            </div>
            
          </div>
        </div>

        {/* Deduction Details */}
        <div className="bg-gray-50 rounded-lg p-4 border">
          <h4 className="font-semibold text-gray-800 mb-3">Deduction Calculation</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total Equivalent Absents:</span>
              <span className="font-medium">{summary.totalEquivalentAbsents} days</span>
            </div>
            <div className="flex justify-between">
              <span>Free Allowance:</span>
              <span className="font-medium text-green-600">{summary.freeEquivalentAbsents} day</span>
            </div>
            <div className="flex justify-between">
              <span>Deductible Absents:</span>
              <span className="font-medium text-red-600">{summary.totalDeductibleEquivalentAbsents} days</span>
            </div>
            <div className="flex justify-between">
              <span>Daily Salary Rate:</span>
              <span className="font-medium">₹{summary.dailySalary || '0'}</span>
            </div>
            {summary.totalDeduction > 0 && (
              <div className="flex justify-between font-bold border-t pt-2">
                <span>Total Deduction:</span>
                <span className="text-red-600">-₹{summary.totalDeduction?.toLocaleString() || '0'}</span>
              </div>
            )}
            
          </div>
        </div>
      </div>


      {/* Target Achievement Progress */}
      {summary.targetAmount > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Sales Target Achievement</span>
            <span className="text-sm font-bold text-gray-900">
              {achievementPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full ${
                targetAchieved ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(achievementPercentage, 100)}%` }}
            ></div>
          </div>
          <p className={`text-sm font-medium mt-2 ${
            targetAchieved ? 'text-green-600' : 'text-blue-600'
          }`}>
            {targetAchieved 
              ? `🎉 Target achieved! Incentive of ${summary.incentivePercentage}% applied.`
              : `Need ₹${(summary.targetAmount - summary.totalSales).toLocaleString()} more to achieve target for incentive`
            }
          </p>
        </div>
      )}

      {/* Salary Calculation Breakdown */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-3">Salary Calculation Breakdown</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Base Salary:</span>
              <span className="font-medium">₹{summary.baseSalary?.toLocaleString() || '0'}</span>
            </div>
            <div className="flex justify-between">
              <span>Incentive Earned:</span>
              <span className="font-medium text-green-600">+₹{summary.totalIncentive?.toLocaleString() || '0'}</span>
            </div>
            {summary.totalDeduction > 0 && (
              <div className="flex justify-between">
                <span>Attendance Deduction:</span>
                <span className="font-medium text-red-600">-₹{summary.totalDeduction?.toLocaleString() || '0'}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-blue-800 border-t pt-2">
              <span>Final Salary:</span>
              <span>₹{summary.finalSalary?.toLocaleString() || '0'}</span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">User not found</p>
          <button 
            onClick={() => navigate('/dashboard/user-management')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <ToastContainer />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/dashboard/user-management')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Users
        </button>

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* User Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {user.profile_image ? (
                <img 
                  src={user.profile_image} 
                  alt={user.full_name} 
                  className="w-24 h-24 rounded-full object-cover border-4 border-white/20"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/20">
                  <span className="text-white font-semibold text-2xl">
                    {user.full_name?.charAt(0)}
                  </span>
                </div>
              )}
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold">{user.full_name}</h1>
                <p className="text-blue-100 text-lg">{user.role}</p>
                <div className="flex flex-wrap gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user.base_salary > 0 && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span>Base Salary: ₹{user.base_salary}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white/20 rounded-lg px-4 py-2">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  user.status === "active" ? "bg-green-500 text-white" : 
                  user.status === "inactive" ? "bg-gray-500 text-white" : 
                  "bg-red-500 text-white"
                }`}>
                  {user.status?.charAt(0).toUpperCase() + user.status?.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Month Selector */}
          <div className="p-6 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-bold text-gray-800">Attendance & Salary Details</h2>
              <div className="flex gap-4">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-6">
            {fetchingData ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Attendance Calendar */}
                  <div>
                    <AttendanceCalendar attendance={attendance} />
                  </div>

                  {/* Salary Breakdown */}
                  <div>
                    <SalaryBreakdown summary={salarySummary} />
                  </div>
                </div>

                {/* Daily Salary Breakdown */}
                <DailySalaryBreakdown attendance={attendance} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsPage;