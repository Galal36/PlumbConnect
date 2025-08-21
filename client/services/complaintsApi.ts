// Complaints API Service
const API_BASE_URL = 'http://localhost:8001/api/complaints';

export interface ComplaintUser {
  id: number;
  name: string;
  role: string;
  phone: string;
}

export interface Complaint {
  id: number;
  from_user: ComplaintUser;
  to_user: ComplaintUser;
  complaint_type: string;
  complaint_type_display: string;
  description: string;
  related_chat: number | null;
  status: string;
  status_display: string;
  admin_notes: string;
  resolved_by: ComplaintUser | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface ComplaintCreate {
  to_user_id: number;
  complaint_type: string;
  description: string;
}

export interface UserOption {
  id: number;
  name: string;
  email: string | null;
  role: string;
  phone: string;
  status: string;
}

export interface ComplaintStats {
  total_complaints?: number;
  pending_complaints?: number;
  in_progress_complaints?: number;
  resolved_complaints?: number;
  rejected_complaints?: number;
  complaints_by_type?: Record<string, number>;
  filed_complaints?: number;
  received_complaints?: number;
  pending_filed?: number;
  resolved_filed?: number;
  pending_received?: number;
  resolved_received?: number;
}

export const COMPLAINT_TYPES = [
  { value: 'inappropriate_behavior', label: 'سلوك غير لائق' },
  { value: 'poor_service_quality', label: 'جودة خدمة سيئة' },
  { value: 'payment_issues', label: 'مشاكل في الدفع' },
  { value: 'spam_harassment', label: 'إزعاج أو سبام' },
  { value: 'fraud_scam', label: 'احتيال أو نصب' },
  { value: 'other', label: 'أخرى' },
];

export const COMPLAINT_STATUS = [
  { value: 'pending', label: 'قيد المراجعة' },
  { value: 'in_progress', label: 'تحت التحقيق' },
  { value: 'resolved', label: 'تم الحل' },
  { value: 'rejected', label: 'مرفوضة' },
];

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

class ComplaintsApiService {
  async getComplaints(params?: {
    complaint_type?: string;
    status?: string;
    search?: string;
    ordering?: string;
  }): Promise<Complaint[]> {
    const queryParams = new URLSearchParams();
    if (params?.complaint_type) queryParams.append('complaint_type', params.complaint_type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.ordering) queryParams.append('ordering', params.ordering);

    const url = queryParams.toString() ? `${API_BASE_URL}/?${queryParams}` : `${API_BASE_URL}/`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);

    // Handle paginated response - extract results array
    if (data && typeof data === 'object' && 'results' in data) {
      return data.results || [];
    }

    // Handle direct array response
    if (Array.isArray(data)) {
      return data;
    }

    // Fallback to empty array
    console.warn('Unexpected complaints API response format:', data);
    return [];
  }

  async getComplaint(id: number): Promise<Complaint> {
    const response = await fetch(`${API_BASE_URL}/${id}/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  }

  async createComplaint(complaint: ComplaintCreate): Promise<Complaint> {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(complaint),
    });

    return handleResponse(response);
  }

  async updateComplaint(id: number, data: { status?: string; admin_notes?: string }): Promise<Complaint> {
    const response = await fetch(`${API_BASE_URL}/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return handleResponse(response);
  }

  async deleteComplaint(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
  }

  async getComplaintStats(): Promise<ComplaintStats> {
    const response = await fetch(`${API_BASE_URL}/stats/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return handleResponse(response);
  }

  async getUsers(): Promise<UserOption[]> {
    const response = await fetch('http://localhost:8001/api/users/', {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    const data = await handleResponse(response);
    console.log('Raw users API response:', data); // Debug log

    // The API returns paginated results with a 'results' field
    let users = data.results || data;

    // Ensure we have an array
    if (!Array.isArray(users)) {
      console.error('Users data is not an array:', users);
      return [];
    }

    // Filter only active users
    return users.filter(user => user.status === 'active');
  }
}

export const complaintsApiService = new ComplaintsApiService();
