// API Service Layer with Mock Data
// Based on Real Backend API Documentation

// Auth Types
export interface AuthTokens {
  refresh: string;
  access: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// Password Reset Types
export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  uidb64: string;
  token: string;
  new_password: string;
}

export interface PasswordResetResponse {
  message: string;
}

// User Types
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  location: Location;
  role: "client" | "plumber" | "admin";
  status: "active" | "inactive";
  image?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  location_id: number;
  role: "client" | "plumber";
  image?: File;
}

// Location Types
export interface Location {
  id: number;
  city: string;
}

// Post Types
export interface Post {
  id: number;
  statement: string;
  image?: string;
  author: User;
  created_at: string;
  updated_at: string;
  comments?: Comment[];
  likes_count?: number;
  is_liked?: boolean;
}

export interface CreatePostRequest {
  statement: string;
  image?: File;
}

// Comment Types
export interface Comment {
  id: number;
  comment: string;
  post: number;
  author: User;
  created_at: string;
  updated_at: string;
  replies?: Reply[];
}

export interface CreateCommentRequest {
  comment: string;
  post: number;
}

// Reply Types
export interface Reply {
  id: number;
  reply: string;
  comment: number;
  author: User;
  created_at: string;
  updated_at: string;
}

export interface CreateReplyRequest {
  reply: string;
  comment: number;
}

// Legacy interfaces for backward compatibility
export interface Experience {
  id: string;
  title: string;
  description: string;
  images: string[];
  date: string;
  userId: string;
  userName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  type: "post" | "comment" | "reply";
  targetId: string;
  targetAuthor: string;
  reason: string;
  details: string;
  reporterId: string;
  status: "pending" | "reviewed" | "resolved";
  createdAt: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  makerId: string;
  makerName: string;
  receiverId: string;
  receiverName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
}

// Mock Data matching real API structure
const mockUsers: User[] = [
  {
    id: 1,
    name: "أحمد الراشد",
    email: "fahad.plumber@example.com",
    phone: "98765432",
    location: { id: 1, city: "Kuwait City" },
    role: "plumber",
    status: "active",
    image: "/placeholder.svg",
  },
  {
    id: 2,
    name: "سارة الكندري",
    email: "client@example.com",
    phone: "98788432",
    location: { id: 2, city: "Hawally" },
    role: "client",
    status: "active",
  },
  {
    id: 3,
    name: "علاء أحمد",
    email: "alaa@gmail.com",
    phone: "1234567890",
    location: { id: 1, city: "Kuwait City" },
    role: "admin",
    status: "active",
  },
];

const mockLocations: Location[] = [
  { id: 1, city: "Kuwait City" },
  { id: 2, city: "Hawally" },
  { id: 3, city: "Farwaniya" },
  { id: 4, city: "Ahmadi" },
  { id: 5, city: "Jahra" },
  { id: 6, city: "Mubarak Al-Kabeer" },
];

const mockPosts: Post[] = [
  {
    id: 1,
    statement:
      "نصائح مهمة لصيانة سخان الماء الكهربائي: 1- افحص العنصر الحر��ري بانتظام 2- تأكد من تنظيف الخزان سنوياً 3- فحص صمام الأمان كل 6 شهور. هذه الخطوات تضمن عمر أطول للسخان وأداء أفضل.",
    image: "/placeholder.svg",
    author: mockUsers[0],
    created_at: "2025-01-20T10:30:00Z",
    updated_at: "2025-01-20T10:30:00Z",
    likes_count: 24,
    is_liked: false,
  },
  {
    id: 2,
    statement:
      "هل يوجد أحد يعرف سباك ممتاز في منطقة السالمية؟ أحتاج إصلاح تسريب في الحمام بشكل عاجل. شكراً مقدماً",
    author: mockUsers[1],
    created_at: "2025-01-20T09:15:00Z",
    updated_at: "2025-01-20T09:15:00Z",
    likes_count: 12,
    is_liked: true,
  },
];

const mockComments: Comment[] = [
  {
    id: 1,
    comment: "نصائح مفيدة جداً! شكراً لك على المعلومات",
    post: 1,
    author: mockUsers[1],
    created_at: "2025-01-20T11:00:00Z",
    updated_at: "2025-01-20T11:00:00Z",
  },
];

const mockReplies: Reply[] = [
  {
    id: 1,
    reply: "العفو، أي وقت! هذه معلومات مه��ة لكل بيت",
    comment: 1,
    author: mockUsers[0],
    created_at: "2025-01-20T11:15:00Z",
    updated_at: "2025-01-20T11:15:00Z",
  },
];

