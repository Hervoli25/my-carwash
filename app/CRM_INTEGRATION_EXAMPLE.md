# CRM Integration Example Code

## 🚀 **Quick Start for Your CRM**

### **Step 1: Environment Variables**
Add to your CRM `.env.local`:
```env
# Car Wash API Integration
CARWASH_API_URL="https://mycarwash-tan.vercel.app"
CARWASH_API_KEY="ekhaya-car-wash-secret-key-2024"
```

### **Step 2: API Client Setup**
Create `lib/carwash-api.ts` in your CRM:

```typescript
// lib/carwash-api.ts
const CARWASH_API_URL = process.env.CARWASH_API_URL || 'https://mycarwash-tan.vercel.app';
const API_KEY = process.env.CARWASH_API_KEY || 'ekhaya-car-wash-secret-key-2024';

class CarWashAPI {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = CARWASH_API_URL;
    this.apiKey = API_KEY;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}/api/crm${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Search bookings by reference number
  async searchByReference(reference: string) {
    return this.request(`/bookings/search?reference=${reference}`);
  }

  // Search bookings by customer name
  async searchByName(firstName?: string, lastName?: string) {
    const params = new URLSearchParams();
    if (firstName) params.append('firstName', firstName);
    if (lastName) params.append('lastName', lastName);
    
    return this.request(`/bookings/search?${params.toString()}`);
  }

  // Search by license plate
  async searchByLicensePlate(licensePlate: string) {
    return this.request(`/bookings/search?licensePlate=${licensePlate}`);
  }

  // Search by phone or email
  async searchByContact(phone?: string, email?: string) {
    const params = new URLSearchParams();
    if (phone) params.append('phone', phone);
    if (email) params.append('email', email);
    
    return this.request(`/bookings/search?${params.toString()}`);
  }

  // Get booking details
  async getBookingDetails(bookingId: string) {
    return this.request(`/bookings/${bookingId}`);
  }

  // Update booking status
  async updateBooking(bookingId: string, updates: any) {
    return this.request(`/bookings/${bookingId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Get dashboard statistics
  async getDashboardStats(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return this.request(`/dashboard/stats?${params.toString()}`);
  }
}

export const carWashAPI = new CarWashAPI();
```

### **Step 3: React Hook for CRM Dashboard**
Create `hooks/useCarWashData.ts`:

```typescript
// hooks/useCarWashData.ts
import { useState, useEffect } from 'react';
import { carWashAPI } from '@/lib/carwash-api';

export function useCarWashSearch() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const searchBookings = async (searchType: string, searchValue: string) => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      
      switch (searchType) {
        case 'reference':
          response = await carWashAPI.searchByReference(searchValue);
          break;
        case 'firstName':
          response = await carWashAPI.searchByName(searchValue);
          break;
        case 'lastName':
          response = await carWashAPI.searchByName(undefined, searchValue);
          break;
        case 'fullName':
          const [firstName, lastName] = searchValue.split(' ');
          response = await carWashAPI.searchByName(firstName, lastName);
          break;
        case 'licensePlate':
          response = await carWashAPI.searchByLicensePlate(searchValue);
          break;
        case 'phone':
          response = await carWashAPI.searchByContact(searchValue);
          break;
        case 'email':
          response = await carWashAPI.searchByContact(undefined, searchValue);
          break;
        default:
          throw new Error('Invalid search type');
      }
      
      setResults(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { searchBookings, loading, results, error };
}

export function useCarWashStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await carWashAPI.getDashboardStats();
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch car wash stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
}
```

### **Step 4: CRM Search Component**
Create `components/CarWashSearch.tsx`:

```tsx
// components/CarWashSearch.tsx
import { useState } from 'react';
import { useCarWashSearch } from '@/hooks/useCarWashData';

