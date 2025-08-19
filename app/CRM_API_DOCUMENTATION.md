# Car Wash CRM API Integration Guide

## 🔐 Authentication

All CRM API endpoints require authentication using an API key.

### Headers Required:
```
X-API-Key: YOUR_CRM_API_KEY
Content-Type: application/json
```

### Environment Variables:
Add to your `.env.local` file:
```env
CRM_API_KEY=your-secure-api-key-here
CRM_ORIGIN_URL=https://your-crm-domain.com
```

---

## 📋 API Endpoints

### 1. Search Bookings
**Endpoint:** `GET /api/crm/bookings/search`

Search bookings by various criteria for customer service inquiries.

#### Query Parameters:
- `reference` - 8-character booking reference (e.g., "XXGPX71K")
- `firstName` - Customer first name (partial match)
- `lastName` - Customer last name (partial match)
- `email` - Customer email (partial match)
- `phone` - Customer phone number (partial match)
- `licensePlate` - Vehicle license plate (partial match)
- `dateOfBirth` - Customer date of birth (YYYY-MM-DD)
- `bookingDate` - Booking date (YYYY-MM-DD)
- `status` - Booking status (CONFIRMED, CANCELLED, COMPLETED, etc.)
- `page` - Page number for pagination (default: 1)
- `limit` - Results per page (default: 20, max: 100)

#### Example Requests:

**Search by booking reference:**
```bash
curl -H "X-API-Key: YOUR_API_KEY" \
  "https://your-domain.com/api/crm/bookings/search?reference=XXGPX71K"
```

**Search by customer name:**
```bash
curl -H "X-API-Key: YOUR_API_KEY" \
  "https://your-domain.com/api/crm/bookings/search?firstName=John&lastName=Smith"
```

**Search by license plate:**
```bash
curl -H "X-API-Key: YOUR_API_KEY" \
  "https://your-domain.com/api/crm/bookings/search?licensePlate=ABC123GP"
```

