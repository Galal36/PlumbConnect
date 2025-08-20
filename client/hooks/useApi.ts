import { useState, useEffect, useCallback } from "react";
import apiService, {
  ApiError,
  ApiResponse,
  Experience,
  Review,
  Service,
} from "@/services/api";
import { reportsApiService, CreateReportPayload, UpdateReportPayload } from "@/services/reportsApi";
import { postsApiService } from "@/services/postsApi"; // استيراد خدمة المنشورات
import type { Post, Comment, Reply, Report } from "@/types"; // استيراد الأنواع المطلوبة

// Generic hook for API calls
export function useApiCall<T>(
  apiCall: () => Promise<T>, // تم تعديل نوع apiCall
  dependencies: any[] = [],
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCall();
      setData(response);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Specific hooks for different entities
export function useExperiences() {
  return useApiCall(() => apiService.getExperiences());
}

export function useUserExperiences(userId: string) {
  return useApiCall(() => apiService.getUserExperiences(userId), [userId]);
}

export function useExperience(id: string) {
  return useApiCall(() => apiService.getExperienceById(id), [id]);
}

export function useReviews() {
  return useApiCall(() => apiService.getReviews());
}

export function useUserReviews(userId: string) {
  return useApiCall(() => apiService.getUserReviews(userId), [userId]);
}

// --- Hooks الجديدة للمنشورات والتعليقات والردود ---

export function usePost(id: number) {
  return useApiCall<Post>(() => postsApiService.getPost(id), [id]);
}

export function useCreateComment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const createComment = useCallback(
    async (payload: { comment: string; post: number }) => {
      setLoading(true);
      setError(null);
      try {
        const newComment = await postsApiService.createComment(payload);
        return newComment;
      } catch (err) {
        setError(err as ApiError);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { createComment, loading, error };
}

export function useCreateReply() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const createReply = useCallback(
    async (payload: { reply: string; comment: number }) => {
      setLoading(true);
      setError(null);
      try {
        const newReply = await postsApiService.createReply(payload);
        return newReply;
      } catch (err) {
        setError(err as ApiError);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { createReply, loading, error };
}

// Mutation hooks for creating/updating data
export function useCreateExperience() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const createExperience = useCallback(
    async (experience: Omit<Experience, "id" | "createdAt" | "updatedAt">) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.createExperience(experience);
        return response.data;
      } catch (err) {
        setError(err as ApiError);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { createExperience, loading, error };
}

export function useUpdateExperience() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const updateExperience = useCallback(
    async (id: string, updates: Partial<Experience>) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.updateExperience(id, updates);
        return response.data;
      } catch (err) {
        setError(err as ApiError);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { updateExperience, loading, error };
}

export function useDeleteExperience() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const deleteExperience = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.deleteExperience(id);
    } catch (err) {
      setError(err as ApiError);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteExperience, loading, error };
}

export function useCreateReport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const createReport = useCallback(
    async (reportPayload: CreateReportPayload) => {
      setLoading(true);
      setError(null);
      try {
        const createdReport = await reportsApiService.createReport(reportPayload);
        return createdReport;
      } catch (err) {
        setError(err as ApiError);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { createReport, loading, error };
}

export function useMyReports() {
  return useApiCall<Report[]>(() => reportsApiService.getMyReports());
}

export function usePostReports(postId: number) {
  return useApiCall<Report[]>(() => reportsApiService.getReportsForPost(postId), [postId]);
}

export function useCommentReports(commentId: number) {
  return useApiCall<Report[]>(() => reportsApiService.getReportsForComment(commentId), [commentId]);
}

export function useReplyReports(replyId: number) {
  return useApiCall<Report[]>(() => reportsApiService.getReportsForReply(replyId), [replyId]);
}

export function useUpdateReport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const updateReport = useCallback(async (reportId: number, updates: UpdateReportPayload) => {
    setLoading(true);
    setError(null);
    try {
      const updatedReport = await reportsApiService.updateReport(reportId, updates);
      return updatedReport;
    } catch (err) {
      setError(err as ApiError);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateReport, loading, error };
}

export function useDeleteReport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const deleteReport = useCallback(async (reportId: number) => {
    setLoading(true);
    setError(null);
    try {
      await reportsApiService.deleteReport(reportId);
    } catch (err) {
      setError(err as ApiError);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteReport, loading, error };
}

export function useCreateReview() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const createReview = useCallback(
    async (review: Omit<Review, "id" | "createdAt" | "updatedAt">) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.createReview(review);
        return response.data;
      } catch (err) {
        setError(err as ApiError);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { createReview, loading, error };
}

export function useCreateService() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const createService = useCallback(
    async (service: Omit<Service, "id" | "createdAt" | "updatedAt">) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.createService(service);
        return response.data;
      } catch (err) {
        setError(err as ApiError);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { createService, loading, error };
} 