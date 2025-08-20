// Central type definitions for the application

export type UserRole = "user" | "plumber" | "admin";

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: {
    id: number;
    city: string;
  };
  avatar?: string;
  image?: string;
  role: "client" | "plumber" | "admin";
  status?: string;
  joinDate?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Posts API Types
export interface PostUser {
  id: number;
  name: string;
  email: string;
  role: "client" | "plumber" | "admin";
  image?: string;
  is_verified: boolean;
}

export interface Reply {
  id: number;
  reply: string;
  comment: number;
  user: PostUser;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  comment: string;
  post: number;
  user: PostUser;
  created_at: string;
  updated_at: string;
  replies: Reply[];
}

export interface Post {
  id: number;
  statement: string;
  image?: string;
  user: PostUser;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  comments: Comment[];
}

// Reports API Types
export interface Report {
  id: number;
  reason: string;
  user: PostUser;
  target_type: "post" | "comment" | "comment_reply";
  target_id: number;
  created_at: string;
  updated_at?: string;
}

// Component Props Types
export interface BaseProps {
  className?: string;
  children?: React.ReactNode;
}

export interface PostCardProps {
  post: Post;
  onPostUpdate?: (updatedPost: Post | null) => void;
  myReport?: Report;
}

export interface CreatePostDialogProps {
  onPostCreated?: (post: Post) => void;
}

// Error Types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Utility Types
export type LoadingState = "idle" | "loading" | "success" | "error";

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface SearchParams {
  query?: string;
  sortBy?: "newest" | "oldest" | "most_liked" | "most_commented";
  filterBy?: UserRole;
}