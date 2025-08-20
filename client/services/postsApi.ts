import { realApiService } from "./realApi";
import { createApiError, formatError } from "@/utils";
import { VALIDATION_RULES } from "@/constants";
import type { Post, Comment, Reply, ApiError } from "@/types";

export class PostsApiService {
  // Use absolute backend URL so Vite dev server doesn't intercept /api and return HTML
  private baseUrl = "http://localhost:8001/api";

  // -------------------- POSTS ENDPOINTS --------------------

  /**
   * Get all posts
   * GET /api/posts/
   */
  async getAllPosts(): Promise<Post[]> {
    try {
      // Try to make authenticated request first, fall back to public if not authenticated
      let response: Response;
      const token = localStorage.getItem('access_token');

      if (token) {
        // Make authenticated request to get user-specific data (like is_liked)
        try {
          response = await realApiService.makeAuthenticatedRequest(
            `${this.baseUrl}/posts/`,
            { method: "GET" }
          );
        } catch (authError) {
          // If auth fails, fall back to public request
          console.warn('Authenticated request failed, falling back to public:', authError);
          response = await fetch(`${this.baseUrl}/posts/`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
        }
      } else {
        // No token, make public request
        response = await fetch(`${this.baseUrl}/posts/`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
      }

      if (!response.ok) {
        throw createApiError(
          `HTTP error! status: ${response.status}`,
          response.status,
          "FETCH_POSTS_ERROR"
        );
      }
      const data = await response.json();
      // DRF returns paginated payload { count, next, previous, results }
      return Array.isArray(data) ? data : (data?.results ?? []);
    } catch (error) {
      throw createApiError(
        formatError(error),
        (error as ApiError)?.status || 500,
        "FETCH_POSTS_ERROR"
      );
    }
  }

  /**
   * Create new post
   * POST /api/posts/
   * ✅ تم تعديل نوع المدخل ليكون FormData
   */
  async createPost(data: FormData): Promise<Post> {
    try {
      const response = await realApiService.makeAuthenticatedRequest(
        `${this.baseUrl}/posts/`,
        {
          method: "POST",
          body: data,
        }
      );
      return await response.json();
    } catch (error) {
      throw createApiError(
        formatError(error),
        (error as ApiError)?.status || 500,
        "CREATE_POST_ERROR"
      );
    }
  }

  /**
   * Get single post
   * GET /api/posts/{id}/
   */
  async getPost(id: number): Promise<Post> {
    try {
      const response = await realApiService.makeAuthenticatedRequest(
        `${this.baseUrl}/posts/${id}/`,
        { method: "GET" }
      );
      return await response.json();
    } catch (error) {
      throw createApiError(
        formatError(error),
        (error as ApiError)?.status || 500,
        "FETCH_POST_ERROR"
      );
    }
  }

  /**
   * Update post
   * PATCH /api/posts/{id}/
   */
  async updatePost(
    id: number,
    data: {
      statement?: string;
      image?: File | null;
    }
  ): Promise<Post> {
    try {
      const formData = new FormData();
      if (data.statement) formData.append("statement", data.statement);
      if (data.image) formData.append("image", data.image);
      else if (data.image === null) formData.append("image", "");

      const response = await realApiService.makeAuthenticatedRequest(
        `${this.baseUrl}/posts/${id}/`,
        {
          method: "PATCH",
          body: formData,
        }
      );
      return await response.json();
    } catch (error) {
      throw createApiError(
        formatError(error),
        (error as ApiError)?.status || 500,
        "UPDATE_POST_ERROR"
      );
    }
  }

  /**
   * Delete post
   * DELETE /api/posts/{id}/
   */
  async deletePost(id: number): Promise<{ message: string }> {
    try {
      await realApiService.makeAuthenticatedRequest(
        `${this.baseUrl}/posts/${id}/`,
        { method: "DELETE" }
      );
      return { message: "تم حذف المنشور بنجاح" };
    } catch (error) {
      throw createApiError(
        formatError(error),
        (error as ApiError)?.status || 500,
        "DELETE_POST_ERROR"
      );
    }
  }

  /**
   * Like/Unlike post
   * POST /api/posts/{id}/like/
   * Backend returns 201 (liked) or 204 (unliked) with NO JSON body.
   * We return the status code and let the caller adjust local UI state.
   */
  async toggleLike(id: number): Promise<number> {
    try {
      const response = await realApiService.makeAuthenticatedRequest(
        `${this.baseUrl}/posts/${id}/like/`,
        { method: "POST" }
      );
      return response.status; // 201 or 204
    } catch (error) {
      throw createApiError(
        formatError(error),
        (error as ApiError)?.status || 500,
        "TOGGLE_LIKE_ERROR"
      );
    }
  }

  // -------------------- COMMENTS ENDPOINTS --------------------

  /**
   * Get comments for a post
   * GET /api/comments/?post={postId}
   */
  async getComments(postId: number): Promise<Comment[]> {
    try {
      const response = await realApiService.makeAuthenticatedRequest(
        `${this.baseUrl}/comments/?post=${postId}`,
        { method: "GET" }
      );
      return await response.json();
    } catch (error) {
      throw createApiError(
        formatError(error),
        (error as ApiError)?.status || 500,
        "FETCH_COMMENTS_ERROR"
      );
    }
  }

  /**
   * Create comment
   * POST /api/comments/
   */
  async createComment(data: {
    comment: string;
    post: number;
  }): Promise<Comment> {
    try {
      const response = await realApiService.makeAuthenticatedRequest(
        `${this.baseUrl}/comments/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      return await response.json();
    } catch (error) {
      throw createApiError(
        formatError(error),
        (error as ApiError)?.status || 500,
        "CREATE_COMMENT_ERROR"
      );
    }
  }

  /**
   * Update comment
   * PATCH /api/comments/{id}/
   */
  async updateComment(id: number, data: { comment: string }): Promise<Comment> {
    try {
      const response = await realApiService.makeAuthenticatedRequest(
        `${this.baseUrl}/comments/${id}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      return await response.json();
    } catch (error) {
      throw createApiError(
        formatError(error),
        (error as ApiError)?.status || 500,
        "UPDATE_COMMENT_ERROR"
      );
    }
  }

  /**
   * Delete comment
   * DELETE /api/comments/{id}/
   */
  async deleteComment(id: number): Promise<{ message: string }> {
    try {
      await realApiService.makeAuthenticatedRequest(
        `${this.baseUrl}/comments/${id}/`,
        { method: "DELETE" }
      );
      return { message: "تم حذف التعليق بنجاح" };
    } catch (error) {
      throw createApiError(
        formatError(error),
        (error as ApiError)?.status || 500,
        "DELETE_COMMENT_ERROR"
      );
    }
  }

  // -------------------- REPLIES ENDPOINTS --------------------

  /**
   * Get replies for a comment
   * GET /api/replies/?comment={commentId}
   */
  async getReplies(commentId: number): Promise<Reply[]> {
    try {
      const response = await realApiService.makeAuthenticatedRequest(
        `${this.baseUrl}/replies/?comment=${commentId}`,
        { method: "GET" }
      );
      return await response.json();
    } catch (error) {
      throw createApiError(
        formatError(error),
        (error as ApiError)?.status || 500,
        "FETCH_REPLIES_ERROR"
      );
    }
  }

  /**
   * Create reply
   * POST /api/replies/
   */
  async createReply(data: {
    reply: string;
    comment: number;
  }): Promise<Reply> {
    try {
      const response = await realApiService.makeAuthenticatedRequest(
        `${this.baseUrl}/replies/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      return await response.json();
    } catch (error) {
      throw createApiError(
        formatError(error),
        (error as ApiError)?.status || 500,
        "CREATE_REPLY_ERROR"
      );
    }
  }

  /**
   * Update reply
   * PATCH /api/replies/{id}/
   */
  async updateReply(id: number, data: { reply: string }): Promise<Reply> {
    try {
      const response = await realApiService.makeAuthenticatedRequest(
        `${this.baseUrl}/replies/${id}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      return await response.json();
    } catch (error) {
      throw createApiError(
        formatError(error),
        (error as ApiError)?.status || 500,
        "UPDATE_REPLY_ERROR"
      );
    }
  }

  /**
   * Delete reply
   * DELETE /api/replies/{id}/
   */
  async deleteReply(id: number): Promise<{ message: string }> {
    try {
      await realApiService.makeAuthenticatedRequest(
        `${this.baseUrl}/replies/${id}/`,
        { method: "DELETE" }
      );
      return { message: "تم حذف الرد بنجاح" };
    } catch (error) {
      throw createApiError(
        formatError(error),
        (error as ApiError)?.status || 500,
        "DELETE_REPLY_ERROR"
      );
    }
  }
}

// Export singleton instance
export const postsApiService = new PostsApiService(); 