// Legacy mock data for backward compatibility
const mockExperiences: Experience[] = [
  {
    id: "1",
    title: "إصلاح تسريب في الحمام",
    description:
      "إصلاح تسريب مياه في حمام شقة بالسالمية. تم استبدال الأنابيب القديمة وإصلاح التسريب نهائياً.",
    images: ["/placeholder.svg", "/placeholder.svg"],
    date: "2025-01-15",
    userId: "1",
    userName: "أحمد الراشد",
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
  },
];

const mockReviews: Review[] = [
  {
    id: "1",
    rating: 5,
    comment: "عمل ممتاز وسريع. حل مشكلة التسريب في وقت قصير وبأسعار معقولة.",
    makerId: "user1",
    makerName: "سارة الكندري",
    receiverId: "1",
    receiverName: "أحمد الراشد",
    createdAt: "2025-01-16T12:00:00Z",
    updatedAt: "2025-01-16T12:00:00Z",
  },
  {
    id: "2",
    rating: 5,
    comment: "سباك محترف ونظيف في العمل. أنصح به بقوة.",
    makerId: "user2",
    makerName: "محمد العجمي",
    receiverId: "1",
    receiverName: "أحمد الراشد",
    createdAt: "2025-01-12T09:30:00Z",
    updatedAt: "2025-01-12T09:30:00Z",
  },
];

// Simulate API delay
const simulateApiDelay = (ms: number = 800) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// API Service Class
class ApiService {
  private baseUrl = "http://127.0.0.1:8001/api"; // Change this when connecting to real backend
  private token: string | null = null;

  constructor() {
    // Get token from localStorage if available
    this.token = localStorage.getItem("access_token");
  }

