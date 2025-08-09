'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Car, Shield, Plus, Edit, Trash2 } from 'lucide-react';
import { GDPRCompliance } from '@/components/legal/gdpr-compliance';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
}

interface UserData {
  id: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  vehicles: Vehicle[];
}

interface ProfileClientProps {
  user: UserData;
}

export function ProfileClient({ user }: ProfileClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email,
    phone: user.phone || '',
    address: user.address || '',
    city: user.city || '',
    province: user.province || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Profile updated successfully!');
        router.refresh();
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      toast.error('An error occurred while updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVehicle = () => {
    router.push('/vehicles/add');
  };

  const handleEditVehicle = (vehicleId: string) => {
    router.push(`/vehicles/edit/${vehicleId}`);
  };

  const handleRemoveVehicle = async (vehicleId: string, vehicleName: string) => {
    const result = await Swal.fire({
      title: 'Remove Vehicle?',
      text: `Are you sure you want to remove ${vehicleName}? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Remove',
      cancelButtonText: 'Cancel',
      allowOutsideClick: false,
      allowEscapeKey: true,
      buttonsStyling: true,
      customClass: {
        popup: 'font-sans !important',
        title: 'text-gray-900 font-semibold !important',
        htmlContainer: 'text-gray-600 !important',
        confirmButton: 'swal2-confirm !important',
        cancelButton: 'swal2-cancel !important',
        actions: 'swal2-actions !important'
      },
      didOpen: () => {
        const confirmBtn = document.querySelector('.swal2-confirm') as HTMLElement;
        const cancelBtn = document.querySelector('.swal2-cancel') as HTMLElement;
        const actionsContainer = document.querySelector('.swal2-actions') as HTMLElement;

        if (confirmBtn) {
          confirmBtn.style.display = 'inline-block';
          confirmBtn.style.margin = '0 8px';
        }
        if (cancelBtn) {
          cancelBtn.style.display = 'inline-block';
          cancelBtn.style.margin = '0 8px';
        }
        if (actionsContainer) {
          actionsContainer.style.display = 'flex';
          actionsContainer.style.justifyContent = 'center';
          actionsContainer.style.gap = '16px';
        }
      }
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/vehicles/${vehicleId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          toast.success('Vehicle removed successfully');
          router.refresh();
        } else {
          toast.error('Failed to remove vehicle');
        }
      } catch (error) {
        toast.error('An error occurred while removing vehicle');
      }
    }
  };

  const handleEnable2FA = () => {
    toast.info('2FA setup will be implemented in a future update');
    // router.push('/profile/2fa/setup');
  };

  const handleChangePassword = () => {
    router.push('/profile/change-password');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <DashboardSidebar activeTab="profile" />
          </div>

          <div className="lg:col-span-3">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-gray-600">Manage your account information and preferences</p>
            </div>

            <div className="space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <Input 
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <Input 
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter your last name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <Input 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled
                        className="bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <Input 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <Input 
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Enter your address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <Input 
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="Enter your city"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
                      <Input 
                        name="province"
                        value={formData.province}
                        onChange={handleInputChange}
                        placeholder="Enter your province"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vehicle Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Car className="w-5 h-5 mr-2" />
                      Vehicle Information
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddVehicle}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Vehicle
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {user.vehicles.length === 0 ? (
                    <div className="text-center py-8">
                      <Car className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">No vehicles registered yet</p>
                      <Button
                        onClick={handleAddVehicle}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Vehicle
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {user.vehicles.map((vehicle) => (
                        <div key={vehicle.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </p>
                            <p className="text-sm text-gray-600">
                              {vehicle.color} • {vehicle.licensePlate}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditVehicle(vehicle.id)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleRemoveVehicle(vehicle.id, `${vehicle.year} ${vehicle.make} ${vehicle.model}`)}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Account Security */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Account Security
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-600">Add an extra layer of security</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleEnable2FA}
                      >
                        Enable
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Change Password</h4>
                        <p className="text-sm text-gray-600">Update your account password</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleChangePassword}
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>

            {/* GDPR Compliance Section */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-600" />
                  Data Privacy & GDPR Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GDPRCompliance showManagement={true} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
