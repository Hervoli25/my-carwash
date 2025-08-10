'use client';

import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import Swal from 'sweetalert2';
import {
  Users,
  Car,
  DollarSign,
  Calendar,
  Database,
  Settings,
  Shield,
  LogOut,
  Bell,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Key,
  Mail,
  Camera,
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
  Wrench
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils';

interface AdminDashboardClientProps {
  session: any;
}

interface DashboardStats {
  totalUsers: number;
  activeBookings: number;
  totalRevenue: number;
  servicesCount: number;
  todayBookings: number;
  pendingPayments: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isAdmin: boolean;
  loyaltyPoints: number;
  createdAt: string;
  lastLoginAt?: string;
  bookingCount: number;
  totalSpent: number;
  status: 'active' | 'suspended' | 'locked';
}

interface Booking {
  id: string;
  user: { name: string; email: string };
  service: { name: string };
  vehicle: { make: string; model: string; licensePlate: string };
  bookingDate: string;
  timeSlot: string;
  status: string;
  totalAmount: number;
  payment?: { status: string; paymentMethodType?: string };
}

export function AdminDashboardClient({ session }: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsResponse = await fetch('/api/admin/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch users
      const usersResponse = await fetch('/api/admin/users');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users);
      }

      // Fetch recent bookings
      const bookingsResponse = await fetch('/api/admin/bookings');
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData.bookings);
      }

    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('User action failed:', error);
    }
  };

  const sendPasswordReset = async (email: string) => {
    try {
      const response = await fetch('/api/admin/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        alert('Password reset email sent successfully');
      }
    } catch (error) {
      console.error('Password reset failed:', error);
    }
  };

  const exportData = async () => {
    try {
      const response = await fetch('/api/admin/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'full_export',
          format: 'csv' 
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ekhaya-carwash-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        alert('Data exported successfully!');
      } else {
        alert('Export failed. Please try again.');
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const performDBBackup = async () => {
    const result = await Swal.fire({
      title: 'Create Database Backup?',
      text: 'This will create a complete backup of your database. The process may take a few minutes.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Create Backup',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      allowOutsideClick: false,
      customClass: {
        popup: 'font-sans',
        title: 'text-gray-900 font-semibold',
        htmlContainer: 'text-gray-600',
        confirmButton: 'swal2-confirm',
        cancelButton: 'swal2-cancel'
      }
    });

    if (!result.isConfirmed) return;

    // Show loading dialog
    Swal.fire({
      title: 'Creating Backup...',
      text: 'Please wait while we create your database backup.',
      icon: 'info',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await fetch('/api/admin/database/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const result = await response.json();
        await Swal.fire({
          title: 'Backup Created Successfully!',
          html: `<div class="text-left">
            <p class="mb-2">Your database backup has been created successfully.</p>
            <p class="text-sm text-gray-600"><strong>Backup ID:</strong> ${result.backupId}</p>
          </div>`,
          icon: 'success',
          confirmButtonColor: '#10b981',
          confirmButtonText: 'Great!',
          customClass: {
            popup: 'font-sans',
            title: 'text-gray-900 font-semibold',
            htmlContainer: 'text-gray-600'
          }
        });
      } else {
        await Swal.fire({
          title: 'Backup Failed',
          text: 'The database backup could not be created. Please try again or contact support.',
          icon: 'error',
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'font-sans',
            title: 'text-gray-900 font-semibold',
            htmlContainer: 'text-gray-600'
          }
        });
      }
    } catch (error) {
      console.error('Database backup failed:', error);
      await Swal.fire({
        title: 'Backup Failed',
        text: 'An error occurred while creating the backup. Please check your connection and try again.',
        icon: 'error',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'font-sans',
          title: 'text-gray-900 font-semibold',
          htmlContainer: 'text-gray-600'
        }
      });
    }
  };

  const viewUserDetails = async (userId: string) => {
    // Show loading dialog
    Swal.fire({
      title: 'Loading User Details...',
      text: 'Please wait while we fetch the user information.',
      icon: 'info',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      if (response.ok) {
        const userData = await response.json();
        const user = userData.user;

        await Swal.fire({
          title: `${user.name || 'User'} Profile`,
          html: `
            <div class="text-left space-y-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-900 mb-3">Personal Information</h4>
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div><strong>Name:</strong> ${user.name || 'Not provided'}</div>
                  <div><strong>Email:</strong> ${user.email}</div>
                  <div><strong>Phone:</strong> ${user.phone || 'Not provided'}</div>
                  <div><strong>Member Since:</strong> ${new Date(user.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              <div class="bg-blue-50 p-4 rounded-lg">
                <h4 class="font-semibold text-blue-900 mb-3">Account Statistics</h4>
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div><strong>Total Bookings:</strong> ${user.bookingCount || 0}</div>
                  <div><strong>Total Spent:</strong> R${user.totalSpent || '0.00'}</div>
                  <div><strong>Loyalty Points:</strong> ${user.loyaltyPoints || 0}</div>
                  <div><strong>Status:</strong> <span class="px-2 py-1 rounded text-xs ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">${user.status || 'Active'}</span></div>
                </div>
              </div>

              ${user.vehicles && user.vehicles.length > 0 ? `
                <div class="bg-yellow-50 p-4 rounded-lg">
                  <h4 class="font-semibold text-yellow-900 mb-3">Registered Vehicles</h4>
                  <div class="space-y-2 text-sm">
                    ${user.vehicles.map(vehicle => `
                      <div class="flex justify-between">
                        <span>${vehicle.make} ${vehicle.model} (${vehicle.year})</span>
                        <span class="text-gray-600">${vehicle.licensePlate}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
          `,
          icon: 'info',
          confirmButtonColor: '#3b82f6',
          confirmButtonText: 'Close',
          width: '600px',
          customClass: {
            popup: 'font-sans',
            title: 'text-gray-900 font-semibold',
            htmlContainer: 'text-gray-600'
          }
        });
      } else {
        await Swal.fire({
          title: 'Error Loading User',
          text: 'Could not fetch user details. Please try again.',
          icon: 'error',
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'font-sans',
            title: 'text-gray-900 font-semibold',
            htmlContainer: 'text-gray-600'
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      await Swal.fire({
        title: 'Connection Error',
        text: 'Failed to load user details. Please check your connection and try again.',
        icon: 'error',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'font-sans',
          title: 'text-gray-900 font-semibold',
          htmlContainer: 'text-gray-600'
        }
      });
    }
  };

  const editUser = async (userId: string) => {
    // For now, redirect to user management with the user selected
    // Later we can implement inline editing or a modal
    const newName = prompt('Enter new name for user:');
    if (newName && newName.trim()) {
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            action: 'update',
            name: newName.trim()
          })
        });

        if (response.ok) {
          alert('User updated successfully!');
          fetchDashboardData(); // Refresh data
        } else {
          alert('Failed to update user. Please try again.');
        }
      } catch (error) {
        console.error('User update failed:', error);
        alert('Failed to update user. Please try again.');
      }
    }
  };

  const deleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    // First confirmation
    const firstConfirm = await Swal.fire({
      title: 'Delete User Account?',
      html: `
        <div class="text-left">
          <p class="mb-3">You are about to permanently delete:</p>
          <div class="bg-red-50 p-3 rounded border-l-4 border-red-400">
            <p class="font-semibold text-red-800">${user.name || user.email}</p>
            <p class="text-sm text-red-600">${user.email}</p>
          </div>
          <div class="mt-4 p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
            <p class="text-sm text-yellow-800"><strong>Warning:</strong> This action will:</p>
            <ul class="text-sm text-yellow-700 mt-2 list-disc list-inside">
              <li>Permanently delete the user account</li>
              <li>Remove all booking history</li>
              <li>Delete all associated data</li>
              <li>This action cannot be undone</li>
            </ul>
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Continue to Delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      allowOutsideClick: false,
      customClass: {
        popup: 'font-sans',
        title: 'text-gray-900 font-semibold',
        htmlContainer: 'text-gray-600'
      }
    });

    if (!firstConfirm.isConfirmed) return;

    // Second confirmation with text input
    const { value: confirmText } = await Swal.fire({
      title: 'Final Confirmation Required',
      html: `
        <div class="text-left mb-4">
          <p class="mb-3">To confirm permanent deletion of <strong>${user.name || user.email}</strong>, please type:</p>
          <div class="bg-gray-100 p-2 rounded font-mono text-center text-lg font-bold">DELETE</div>
        </div>
      `,
      input: 'text',
      inputPlaceholder: 'Type DELETE here...',
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Delete User',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      allowOutsideClick: false,
      inputValidator: (value) => {
        if (value !== 'DELETE') {
          return 'You must type "DELETE" exactly to confirm';
        }
      },
      customClass: {
        popup: 'font-sans',
        title: 'text-gray-900 font-semibold',
        htmlContainer: 'text-gray-600',
        input: 'text-center font-mono'
      }
    });

    if (!confirmText || confirmText !== 'DELETE') {
      await Swal.fire({
        title: 'Deletion Cancelled',
        text: 'User deletion was cancelled. No changes have been made.',
        icon: 'info',
        confirmButtonColor: '#3b82f6',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'font-sans',
          title: 'text-gray-900 font-semibold',
          htmlContainer: 'text-gray-600'
        }
      });
      return;
    }

    // Show deletion progress
    Swal.fire({
      title: 'Deleting User...',
      text: 'Please wait while we process the deletion.',
      icon: 'info',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        await Swal.fire({
          title: 'User Deleted Successfully',
          text: 'The user account and all associated data have been permanently removed.',
          icon: 'success',
          confirmButtonColor: '#10b981',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'font-sans',
            title: 'text-gray-900 font-semibold',
            htmlContainer: 'text-gray-600'
          }
        });
        fetchDashboardData(); // Refresh data
      } else {
        const errorData = await response.json();
        await Swal.fire({
          title: 'Deletion Failed',
          text: errorData.error || 'Failed to delete user. Please try again.',
          icon: 'error',
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'font-sans',
            title: 'text-gray-900 font-semibold',
            htmlContainer: 'text-gray-600'
          }
        });
      }
    } catch (error) {
      console.error('User deletion failed:', error);
      await Swal.fire({
        title: 'Deletion Error',
        text: 'An error occurred while deleting the user. Please try again.',
        icon: 'error',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'font-sans',
          title: 'text-gray-900 font-semibold',
          htmlContainer: 'text-gray-600'
        }
      });
    }
  };

  // User Management Functions
  const editUser = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const { value: formValues } = await Swal.fire({
      title: `Edit User: ${user.name || user.email}`,
      html: `
        <div class="text-left space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input id="swal-input1" class="swal2-input" placeholder="Full Name" value="${user.name || ''}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input id="swal-input2" class="swal2-input" placeholder="Email Address" value="${user.email}" type="email">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input id="swal-input3" class="swal2-input" placeholder="Phone Number" value="${user.phone || ''}">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Update User',
      cancelButtonText: 'Cancel',
      preConfirm: () => {
        return [
          (document.getElementById('swal-input1') as HTMLInputElement).value,
          (document.getElementById('swal-input2') as HTMLInputElement).value,
          (document.getElementById('swal-input3') as HTMLInputElement).value
        ];
      },
      customClass: {
        popup: 'font-sans',
        title: 'text-gray-900 font-semibold',
        htmlContainer: 'text-gray-600'
      }
    });

    if (formValues) {
      const [name, email, phone] = formValues;

      Swal.fire({
        title: 'Updating User...',
        text: 'Please wait while we update the user information.',
        icon: 'info',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone })
        });

        if (response.ok) {
          await Swal.fire({
            title: 'User Updated!',
            text: 'User information has been updated successfully.',
            icon: 'success',
            confirmButtonColor: '#10b981',
            confirmButtonText: 'Great!',
            customClass: {
              popup: 'font-sans',
              title: 'text-gray-900 font-semibold',
              htmlContainer: 'text-gray-600'
            }
          });
          fetchDashboardData();
        } else {
          const errorData = await response.json();
          await Swal.fire({
            title: 'Update Failed',
            text: errorData.error || 'Failed to update user information.',
            icon: 'error',
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'font-sans',
              title: 'text-gray-900 font-semibold',
              htmlContainer: 'text-gray-600'
            }
          });
        }
      } catch (error) {
        console.error('User update failed:', error);
        await Swal.fire({
          title: 'Update Error',
          text: 'An error occurred while updating the user.',
          icon: 'error',
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'font-sans',
            title: 'text-gray-900 font-semibold',
            htmlContainer: 'text-gray-600'
          }
        });
      }
    }
  };

  const sendPasswordReset = async (email: string) => {
    const result = await Swal.fire({
      title: 'Send Password Reset?',
      text: `Send a password reset email to ${email}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Send Reset Email',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'font-sans',
        title: 'text-gray-900 font-semibold',
        htmlContainer: 'text-gray-600'
      }
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: 'Sending Email...',
        text: 'Please wait while we send the password reset email.',
        icon: 'info',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        const response = await fetch('/api/admin/users/password-reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });

        if (response.ok) {
          await Swal.fire({
            title: 'Email Sent!',
            text: 'Password reset email has been sent successfully.',
            icon: 'success',
            confirmButtonColor: '#10b981',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'font-sans',
              title: 'text-gray-900 font-semibold',
              htmlContainer: 'text-gray-600'
            }
          });
        } else {
          await Swal.fire({
            title: 'Failed to Send Email',
            text: 'Could not send password reset email. Please try again.',
            icon: 'error',
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'font-sans',
              title: 'text-gray-900 font-semibold',
              htmlContainer: 'text-gray-600'
            }
          });
        }
      } catch (error) {
        console.error('Password reset failed:', error);
        await Swal.fire({
          title: 'Email Error',
          text: 'An error occurred while sending the email.',
          icon: 'error',
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'font-sans',
            title: 'text-gray-900 font-semibold',
            htmlContainer: 'text-gray-600'
          }
        });
      }
    }
  };

  const handleUserAction = async (userId: string, action: 'suspend' | 'activate') => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const actionText = action === 'suspend' ? 'suspend' : 'activate';
    const result = await Swal.fire({
      title: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} User?`,
      text: `Are you sure you want to ${actionText} ${user.name || user.email}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: action === 'suspend' ? '#ef4444' : '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Yes, ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'font-sans',
        title: 'text-gray-900 font-semibold',
        htmlContainer: 'text-gray-600'
      }
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: action === 'suspend' ? 'suspended' : 'active' })
        });

        if (response.ok) {
          await Swal.fire({
            title: `User ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}d!`,
            text: `User has been ${actionText}d successfully.`,
            icon: 'success',
            confirmButtonColor: '#10b981',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'font-sans',
              title: 'text-gray-900 font-semibold',
              htmlContainer: 'text-gray-600'
            }
          });
          fetchDashboardData();
        } else {
          await Swal.fire({
            title: 'Action Failed',
            text: `Failed to ${actionText} user. Please try again.`,
            icon: 'error',
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'font-sans',
              title: 'text-gray-900 font-semibold',
              htmlContainer: 'text-gray-600'
            }
          });
        }
      } catch (error) {
        console.error(`User ${actionText} failed:`, error);
        await Swal.fire({
          title: 'Action Error',
          text: `An error occurred while trying to ${actionText} the user.`,
          icon: 'error',
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'font-sans',
            title: 'text-gray-900 font-semibold',
            htmlContainer: 'text-gray-600'
          }
        });
      }
    }
  };

  const exportData = async () => {
    const { value: exportType } = await Swal.fire({
      title: 'Export Data',
      text: 'What data would you like to export?',
      icon: 'question',
      input: 'select',
      inputOptions: {
        'users': 'User Data',
        'bookings': 'Booking Data',
        'all': 'All Data'
      },
      inputPlaceholder: 'Select data type',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Export',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) {
          return 'Please select a data type to export';
        }
      },
      customClass: {
        popup: 'font-sans',
        title: 'text-gray-900 font-semibold',
        htmlContainer: 'text-gray-600'
      }
    });

    if (exportType) {
      Swal.fire({
        title: 'Exporting Data...',
        text: 'Please wait while we prepare your export.',
        icon: 'info',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        const response = await fetch(`/api/admin/export?type=${exportType}`, {
          method: 'GET'
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${exportType}-export-${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          await Swal.fire({
            title: 'Export Complete!',
            text: 'Your data has been exported and downloaded successfully.',
            icon: 'success',
            confirmButtonColor: '#10b981',
            confirmButtonText: 'Great!',
            customClass: {
              popup: 'font-sans',
              title: 'text-gray-900 font-semibold',
              htmlContainer: 'text-gray-600'
            }
          });
        } else {
          await Swal.fire({
            title: 'Export Failed',
            text: 'Could not export data. Please try again.',
            icon: 'error',
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'font-sans',
              title: 'text-gray-900 font-semibold',
              htmlContainer: 'text-gray-600'
            }
          });
        }
      } catch (error) {
        console.error('Export failed:', error);
        await Swal.fire({
          title: 'Export Error',
          text: 'An error occurred while exporting data.',
          icon: 'error',
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'font-sans',
            title: 'text-gray-900 font-semibold',
            htmlContainer: 'text-gray-600'
          }
        });
      }
    }
  };

  // Booking Management Functions
  const viewBookingDetails = async (bookingId: string) => {
    Swal.fire({
      title: 'Loading Booking Details...',
      text: 'Please wait while we fetch the booking information.',
      icon: 'info',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`);
      if (response.ok) {
        const bookingData = await response.json();
        const booking = bookingData.booking;

        await Swal.fire({
          title: `Booking #${booking.id.slice(-8)}`,
          html: `
            <div class="text-left space-y-4">
              <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-900 mb-3">Customer Information</h4>
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div><strong>Name:</strong> ${booking.user.name || 'Not provided'}</div>
                  <div><strong>Email:</strong> ${booking.user.email}</div>
                  <div><strong>Phone:</strong> ${booking.user.phone || 'Not provided'}</div>
                </div>
              </div>

              <div class="bg-blue-50 p-4 rounded-lg">
                <h4 class="font-semibold text-blue-900 mb-3">Service Details</h4>
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div><strong>Service:</strong> ${booking.service.name}</div>
                  <div><strong>Price:</strong> R${booking.service.price}</div>
                  <div><strong>Duration:</strong> ${booking.service.duration} min</div>
                  <div><strong>Status:</strong> <span class="px-2 py-1 rounded text-xs ${
                    booking.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    booking.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                    booking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }">${booking.status}</span></div>
                </div>
              </div>

              <div class="bg-yellow-50 p-4 rounded-lg">
                <h4 class="font-semibold text-yellow-900 mb-3">Vehicle Information</h4>
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div><strong>Vehicle:</strong> ${booking.vehicle.make} ${booking.vehicle.model}</div>
                  <div><strong>Year:</strong> ${booking.vehicle.year}</div>
                  <div><strong>License:</strong> ${booking.vehicle.licensePlate}</div>
                  <div><strong>Color:</strong> ${booking.vehicle.color || 'Not specified'}</div>
                </div>
              </div>

              <div class="bg-green-50 p-4 rounded-lg">
                <h4 class="font-semibold text-green-900 mb-3">Booking Information</h4>
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div><strong>Date:</strong> ${new Date(booking.scheduledDate).toLocaleDateString()}</div>
                  <div><strong>Time:</strong> ${booking.scheduledTime}</div>
                  <div><strong>Total Amount:</strong> R${booking.totalAmount}</div>
                  <div><strong>Created:</strong> ${new Date(booking.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          `,
          icon: 'info',
          confirmButtonColor: '#3b82f6',
          confirmButtonText: 'Close',
          width: '700px',
          customClass: {
            popup: 'font-sans',
            title: 'text-gray-900 font-semibold',
            htmlContainer: 'text-gray-600'
          }
        });
      } else {
        await Swal.fire({
          title: 'Error Loading Booking',
          text: 'Could not fetch booking details. Please try again.',
          icon: 'error',
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'font-sans',
            title: 'text-gray-900 font-semibold',
            htmlContainer: 'text-gray-600'
          }
        });
      }
    } catch (error) {
      console.error('Failed to fetch booking details:', error);
      await Swal.fire({
        title: 'Connection Error',
        text: 'Failed to load booking details. Please check your connection and try again.',
        icon: 'error',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'font-sans',
          title: 'text-gray-900 font-semibold',
          htmlContainer: 'text-gray-600'
        }
      });
    }
  };

  const editBooking = async (bookingId: string) => {
    const { value: newStatus } = await Swal.fire({
      title: 'Update Booking Status',
      text: 'Select the new status for this booking:',
      icon: 'question',
      input: 'select',
      inputOptions: {
        'CONFIRMED': 'Confirmed',
        'IN_PROGRESS': 'In Progress',
        'COMPLETED': 'Completed',
        'CANCELLED': 'Cancelled'
      },
      inputPlaceholder: 'Select new status',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Update Status',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) {
          return 'Please select a status';
        }
      },
      customClass: {
        popup: 'font-sans',
        title: 'text-gray-900 font-semibold',
        htmlContainer: 'text-gray-600'
      }
    });

    if (newStatus) {
      await updateBookingStatus(bookingId, newStatus);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    Swal.fire({
      title: 'Updating Status...',
      text: 'Please wait while we update the booking status.',
      icon: 'info',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        await Swal.fire({
          title: 'Status Updated!',
          text: 'Booking status has been updated successfully.',
          icon: 'success',
          confirmButtonColor: '#10b981',
          confirmButtonText: 'Great!',
          customClass: {
            popup: 'font-sans',
            title: 'text-gray-900 font-semibold',
            htmlContainer: 'text-gray-600'
          }
        });
        fetchDashboardData();
      } else {
        await Swal.fire({
          title: 'Update Failed',
          text: 'Failed to update booking status. Please try again.',
          icon: 'error',
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'font-sans',
            title: 'text-gray-900 font-semibold',
            htmlContainer: 'text-gray-600'
          }
        });
      }
    } catch (error) {
      console.error('Booking update failed:', error);
      await Swal.fire({
        title: 'Update Error',
        text: 'An error occurred while updating the booking status.',
        icon: 'error',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'font-sans',
          title: 'text-gray-900 font-semibold',
          htmlContainer: 'text-gray-600'
        }
      });
    }
  };

  const sendBookingNotification = async (bookingId: string) => {
    const { value: notificationType } = await Swal.fire({
      title: 'Send Notification',
      text: 'What type of notification would you like to send?',
      icon: 'question',
      input: 'select',
      inputOptions: {
        'reminder': 'Booking Reminder',
        'confirmation': 'Booking Confirmation',
        'update': 'Status Update',
        'custom': 'Custom Message'
      },
      inputPlaceholder: 'Select notification type',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Send Notification',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) {
          return 'Please select a notification type';
        }
      },
      customClass: {
        popup: 'font-sans',
        title: 'text-gray-900 font-semibold',
        htmlContainer: 'text-gray-600'
      }
    });

    if (notificationType) {
      let customMessage = '';

      if (notificationType === 'custom') {
        const { value: message } = await Swal.fire({
          title: 'Custom Message',
          input: 'textarea',
          inputPlaceholder: 'Enter your custom message...',
          inputAttributes: {
            'aria-label': 'Type your custom message here'
          },
          showCancelButton: true,
          confirmButtonColor: '#3b82f6',
          cancelButtonColor: '#6b7280',
          confirmButtonText: 'Send Message',
          cancelButtonText: 'Cancel',
          inputValidator: (value) => {
            if (!value) {
              return 'Please enter a message';
            }
          },
          customClass: {
            popup: 'font-sans',
            title: 'text-gray-900 font-semibold',
            htmlContainer: 'text-gray-600'
          }
        });

        if (!message) return;
        customMessage = message;
      }

      Swal.fire({
        title: 'Sending Notification...',
        text: 'Please wait while we send the notification to the customer.',
        icon: 'info',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        const response = await fetch(`/api/admin/bookings/${bookingId}/notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: notificationType,
            message: customMessage
          })
        });

        if (response.ok) {
          await Swal.fire({
            title: 'Notification Sent!',
            text: 'The notification has been sent to the customer successfully.',
            icon: 'success',
            confirmButtonColor: '#10b981',
            confirmButtonText: 'Great!',
            customClass: {
              popup: 'font-sans',
              title: 'text-gray-900 font-semibold',
              htmlContainer: 'text-gray-600'
            }
          });
        } else {
          await Swal.fire({
            title: 'Failed to Send',
            text: 'Could not send the notification. Please try again.',
            icon: 'error',
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'font-sans',
              title: 'text-gray-900 font-semibold',
              htmlContainer: 'text-gray-600'
            }
          });
        }
      } catch (error) {
        console.error('Notification failed:', error);
        await Swal.fire({
          title: 'Notification Error',
          text: 'An error occurred while sending the notification.',
          icon: 'error',
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'font-sans',
            title: 'text-gray-900 font-semibold',
            htmlContainer: 'text-gray-600'
          }
        });
      }
    }
  };

  const cancelBooking = async (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const result = await Swal.fire({
      title: 'Cancel Booking?',
      html: `
        <div class="text-left">
          <p class="mb-3">Are you sure you want to cancel this booking?</p>
          <div class="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
            <p class="text-sm text-yellow-800"><strong>Customer:</strong> ${booking.user?.name || booking.user?.email}</p>
            <p class="text-sm text-yellow-800"><strong>Service:</strong> ${booking.service?.name}</p>
            <p class="text-sm text-yellow-800"><strong>Date:</strong> ${new Date(booking.scheduledDate).toLocaleDateString()}</p>
          </div>
          <p class="mt-3 text-sm text-gray-600">The customer will be notified of the cancellation.</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Cancel Booking',
      cancelButtonText: 'Keep Booking',
      reverseButtons: true,
      customClass: {
        popup: 'font-sans',
        title: 'text-gray-900 font-semibold',
        htmlContainer: 'text-gray-600'
      }
    });

    if (result.isConfirmed) {
      await updateBookingStatus(bookingId, 'CANCELLED');
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Shield className="w-8 h-8 text-red-400" />
            <div>
              <h1 className="text-2xl font-bold">Admin Control Panel</h1>
              <p className="text-slate-400">Welcome, {session.user.name}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              Alerts
            </Button>
            <Button 
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              variant="outline" 
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-800 min-h-screen p-4">
          <nav className="space-y-2">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('overview')}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Overview
            </Button>
            <Button
              variant={activeTab === 'users' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('users')}
            >
              <Users className="w-4 h-4 mr-2" />
              User Management
            </Button>
            <Button
              variant={activeTab === 'bookings' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('bookings')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Booking Management
            </Button>
            <Button
              variant={activeTab === 'services' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('services')}
            >
              <Car className="w-4 h-4 mr-2" />
              Services & Pricing
            </Button>
            <Button
              variant={activeTab === 'washbay' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('washbay')}
            >
              <Wrench className="w-4 h-4 mr-2" />
              Wash Bay Tracking
            </Button>
            <Button
              variant={activeTab === 'database' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('database')}
            >
              <Database className="w-4 h-4 mr-2" />
              Database Management
            </Button>
            <Button
              variant={activeTab === 'settings' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="w-4 h-4 mr-2" />
              System Settings
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Dashboard Overview</h2>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-slate-400">Total Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-400">{stats.totalUsers}</div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-slate-400">Active Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-400">{stats.activeBookings}</div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-slate-400">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-yellow-400">
                      {formatCurrency(stats.totalRevenue)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-slate-400">Today's Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-400">{stats.todayBookings}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => setActiveTab('users')}
                      title="Switch to User Management tab to add new users"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Add User
                    </Button>
                    <Button 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => setActiveTab('services')}
                      title="Switch to Services & Pricing tab to manage services"
                    >
                      <Car className="w-4 h-4 mr-2" />
                      Add Service
                    </Button>
                    <Button 
                      className="bg-yellow-600 hover:bg-yellow-700"
                      onClick={() => exportData()}
                      title="Export all system data to CSV/Excel format"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                    <Button 
                      className="bg-purple-600 hover:bg-purple-700"
                      onClick={() => performDBBackup()}
                      title="Create a full database backup"
                    >
                      <Database className="w-4 h-4 mr-2" />
                      DB Backup
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold">User Management</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-800 border-slate-600"
                    />
                  </div>
                  <Button>
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>

              {/* Users Table */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>All Users ({filteredUsers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-3 px-4">User</th>
                          <th className="text-left py-3 px-4">Contact</th>
                          <th className="text-left py-3 px-4">Stats</th>
                          <th className="text-left py-3 px-4">Status</th>
                          <th className="text-left py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium">{user.name || 'N/A'}</div>
                                <div className="text-sm text-slate-400">ID: {user.id.slice(-8)}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <div className="text-sm">{user.email}</div>
                                <div className="text-sm text-slate-400">{user.phone || 'No phone'}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm">
                                <div>{user.bookingCount} bookings</div>
                                <div className="text-slate-400">{formatCurrency(user.totalSpent)} spent</div>
                                <div className="text-yellow-400">{user.loyaltyPoints} points</div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={
                                user.status === 'active' ? 'bg-green-600' :
                                user.status === 'suspended' ? 'bg-red-600' : 'bg-gray-600'
                              }>
                                {user.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => viewUserDetails(user.id)}
                                  title="View user profile and booking history"
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => editUser(user.id)}
                                  title="Edit user profile and settings"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => sendPasswordReset(user.email)}
                                  title="Send password reset email to user"
                                >
                                  <Key className="w-3 h-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleUserAction(user.id, user.status === 'active' ? 'suspend' : 'activate')}
                                  title={user.status === 'active' ? 'Suspend user account' : 'Activate user account'}
                                >
                                  {user.status === 'active' ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => deleteUser(user.id)}
                                  title="Permanently delete user account"
                                  className="text-red-400 hover:text-red-300 hover:border-red-400"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Booking Management</h2>
              
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>Recent Bookings ({bookings.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-3 px-4">Booking</th>
                          <th className="text-left py-3 px-4">Customer</th>
                          <th className="text-left py-3 px-4">Vehicle</th>
                          <th className="text-left py-3 px-4">Service</th>
                          <th className="text-left py-3 px-4">Amount</th>
                          <th className="text-left py-3 px-4">Status</th>
                          <th className="text-left py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking) => (
                          <tr key={booking.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium">#{booking.id.slice(-8)}</div>
                                <div className="text-sm text-slate-400">
                                  {new Date(booking.bookingDate).toLocaleDateString()} {booking.timeSlot}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium">{booking.user.name}</div>
                                <div className="text-sm text-slate-400">{booking.user.email}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium">{booking.vehicle.make} {booking.vehicle.model}</div>
                                <div className="text-sm text-slate-400 font-mono">{booking.vehicle.licensePlate}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium">{booking.service.name}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium">{formatCurrency(booking.totalAmount)}</div>
                                <div className="text-sm text-slate-400">
                                  {booking.payment?.paymentMethodType || 'N/A'}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={
                                booking.status === 'CONFIRMED' ? 'bg-blue-600' :
                                booking.status === 'COMPLETED' ? 'bg-green-600' :
                                booking.status === 'CANCELLED' ? 'bg-red-600' : 'bg-gray-600'
                              }>
                                {booking.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => viewBookingDetails(booking.id)}
                                  title="View detailed booking information"
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => editBooking(booking.id)}
                                  title="Edit booking details and status"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => sendBookingNotification(booking.id)}
                                  title="Send notification/reminder to customer"
                                >
                                  <Mail className="w-3 h-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => cancelBooking(booking.id)}
                                  title="Cancel this booking"
                                  className="text-red-400 hover:text-red-300 hover:border-red-400"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Services Tab - Placeholder */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Services & Pricing Management</h2>
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <p className="text-slate-400">Service management interface coming next...</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Wash Bay Tracking System */}
          {activeTab === 'washbay' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold">🚗 Wash Bay Tracking System</h2>
                <div className="flex items-center space-x-4">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <MapPin className="w-4 h-4 mr-2" />
                    Active Bays: 3/5
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Bell className="w-4 h-4 mr-2" />
                    Send Alerts
                  </Button>
                </div>
              </div>

              {/* Wash Bay Status Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Bay 1 */}
                <Card className="bg-slate-800 border-green-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-green-400 flex items-center">
                      <Car className="w-5 h-5 mr-2" />
                      Bay 1 - Active
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <div className="font-medium">BMW X5 (ABC-123-GP)</div>
                      <div className="text-slate-400">Premium Wash</div>
                      <div className="text-green-400">Step 3/5: Interior Clean</div>
                    </div>
                    <div className="space-y-2">
                      <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                        <Camera className="w-3 h-3 mr-2" />
                        Take Photo
                      </Button>
                      <Button size="sm" className="w-full" variant="outline">
                        <CheckCircle className="w-3 h-3 mr-2" />
                        Complete Step
                      </Button>
                      <Button size="sm" className="w-full" variant="outline">
                        <Bell className="w-3 h-3 mr-2" />
                        Notify Customer
                      </Button>
                    </div>
                    <div className="text-xs text-slate-400">
                      <div>Started: 10:30 AM</div>
                      <div>ETA: 11:45 AM</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bay 2 */}
                <Card className="bg-slate-800 border-yellow-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-yellow-400 flex items-center">
                      <Car className="w-5 h-5 mr-2" />
                      Bay 2 - Waiting
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <div className="font-medium">Toyota Camry (XYZ-456-GP)</div>
                      <div className="text-slate-400">Express Wash</div>
                      <div className="text-yellow-400">Ready to Start</div>
                    </div>
                    <div className="space-y-2">
                      <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                        <Clock className="w-3 h-3 mr-2" />
                        Start Service
                      </Button>
                      <Button size="sm" className="w-full" variant="outline">
                        <Eye className="w-3 h-3 mr-2" />
                        View Details
                      </Button>
                    </div>
                    <div className="text-xs text-slate-400">
                      <div>Scheduled: 11:00 AM</div>
                      <div>Customer: John Doe</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bay 3 */}
                <Card className="bg-slate-800 border-green-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-green-400 flex items-center">
                      <Car className="w-5 h-5 mr-2" />
                      Bay 3 - Active
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm">
                      <div className="font-medium">Mercedes C-Class (DEF-789-GP)</div>
                      <div className="text-slate-400">Deluxe Detailing</div>
                      <div className="text-green-400">Step 5/7: Final Inspection</div>
                    </div>
                    <div className="space-y-2">
                      <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                        <CheckCircle className="w-3 h-3 mr-2" />
                        Complete Service
                      </Button>
                      <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                        <Camera className="w-3 h-3 mr-2" />
                        Final Photos
                      </Button>
                    </div>
                    <div className="text-xs text-slate-400">
                      <div>Started: 9:15 AM</div>
                      <div>Almost Done!</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bay 4 - Available */}
                <Card className="bg-slate-800 border-slate-600">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-slate-400 flex items-center">
                      <Car className="w-5 h-5 mr-2" />
                      Bay 4 - Available
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-center text-slate-400">
                      <div>No active service</div>
                      <div className="mt-4">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Assign Next Car
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bay 5 - Available */}
                <Card className="bg-slate-800 border-slate-600">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-slate-400 flex items-center">
                      <Car className="w-5 h-5 mr-2" />
                      Bay 5 - Available
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-center text-slate-400">
                      <div>No active service</div>
                      <div className="mt-4">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          Assign Next Car
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Today's Wash Queue */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-400" />
                    Today's Wash Queue (8 cars)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left py-3 px-4">Time</th>
                          <th className="text-left py-3 px-4">Vehicle</th>
                          <th className="text-left py-3 px-4">Service</th>
                          <th className="text-left py-3 px-4">Customer</th>
                          <th className="text-left py-3 px-4">Status</th>
                          <th className="text-left py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-700 hover:bg-slate-700/50">
                          <td className="py-3 px-4">11:30 AM</td>
                          <td className="py-3 px-4">
                            <div className="font-medium">Honda Civic</div>
                            <div className="text-sm text-slate-400">GHI-101-GP</div>
                          </td>
                          <td className="py-3 px-4">Express Wash</td>
                          <td className="py-3 px-4">Sarah Johnson</td>
                          <td className="py-3 px-4">
                            <Badge className="bg-yellow-600">Waiting</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline" title="Check car into bay">
                                <MapPin className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline" title="Send customer notification">
                                <Mail className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                        <tr className="border-b border-slate-700 hover:bg-slate-700/50">
                          <td className="py-3 px-4">12:00 PM</td>
                          <td className="py-3 px-4">
                            <div className="font-medium">Ford F-150</div>
                            <div className="text-sm text-slate-400">JKL-202-GP</div>
                          </td>
                          <td className="py-3 px-4">Premium Wash</td>
                          <td className="py-3 px-4">Mike Wilson</td>
                          <td className="py-3 px-4">
                            <Badge className="bg-blue-600">Scheduled</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline" title="View booking details">
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="outline" title="Edit booking">
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Database Tab - Placeholder */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Database Management</h2>
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <p className="text-slate-400">Database management interface coming next...</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Settings Tab - Placeholder */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">System Settings</h2>
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <p className="text-slate-400">System settings interface coming next...</p>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}