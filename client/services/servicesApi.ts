import { formatError } from "@/utils";

// Services API Base URL
const API_BASE_URL = 'http://localhost:8001/api';

// Types for Service requests and responses
export interface ServiceRequest {
  id: number;
  sender: number;
  receiver: number;
  sender_details: {
    id: number;
    name: string;
    email: string;
    phone: string;
    location: {
      id: number;
      city: string;
    };
    role: 'client' | 'plumber' | 'admin';
    status: string;
    image?: string;
  };
  receiver_details: {
    id: number;
    name: string;
    email: string;
    phone: string;
    location: {
      id: number;
      city: string;
    };
    role: 'client' | 'plumber' | 'admin';
    status: string;
    image?: string;
  };
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  amount: string;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceRequest {
  receiver: number;
  amount?: number;
}

export interface UpdateServiceRequest {
  status: 'accepted' | 'rejected' | 'completed';
  price?: number;
}

export interface ServiceReview {
  id: number;
  service_request: number;
  reviewer: number;
  plumber: number;
  reviewer_details: UserDetails;
  plumber_details: UserDetails;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceReview {
  service_request: number;
  rating: number;
  comment: string;
}

export interface PlumberRating {
  average_rating: number;
  total_reviews: number;
}

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
    throw {
      message: errorData.message || errorData.detail || 'حدث خطأ غير متوقع',
      status: response.status,
      errors: errorData
    };
  }
  return response.json();
};

// Services API Class
export class ServicesApiService {
  private baseUrl = API_BASE_URL;

  // -------------------- SERVICE REQUESTS ENDPOINTS --------------------

  /**
   * Create a new service request
   * POST /api/services/create/
   */
  async createServiceRequest(data: CreateServiceRequest): Promise<ServiceRequest> {
    try {
      const response = await fetch(`${this.baseUrl}/services/create/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Failed to create service request:', error);
      throw formatError(error);
    }
  }

  /**
   * Get all service requests for current user
   * GET /api/services/list/
   */
  async getServiceRequests(): Promise<ServiceRequest[]> {
    try {
      const response = await fetch(`${this.baseUrl}/services/list/`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await handleResponse(response);
      return data.results || data;
    } catch (error) {
      console.error('Failed to get service requests:', error);
      throw formatError(error);
    }
  }

  /**
   * Get a specific service request
   * GET /api/services/{id}/
   */
  async getServiceRequest(id: number): Promise<ServiceRequest> {
    try {
      const response = await fetch(`${this.baseUrl}/services/${id}/`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Failed to get service request:', error);
      throw formatError(error);
    }
  }

  /**
   * Update service request status (accept/reject/complete)
   * PATCH /api/services/{id}/update/
   */
  async updateServiceRequest(id: number, data: UpdateServiceRequest): Promise<ServiceRequest> {
    try {
      const response = await fetch(`${this.baseUrl}/services/${id}/update/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Failed to update service request:', error);
      throw formatError(error);
    }
  }

  /**
   * Accept service request with price
   * POST /api/services/{id}/accept/
   */
  async acceptServiceRequest(id: number, price: number): Promise<ServiceRequest> {
    try {
      const response = await fetch(`${this.baseUrl}/services/${id}/accept/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ price }),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Failed to accept service request:', error);
      throw formatError(error);
    }
  }

  /**
   * Reject service request
   * POST /api/services/{id}/reject/
   */
  async rejectServiceRequest(id: number): Promise<ServiceRequest> {
    try {
      const response = await fetch(`${this.baseUrl}/services/${id}/reject/`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Failed to reject service request:', error);
      throw formatError(error);
    }
  }

  /**
   * Complete service request
   * PATCH /api/services/{id}/update/
   */
  async completeServiceRequest(id: number): Promise<ServiceRequest> {
    try {
      const response = await fetch(`${this.baseUrl}/services/${id}/update/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: 'completed' }),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Failed to complete service request:', error);
      throw formatError(error);
    }
  }

  // -------------------- REVIEWS ENDPOINTS --------------------

  /**
   * Create a review for a service
   * POST /api/services/reviews/create/
   */
  async createReview(data: CreateServiceReview): Promise<ServiceReview> {
    try {
      const response = await fetch(`${this.baseUrl}/services/reviews/create/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Failed to create review:', error);
      throw formatError(error);
    }
  }

  /**
   * Get reviews for a plumber
   * GET /api/services/plumber/{id}/reviews/
   */
  async getPlumberReviews(plumberId: number): Promise<ServiceReview[]> {
    try {
      const response = await fetch(`${this.baseUrl}/services/plumber/${plumberId}/reviews/`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await handleResponse(response);
      return data.results || data;
    } catch (error) {
      console.error('Failed to get plumber reviews:', error);
      throw formatError(error);
    }
  }

  /**
   * Get plumber rating summary
   * GET /api/services/plumber/{id}/rating/
   */
  async getPlumberRating(plumberId: number): Promise<PlumberRating> {
    try {
      const response = await fetch(`${this.baseUrl}/services/plumber/${plumberId}/rating/`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Failed to get plumber rating:', error);
      throw formatError(error);
    }
  }

  /**
   * Get all reviews
   * GET /api/reviews/
   */
  async getAllReviews(): Promise<ServiceReview[]> {
    try {
      const response = await fetch(`${this.baseUrl}/reviews/`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await handleResponse(response);
      return data.results || data;
    } catch (error) {
      console.error('Failed to get reviews:', error);
      throw formatError(error);
    }
  }
}

// Export singleton instance
export const servicesApiService = new ServicesApiService();