export function CarWashSearch() {
  const [searchType, setSearchType] = useState('reference');
  const [searchValue, setSearchValue] = useState('');
  const { searchBookings, loading, results, error } = useCarWashSearch();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      searchBookings(searchType, searchValue.trim());
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">🚗 Car Wash Booking Search</h2>
        
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search Type</label>
              <select 
                value={searchType} 
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full p-3 border rounded-lg"
              >
                <option value="reference">Booking Reference (e.g., XXGPX71K)</option>
                <option value="fullName">Customer Name</option>
                <option value="licensePlate">License Plate</option>
                <option value="phone">Phone Number</option>
                <option value="email">Email Address</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Search Value</label>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={`Enter ${searchType}...`}
                className="w-full p-3 border rounded-lg"
                required
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search Bookings'}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      )}

      {results && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            Search Results ({results.data.pagination.total} found)
          </h3>
          
          <div className="space-y-4">
            {results.data.bookings.map((booking: any) => (
              <div key={booking.id} className="border p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="font-semibold text-lg">#{booking.referenceNumber}</p>
                    <p className="text-gray-600">{booking.user.firstName} {booking.user.lastName}</p>
                    <p className="text-sm text-gray-500">{booking.user.email}</p>
                  </div>
                  
                  <div>
                    <p><strong>Service:</strong> {booking.service.name}</p>
                    <p><strong>Vehicle:</strong> {booking.vehicle.licensePlate}</p>
                    <p><strong>Date:</strong> {booking.bookingDateFormatted} at {booking.timeSlot}</p>
                  </div>
                  
                  <div>
                    <p><strong>Status:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded text-sm ${
                        booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status}
                      </span>
                    </p>
                    <p><strong>Total:</strong> {booking.totalAmountFormatted}</p>
                  </div>
                </div>
                
                <div className="mt-3 flex space-x-2">
                  <button 
                    onClick={() => window.open(`/car-wash/booking/${booking.id}`, '_blank')}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm hover:bg-blue-200"
                  >
                    View Details
                  </button>
                  {booking.status === 'CONFIRMED' && (
                    <button 
                      onClick={() => {/* Add update logic */}}
                      className="bg-orange-100 text-orange-800 px-3 py-1 rounded text-sm hover:bg-orange-200"
                    >
                      Update Status
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

### **Step 5: Dashboard Stats Component**
Create `components/CarWashDashboard.tsx`:

```tsx
// components/CarWashDashboard.tsx
import { useCarWashStats } from '@/hooks/useCarWashData';

export function CarWashDashboard() {
  const { stats, loading } = useCarWashStats();

  if (loading) {
    return <div className="p-6">Loading car wash statistics...</div>;
  }

  if (!stats) {
    return <div className="p-6">Unable to load car wash data.</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">🚗 Car Wash Business Overview</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800">Total Bookings</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.summary.totalBookings}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800">Revenue</h3>
          <p className="text-2xl font-bold text-green-600">{stats.summary.totalRevenueFormatted}</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-800">Customers</h3>
          <p className="text-2xl font-bold text-purple-600">{stats.summary.totalCustomers}</p>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-orange-800">Avg. Booking</h3>
          <p className="text-2xl font-bold text-orange-600">{stats.summary.averageBookingValueFormatted}</p>
        </div>
      </div>

      {/* Popular Services */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Popular Services</h3>
        <div className="space-y-2">
          {stats.popularServices.map((service: any) => (
            <div key={service.serviceId} className="flex justify-between items-center">
              <span>{service.serviceName}</span>
              <span className="bg-gray-100 px-2 py-1 rounded">{service.bookingCount} bookings</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
        <div className="space-y-3">
          {stats.recentBookings.slice(0, 5).map((booking: any) => (
            <div key={booking.id} className="flex justify-between items-center border-b pb-2">
              <div>
                <span className="font-medium">#{booking.referenceNumber}</span>
                <span className="ml-2 text-gray-600">{booking.customerName}</span>
              </div>
              <div className="text-right">
                <div className="text-sm">{booking.service}</div>
                <div className="text-xs text-gray-500">{booking.createdAt}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### **Step 6: Test the Integration**

You can test the API endpoints directly:

```bash
# Search by booking reference
curl -H "X-API-Key: ekhaya-car-wash-secret-key-2024" \
  "https://mycarwash-tan.vercel.app/api/crm/bookings/search?reference=XXGPX71K"

# Get dashboard stats
curl -H "X-API-Key: ekhaya-car-wash-secret-key-2024" \
  "https://mycarwash-tan.vercel.app/api/crm/dashboard/stats"
```

This setup gives you a complete CRM integration that can search and manage car wash bookings using the existing 8-character reference system!