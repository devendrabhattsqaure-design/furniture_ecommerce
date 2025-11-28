// admin-panel/src/pages/dashboard/UserDetailsPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, User, Mail, Phone, Cake, Clock, DollarSign, TrendingUp, Loader2 } from "lucide-react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
    if (userId) {
      fetchAttendanceData();
    }
  }, [userId, selectedMonth, selectedYear]);

  const fetchUserDetails = async () => {
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
        const foundUser = users.find(u => u.user_id == userId);
        if (foundUser) {
          setUser(foundUser);
        } else {
          toast.error("User not found");
          navigate('/dashboard/user-management');
        }
      } else {
        toast.error("Failed to fetch user details");
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      toast.error("Error loading user details");
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceData = async () => {
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

  // Calendar component for attendance
  const AttendanceCalendar = ({ attendance }) => {
    const currentDate = new Date();
    const currentMonth = selectedMonth - 1; // JavaScript months are 0-indexed
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
        attendanceMap[date] = record.status;
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

    const getStatusTooltip = (status, date) => {
      const statusText = {
        'present': 'Present',
        'absent': 'Absent',
        'half_day': 'Half Day',
        'late': 'Late',
        'holiday': 'Holiday'
      }[status] || 'No Record';
      
      return `${date} - ${statusText}`;
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
                      className={`absolute inset-0 rounded ${getStatusColor(attendanceMap[day])} opacity-80`}
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
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-xs text-gray-600">Present</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span className="text-xs text-gray-600">Absent</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-xs text-gray-600">Half Day</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span className="text-xs text-gray-600">Late</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-xs text-gray-600">Holiday</span>
          </div>
        </div>
      </div>
    );
  };

  // Salary Breakdown Component
  const SalaryBreakdown = ({ summary }) => {
    if (!summary) return null;

    return (
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Salary Breakdown - {new Date(selectedYear, selectedMonth - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Base Salary</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">₹{summary.baseSalary || '0.00'}</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Total Incentive</span>
            </div>
            <p className="text-2xl font-bold text-green-900">₹{summary.totalIncentive?.toFixed(2) || '0.00'}</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Final Salary</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">₹{summary.finalSalary?.toFixed(2) || '0.00'}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{summary.totalPresent || 0}</div>
            <div className="text-sm text-gray-600">Present Days</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{summary.totalAbsent || 0}</div>
            <div className="text-sm text-gray-600">Absent Days</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{summary.totalHalfDays || 0}</div>
            <div className="text-sm text-gray-600">Half Days</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{summary.totalLate || 0}</div>
            <div className="text-sm text-gray-600">Late Days</div>
          </div>
        </div>

        {/* Deduction Details */}
        {summary.absentDeduction > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-red-700 font-medium">Absent Deduction:</span>
              <span className="text-red-700 font-bold">-₹{summary.absentDeduction?.toFixed(2)}</span>
            </div>
            <p className="text-xs text-red-600 mt-1">
              (First absent is free, subsequent absents are deducted at ₹{summary.dailySalary}/day)
            </p>
          </div>
        )}

        {/* Sales Summary */}
        {summary.totalSales > 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-green-700 font-medium">Total Sales:</span>
              <span className="text-green-700 font-bold">₹{summary.totalSales?.toFixed(2)}</span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              {summary.totalIncentive > 0 ? 
                `2% incentive applied on sales above ₹10,000` : 
                'Sales below ₹10,000 threshold for incentive'
              }
            </p>
          </div>
        )}
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
                    {user.full_name.charAt(0)}
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
                  {user.status}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsPage;