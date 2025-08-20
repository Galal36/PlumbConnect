import { realApiService } from "./realApi";
import { createApiError, formatError } from "@/utils";
import type { Report, ApiError } from "@/types";

// Types for creating a report
export interface CreateReportPayload {
  reason: string;
  target_type: "post" | "comment" | "comment_reply";
  target_id: number;
}

// Types for updating a report
export interface UpdateReportPayload {
  reason: string;
}

// Full Report API Service interface
export interface ReportApiService {
  createReport(payload: CreateReportPayload): Promise<Report>;
  getMyReports(): Promise<Report[]>;
  getReportsForPost(postId: number): Promise<Report[]>;
  getReportsForComment(commentId: number): Promise<Report[]>;
  getReportsForReply(replyId: number): Promise<Report[]>;
  getReportById(reportId: number): Promise<Report>;
  updateReport(reportId: number, updates: UpdateReportPayload): Promise<Report>;
  deleteReport(reportId: number): Promise<void>;
}

const reportsApiService: ReportApiService = {
  /**
   * Creates a new report.
   * @param {CreateReportPayload} payload - The report data.
   * @returns {Promise<Report>} The created report.
   */
  createReport: async (payload) => {
    try {
      const response = await realApiService.makeAuthenticatedRequest(
        `/api/reports/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      return (await response.json()) as Report;
    } catch (error) {
      throw createApiError(
        formatError(error),
        (error as ApiError)?.status || 500,
        "CREATE_REPORT_ERROR"
      );
    }
  },

  /**
   * Gets all reports created by the current user.
   * @returns {Promise<Report[]>} A list of the user's reports.
   */
  getMyReports: async () => {
    try {
      const response = await realApiService.makeAuthenticatedRequest(
        `/api/reports/?user=current`,
        { method: "GET" }
      );
      return (await response.json()) as Report[];
    } catch (error) {
      throw createApiError(
        formatError(error),
        (error as ApiError)?.status || 500,
        "FETCH_MY_REPORTS_ERROR"
      );
    }
  },

  /**
   * Gets all reports for a specific post.
   * @param {number} postId - The ID of the post.
   * @returns {Promise<Report[]>} A list of reports for the post.
   */
  getReportsForPost: async (postId) => {
    try {
      const response = await realApiService.makeAuthenticatedRequest(
        `/api/reports/?post=${postId}`,
        { method: "GET" }
      );
      return (await response.json()) as Report[];
    } catch (error) {
      throw createApiError(
        formatError(error),
        (error as ApiError)?.status || 500,
        "FETCH_POST_REPORTS_ERROR"
      );
    }
  },

  /**
   * Gets all reports for a specific comment.
   * @param {number} commentId - The ID of the comment.
   * @returns {Promise<Report[]>} A list of reports for the comment.
   */
  getReportsForComment: async (commentId) => {
    try {
      const response = await realApiService.makeAuthenticatedRequest(
        `/api/reports/?comment=${commentId}`,
        { method: "GET" }
      );
      return (await response.json()) as Report[];
    } catch (error) {
      throw createApiError(
        formatError(error),
        (error as ApiError)?.status || 500,
        "FETCH_COMMENT_REPORTS_ERROR"
      );
    }
  },

  /**
   * Gets all reports for a specific reply.
   * @param {number} replyId - The ID of the reply.
   * @returns {Promise<Report[]>} A list of reports for the reply.
   */
  getReportsForReply: async (replyId) => {
    try {
      const response = await realApiService.makeAuthenticatedRequest(
        `/api/reports/?reply=${replyId}`,
        { method: "GET" }
      );
      return (await response.json()) as Report[];
    } catch (error) {
      throw createApiError(
        formatError(error),
        (error as ApiError)?.status || 500,
        "FETCH_REPLY_REPORTS_ERROR"
      );
    }
  },

  /**
   * Gets a single report by its ID.
   * @param {number} reportId - The ID of the report.
   * @returns {Promise<Report>} The report.
   */
  getReportById: async (reportId) => {
    try {
      const response = await realApiService.makeAuthenticatedRequest(
        `/api/reports/${reportId}/`,
        { method: "GET" }
      );
      return (await response.json()) as Report;
    } catch (error) {
      throw createApiError(
        formatError(error),
        (error as ApiError)?.status || 500,
        "FETCH_REPORT_ERROR"
      );
    }
  },
  
  /**
   * Updates an existing report.
   * @param {number} reportId - The ID of the report.
   * @param {UpdateReportPayload} updates - The data to update.
   * @returns {Promise<Report>} The updated report.
   */
  updateReport: async (reportId, updates) => {
    try {
      const response = await realApiService.makeAuthenticatedRequest(
        `/api/reports/${reportId}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        }
      );
      return (await response.json()) as Report;
    } catch (error) {
      throw createApiError(
        formatError(error),
        (error as ApiError)?.status || 500,
        "UPDATE_REPORT_ERROR"
      );
    }
  },

  /**
   * Deletes a report by its ID.
   * @param {number} reportId - The ID of the report.
   * @returns {Promise<void>} A promise that resolves when the report is deleted.
   */
  deleteReport: async (reportId) => {
    try {
      const response = await realApiService.makeAuthenticatedRequest(
        `/api/reports/${reportId}/`,
        { method: "DELETE" }
      );
      if (!response.ok) {
        throw new Error(`Failed to delete report: ${response.status}`);
      }
    } catch (error) {
      throw createApiError(
        formatError(error),
        (error as ApiError)?.status || 500,
        "DELETE_REPORT_ERROR"
      );
    }
  },
};

export { reportsApiService }; 