  private getHeaders(isFormData: boolean = false): HeadersInit {
    const headers: HeadersInit = {};

    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleError(response: Response): Promise<never> {
    const error: ApiError = {
      message: `API Error: ${response.statusText}`,
      status: response.status,
    };
    throw error;
  }

  // Authentication APIs
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthTokens>> {
    await simulateApiDelay();

    // Mock authentication - in real implementation, remove this mock logic
    const validCredentials = [
      { email: "alaa@gmail.com", password: "admin123", user: mockUsers[2] },
      {
        email: "client@example.com",
        password: "clientpass123",
        user: mockUsers[1],
      },
      {
        email: "fahad.plumber@example.com",
        password: "plumber123",
        user: mockUsers[0],
      },
    ];

    const validUser = validCredentials.find(
      (cred) =>
        cred.email === credentials.email &&
        cred.password === credentials.password,
    );

    if (!validUser) {
      throw { message: "Invalid credentials", status: 401 } as ApiError;
    }

    const tokens = {
      refresh: "mock_refresh_token_" + Date.now(),
      access: "mock_access_token_" + Date.now(),
    };

    // Store tokens and user data
    localStorage.setItem("access_token", tokens.access);
    localStorage.setItem("refresh_token", tokens.refresh);
    localStorage.setItem("user_data", JSON.stringify(validUser.user));
    this.token = tokens.access;

    return {
      data: tokens,
      success: true,
      message: "Login successful",
    };
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<ApiResponse<{ access: string }>> {
    await simulateApiDelay();
    const newAccessToken = "mock_access_token_refreshed_" + Date.now();

    localStorage.setItem("access_token", newAccessToken);
    this.token = newAccessToken;

    return {
      data: { access: newAccessToken },
      success: true,
      message: "Token refreshed successfully",
    };
  }

  async logout(): Promise<void> {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_data");
    this.token = null;
  }

  // Password Reset APIs
  async requestPasswordReset(
    email: string,
  ): Promise<ApiResponse<PasswordResetResponse>> {
    await simulateApiDelay();

    try {
      const response = await fetch(`${this.baseUrl}/password-reset/`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        await this.handleError(response);
      }

      const data = await response.json();
      return {
        data: data,
        success: true,
        message: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني",
      };
    } catch (error) {
      // Mock response for development
      return {
        data: {
          message: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني",
        },
        success: true,
        message: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني",
      };
    }
  }

  async confirmPasswordReset(
    resetData: PasswordResetConfirmRequest,
  ): Promise<ApiResponse<PasswordResetResponse>> {
    await simulateApiDelay();

    try {
      const response = await fetch(`${this.baseUrl}/password-reset/confirm/`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(resetData),
      });

      if (!response.ok) {
        await this.handleError(response);
      }

      const data = await response.json();
      return {
        data: data,
        success: true,
        message: "تم تغيير كلمة المرور بنجاح",
      };
    } catch (error) {
      // Mock response for development - Validate data first
      if (!resetData.uidb64 || !resetData.token || !resetData.new_password) {
        throw { message: "بيانات غير صحيحة", status: 400 } as ApiError;
      }

      if (resetData.new_password.length < 6) {
        throw {
          message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
          status: 400,
        } as ApiError;
      }

      return {
        data: { message: "Password has been reset successfully." },
        success: true,
        message: "تم تغيير كلمة المرور بنجاح",
      };
    }
  }

  // User Management APIs
  async register(userData: RegisterRequest): Promise<ApiResponse<User>> {
    await simulateApiDelay();

    const newUser: User = {
      id: Date.now(),
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      location:
        mockLocations.find((loc) => loc.id === userData.location_id) ||
        mockLocations[0],
      role: userData.role,
      status: "inactive", // Real API starts with inactive until email verification
      image: userData.image ? "/placeholder.svg" : undefined,
    };

    mockUsers.push(newUser);

    return {
      data: newUser,
      success: true,
      message:
        "User registered successfully. Please check your email for activation link.",
    };
  }

  async getUsers(): Promise<ApiResponse<User[]>> {
    await simulateApiDelay();
    return {
      data: [...mockUsers],
      success: true,
      message: "Users retrieved successfully",
    };
  }

  async getUserById(id: number): Promise<ApiResponse<User>> {
    await simulateApiDelay();
    const user = mockUsers.find((u) => u.id === id);
    if (!user) {
      throw { message: "User not found", status: 404 } as ApiError;
    }
    return {
      data: user,
      success: true,
      message: "User retrieved successfully",
    };
  }

  async updateUser(
    id: number,
    updates: Partial<User>,
  ): Promise<ApiResponse<User>> {
    await simulateApiDelay();
    const index = mockUsers.findIndex((u) => u.id === id);
    if (index === -1) {
      throw { message: "User not found", status: 404 } as ApiError;
    }

    mockUsers[index] = { ...mockUsers[index], ...updates };

    return {
      data: mockUsers[index],
      success: true,
      message: "User updated successfully",
    };
  }

  // Location APIs
  async getLocations(): Promise<ApiResponse<Location[]>> {
    await simulateApiDelay();
    return {
      data: [...mockLocations],
      success: true,
      message: "Locations retrieved successfully",
    };
  }

  async createLocation(city: string): Promise<ApiResponse<Location>> {
    await simulateApiDelay();
    const newLocation: Location = {
      id: Math.max(...mockLocations.map((l) => l.id)) + 1,
      city,
    };
    mockLocations.push(newLocation);

    return {
      data: newLocation,
      success: true,
      message: "Location created successfully",
    };
  }

  // Posts APIs
  async getPosts(): Promise<ApiResponse<Post[]>> {
    await simulateApiDelay();
    return {
      data: [...mockPosts],
      success: true,
      message: "Posts retrieved successfully",
    };
  }

  async getPostById(id: number): Promise<ApiResponse<Post>> {
    await simulateApiDelay();
    const post = mockPosts.find((p) => p.id === id);
    if (!post) {
      throw { message: "Post not found", status: 404 } as ApiError;
    }

    // Include comments and replies
    const postComments = mockComments.filter((c) => c.post === id);
    const postWithComments = {
      ...post,
      comments: postComments.map((comment) => ({
        ...comment,
        replies: mockReplies.filter((r) => r.comment === comment.id),
      })),
    };

    return {
      data: postWithComments,
      success: true,
      message: "Post retrieved successfully",
    };
  }

  async createPost(postData: CreatePostRequest): Promise<ApiResponse<Post>> {
    await simulateApiDelay();

    const currentUser = JSON.parse(localStorage.getItem("user_data") || "{}");
    const newPost: Post = {
      id: Math.max(...mockPosts.map((p) => p.id)) + 1,
      statement: postData.statement,
      image: postData.image ? "/placeholder.svg" : undefined,
      author: currentUser,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      likes_count: 0,
      is_liked: false,
    };

    mockPosts.unshift(newPost);

    return {
      data: newPost,
      success: true,
      message: "Post created successfully",
    };
  }

  async updatePost(
    id: number,
    updates: Partial<CreatePostRequest>,
  ): Promise<ApiResponse<Post>> {
    await simulateApiDelay();
    const index = mockPosts.findIndex((p) => p.id === id);
    if (index === -1) {
      throw { message: "Post not found", status: 404 } as ApiError;
    }

    const updatedPost = { ...mockPosts[index] };

    // Handle type conversion for image
    if (updates.statement !== undefined) {
      updatedPost.statement = updates.statement;
    }
    if (updates.image !== undefined) {
      // Convert File to string URL for storage
      updatedPost.image =
        updates.image instanceof File ? "/placeholder.svg" : updates.image;
    }

    updatedPost.updated_at = new Date().toISOString();
    mockPosts[index] = updatedPost;

    return {
      data: mockPosts[index],
      success: true,
      message: "Post updated successfully",
    };
  }

  async deletePost(id: number): Promise<ApiResponse<void>> {
    await simulateApiDelay();
    const index = mockPosts.findIndex((p) => p.id === id);
    if (index === -1) {
      throw { message: "Post not found", status: 404 } as ApiError;
    }

    mockPosts.splice(index, 1);

    return {
      data: undefined,
      success: true,
      message: "Post deleted successfully",
    };
  }

  async likePost(
    id: number,
  ): Promise<ApiResponse<{ likes_count: number; is_liked: boolean }>> {
    await simulateApiDelay();
    const post = mockPosts.find((p) => p.id === id);
    if (!post) {
      throw { message: "Post not found", status: 404 } as ApiError;
    }

    post.is_liked = !post.is_liked;
    post.likes_count = post.is_liked
      ? (post.likes_count || 0) + 1
      : Math.max(0, (post.likes_count || 0) - 1);

    return {
      data: { likes_count: post.likes_count, is_liked: post.is_liked },
      success: true,
      message: post.is_liked ? "Post liked" : "Post unliked",
    };
  }

  // Comments APIs
  async createComment(
    commentData: CreateCommentRequest,
  ): Promise<ApiResponse<Comment>> {
    await simulateApiDelay();

    const currentUser = JSON.parse(localStorage.getItem("user_data") || "{}");
    const newComment: Comment = {
      id: Math.max(...mockComments.map((c) => c.id)) + 1,
      comment: commentData.comment,
      post: commentData.post,
      author: currentUser,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      replies: [],
    };

    mockComments.push(newComment);

    return {
      data: newComment,
      success: true,
      message: "Comment created successfully",
    };
  }

  async updateComment(
    id: number,
    updates: { comment: string },
  ): Promise<ApiResponse<Comment>> {
    await simulateApiDelay();
    const index = mockComments.findIndex((c) => c.id === id);
    if (index === -1) {
      throw { message: "Comment not found", status: 404 } as ApiError;
    }

    mockComments[index] = {
      ...mockComments[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    return {
      data: mockComments[index],
      success: true,
      message: "Comment updated successfully",
    };
  }

  async deleteComment(id: number): Promise<ApiResponse<void>> {
    await simulateApiDelay();
    const index = mockComments.findIndex((c) => c.id === id);
    if (index === -1) {
      throw { message: "Comment not found", status: 404 } as ApiError;
    }

    mockComments.splice(index, 1);

    return {
      data: undefined,
      success: true,
      message: "Comment deleted successfully",
    };
  }

  // Replies APIs
  async getRepliesByComment(commentId: number): Promise<ApiResponse<Reply[]>> {
    await simulateApiDelay();
    const replies = mockReplies.filter((r) => r.comment === commentId);
    return {
      data: replies,
      success: true,
      message: "Replies retrieved successfully",
    };
  }

  async createReply(
    replyData: CreateReplyRequest,
  ): Promise<ApiResponse<Reply>> {
    await simulateApiDelay();

    const currentUser = JSON.parse(localStorage.getItem("user_data") || "{}");
    const newReply: Reply = {
      id: Math.max(...mockReplies.map((r) => r.id)) + 1,
      reply: replyData.reply,
      comment: replyData.comment,
      author: currentUser,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockReplies.push(newReply);

    return {
      data: newReply,
      success: true,
      message: "Reply created successfully",
    };
  }

  async updateReply(
    id: number,
    updates: { reply: string },
  ): Promise<ApiResponse<Reply>> {
    await simulateApiDelay();
    const index = mockReplies.findIndex((r) => r.id === id);
    if (index === -1) {
      throw { message: "Reply not found", status: 404 } as ApiError;
    }

    mockReplies[index] = {
      ...mockReplies[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    return {
      data: mockReplies[index],
      success: true,
      message: "Reply updated successfully",
    };
  }

  async deleteReply(id: number): Promise<ApiResponse<void>> {
    await simulateApiDelay();
    const index = mockReplies.findIndex((r) => r.id === id);
    if (index === -1) {
      throw { message: "Reply not found", status: 404 } as ApiError;
    }

    mockReplies.splice(index, 1);

    return {
      data: undefined,
      success: true,
      message: "Reply deleted successfully",
    };
  }

  // Experience APIs
  async getExperiences(): Promise<ApiResponse<Experience[]>> {
    await simulateApiDelay();
    return {
      data: [...mockExperiences],
      success: true,
      message: "Experiences retrieved successfully",
    };
  }

  async getExperienceById(id: string): Promise<ApiResponse<Experience>> {
    await simulateApiDelay();
    const experience = mockExperiences.find((exp) => exp.id === id);
    if (!experience) {
      throw { message: "Experience not found", status: 404 } as ApiError;
    }
    return {
      data: experience,
      success: true,
      message: "Experience retrieved successfully",
    };
  }

  async getUserExperiences(userId: string): Promise<ApiResponse<Experience[]>> {
    await simulateApiDelay();
    const userExperiences = mockExperiences.filter(
      (exp) => exp.userId === userId,
    );
    return {
      data: userExperiences,
      success: true,
      message: "User experiences retrieved successfully",
    };
  }

  async createExperience(
    experience: Omit<Experience, "id" | "createdAt" | "updatedAt">,
  ): Promise<ApiResponse<Experience>> {
    await simulateApiDelay();
    const newExperience: Experience = {
      ...experience,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockExperiences.unshift(newExperience);
    return {
      data: newExperience,
      success: true,
      message: "Experience created successfully",
    };
  }

  async updateExperience(
    id: string,
    updates: Partial<Experience>,
  ): Promise<ApiResponse<Experience>> {
    await simulateApiDelay();
    const index = mockExperiences.findIndex((exp) => exp.id === id);
    if (index === -1) {
      throw { message: "Experience not found", status: 404 } as ApiError;
    }

    mockExperiences[index] = {
      ...mockExperiences[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return {
      data: mockExperiences[index],
      success: true,
      message: "Experience updated successfully",
    };
  }

  async deleteExperience(id: string): Promise<ApiResponse<void>> {
    await simulateApiDelay();
    const index = mockExperiences.findIndex((exp) => exp.id === id);
    if (index === -1) {
      throw { message: "Experience not found", status: 404 } as ApiError;
    }

    mockExperiences.splice(index, 1);
    return {
      data: undefined,
      success: true,
      message: "Experience deleted successfully",
    };
  }

  // Report APIs
  async createReport(
    report: Omit<Report, "id" | "createdAt">,
  ): Promise<ApiResponse<Report>> {
    await simulateApiDelay();
    const newReport: Report = {
      ...report,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    return {
      data: newReport,
      success: true,
      message: "Report submitted successfully",
    };
  }

  // Review APIs
  async getReviews(): Promise<ApiResponse<Review[]>> {
    await simulateApiDelay();
    return {
      data: [...mockReviews],
      success: true,
      message: "Reviews retrieved successfully",
    };
  }

  async getUserReviews(userId: string): Promise<ApiResponse<Review[]>> {
    await simulateApiDelay();
    const userReviews = mockReviews.filter(
      (review) => review.receiverId === userId,
    );
    return {
      data: userReviews,
      success: true,
      message: "User reviews retrieved successfully",
    };
  }

  async createReview(
    review: Omit<Review, "id" | "createdAt" | "updatedAt">,
  ): Promise<ApiResponse<Review>> {
    await simulateApiDelay();
    const newReview: Review = {
      ...review,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockReviews.unshift(newReview);
    return {
      data: newReview,
      success: true,
      message: "Review created successfully",
    };
  }

  // Service APIs
  async createService(
    service: Omit<Service, "id" | "createdAt" | "updatedAt">,
  ): Promise<ApiResponse<Service>> {
    await simulateApiDelay();
    const newService: Service = {
      ...service,
      id: Date.now().toString(),
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return {
      data: newService,
      success: true,
      message: "Service request created successfully",
    };
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