#### Response Format:
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "clh1234567890",
        "referenceNumber": "XXGPX71K",
        "status": "CONFIRMED",
        "bookingDate": "2025-08-19T00:00:00.000Z",
        "timeSlot": "08:00",
        "totalAmount": 18000,
        "totalAmountFormatted": "R180.00",
        "bookingDateFormatted": "19/08/2025",
        "user": {
          "firstName": "John",
          "lastName": "Smith",
          "email": "john@example.com",
          "phone": "+27123456789"
        },
        "service": {
          "name": "Express Exterior Wash",
          "category": "EXPRESS",
          "duration": 15
        },
        "vehicle": {
          "make": "Toyota",
          "model": "Camry",
          "year": 2022,
          "licensePlate": "ABC123GP",
          "color": "White"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

---

### 2. Get Booking Details
**Endpoint:** `GET /api/crm/bookings/{id}`

Get complete details for a specific booking by ID or reference number.

#### Parameters:
- `id` - Full booking ID or 8-character reference number

#### Example Request:
```bash
curl -H "X-API-Key: YOUR_API_KEY" \
  "https://your-domain.com/api/crm/bookings/XXGPX71K"
```

#### Response Format:
```json
{
  "success": true,
  "data": {
    "id": "clh1234567890",
    "referenceNumber": "XXGPX71K",
    "status": "CONFIRMED",
    "totalAmountFormatted": "R180.00",
    "bookingDateFormatted": "19/08/2025",
    "bookingTimeFormatted": "08:00",
    "customerSummary": {
      "fullName": "John Smith",
      "contact": {
        "email": "john@example.com",
        "phone": "+27123456789"
      },
      "dateOfBirth": "15/06/1985",
      "loyaltyPoints": 150
    },
    "vehicleSummary": {
      "display": "2022 Toyota Camry",
      "licensePlate": "ABC123GP",
      "details": {
        "color": "White",
        "type": "SEDAN"
      }
    },
    "serviceSummary": {
      "name": "Express Exterior Wash",
      "duration": "15 minutes",
      "basePrice": "R80.00",
      "features": ["Exterior wash", "Quick dry", "Tire cleaning"]
    },
    "paymentSummary": {
      "amount": "R180.00",
      "status": "COMPLETED",
      "method": "VISA",
      "paymentDate": "19/08/2025, 10:30:00"
    },
    "statusInfo": {
      "current": "CONFIRMED",
      "canCancel": true,
      "canModify": true
    }
  }
}
```

---

### 3. Update Booking
**Endpoint:** `PUT /api/crm/bookings/{id}`

Update booking status or add notes (for CRM operations).

#### Request Body:
```json
{
  "status": "CANCELLED",
  "cancellationReason": "Customer requested cancellation",
  "notes": "Called customer - vehicle breakdown"
}
```

#### Example Request:
```bash
curl -X PUT \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"status": "CANCELLED", "cancellationReason": "Customer request"}' \
  "https://your-domain.com/api/crm/bookings/XXGPX71K"
```

---

### 4. Dashboard Statistics
**Endpoint:** `GET /api/crm/dashboard/stats`

Get comprehensive business statistics for the car wash.

#### Query Parameters:
- `startDate` - Start date for statistics (YYYY-MM-DD)
- `endDate` - End date for statistics (YYYY-MM-DD)

#### Example Request:
```bash
curl -H "X-API-Key: YOUR_API_KEY" \
  "https://your-domain.com/api/crm/dashboard/stats?startDate=2025-08-01&endDate=2025-08-31"
```

#### Response Format:
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalBookings": 156,
      "confirmedBookings": 134,
      "cancelledBookings": 12,
      "completedBookings": 10,
      "totalRevenueFormatted": "R23,450.00",
      "totalCustomers": 89,
      "newCustomers": 23,
      "averageBookingValueFormatted": "R234.50",
      "conversionRate": 85.9,
      "cancellationRate": 7.7
    },
    "popularServices": [
      {
        "serviceName": "Express Exterior Wash",
        "category": "EXPRESS", 
        "bookingCount": 45
      }
    ],
    "statusBreakdown": [
      {
        "status": "CONFIRMED",
        "count": 134,
        "percentage": 85.9
      }
    ],
    "monthlyTrends": [
      {
        "month": "August 2025",
        "bookings": 156,
        "revenueFormatted": "R23,450.00",
        "uniqueCustomers": 89
      }
    ]
  }
}
```

---

## 🔍 Common Use Cases

### 1. Customer Calls About Booking
When a customer calls with their booking reference:

1. **Search by reference:** `GET /api/crm/bookings/search?reference=XXGPX71K`
2. **Get full details:** `GET /api/crm/bookings/XXGPX71K`
3. **Update if needed:** `PUT /api/crm/bookings/XXGPX71K`

### 2. Customer Doesn't Have Reference
Search by other criteria:
- **By name:** `GET /api/crm/bookings/search?firstName=John&lastName=Smith`
- **By license plate:** `GET /api/crm/bookings/search?licensePlate=ABC123`
- **By phone:** `GET /api/crm/bookings/search?phone=0123456789`

### 3. Business Analytics
Get performance metrics:
- **Current month:** `GET /api/crm/dashboard/stats`
- **Custom period:** `GET /api/crm/dashboard/stats?startDate=2025-08-01&endDate=2025-08-31`

---

## 🛡️ Security Notes

1. **Keep API key secure** - Store in environment variables, never in code
2. **HTTPS only** - All requests must use HTTPS in production
3. **IP restrictions** - Consider adding IP whitelist if needed
4. **Rate limiting** - Implement rate limiting in your CRM to avoid overload

---

## 📞 Integration Support

For integration support or questions about the API, check the logs for detailed error messages. All API calls are logged with timestamps for debugging.