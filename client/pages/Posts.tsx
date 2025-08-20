import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PostCard } from "@/components/PostCard";
import { CreatePostDialog } from "@/components/CreatePostDialog";
import MainLayout from "@/layouts/MainLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { postsApiService } from "@/services/postsApi";
import { formatError } from "@/utils";
import type { Post, LoadingState } from "@/types";
import SEOHead from "@/components/SEOHead";
import { generateSEOConfig } from "@/hooks/useSEO";
import { useMyReports } from "@/hooks/useApi";

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>("loading");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [error, setError] = useState<string | null>(null);

  const { data: myReports, refetch: refetchMyReports } = useMyReports();

  const seoConfig = generateSEOConfig({
    title: "المنشورات والتجارب - مجتمع فني صحي الكويت",
    description:
      "شارك تجاربك واطرح أسئلتك مع مجتمع السباكة في الكويت. اقرأ تجارب آخرين مع الفنيين الصحيين واحصل على نصائح عملية.",
    keywords:
      "تجارب فني صحي، منشورات سباكة، مجتمع سباكين، نصائح سباكة، فني صحي الكويت",
    url: "/posts",
    type: "website",
  });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoadingState("loading");
      setError(null);
      const fetchedPosts = await postsApiService.getAllPosts();
      setPosts(fetchedPosts);
      setLoadingState("success");
    } catch (error) {
      console.error("Error loading posts:", error);
      setError(formatError(error));
      setLoadingState("error");
    }
  };

  const handlePostCreated = useCallback((newPost: Post) => {
    setPosts((prev) => {
      const existingPost = prev.find((p) => p.id === newPost.id);
      if (existingPost) {
        return prev;
      }
      return [newPost, ...prev];
    });
    refetchMyReports();
  }, [refetchMyReports]);

  const handlePostUpdate = useCallback((updatedPost: Post) => {
    setPosts((prev) => {
      const postExists = prev.some((p) => p.id === updatedPost.id);
      if (!postExists) {
        return prev;
      }
      return prev.map((post) =>
        post.id === updatedPost.id ? updatedPost : post,
      );
    });
    refetchMyReports();
  }, [refetchMyReports]);

  const filteredPosts = useMemo(() => {
    return posts
      .filter(
        (post) =>
          searchQuery === "" ||
          post.statement.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.user.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .sort((a, b) => {
        switch (sortBy) {
          case "newest":
            return (
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
            );
          case "oldest":
            return (
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
            );
          case "most_liked":
            return b.likes_count - a.likes_count;
          case "most_commented":
            return b.comments_count - a.comments_count;
          default:
            return 0;
        }
      });
  }, [posts, searchQuery, sortBy]);

  const getReportForPost = useCallback((postId: number) => {
    return myReports?.find(report => report.target_id === postId && report.target_type === 'post');
  }, [myReports]);

  return (
    <>
      <SEOHead config={seoConfig} />
      <MainLayout>
        {/* Header */}
        <div className="border-b bg-card/50 sticky top-0 z-10 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-1">المنشورات والتجارب</h1>
                <p className="text-muted-foreground text-sm">
                  شارك تجاربك واطرح أسئلتك مع مجتمع السباكة
                </p>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1 md:w-80">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="ابحث في المنشورات..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pe-10"
                    aria-label="ابحث في المنشورات"
                    type="search"
                  />
                </div>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40" aria-label="ترتيب المنشورات">
                    <Filter className="h-4 w-4 ms-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">الأحدث</SelectItem>
                    <SelectItem value="oldest">الأقدم</SelectItem>
                    <SelectItem value="most_liked">الأكثر إعجاباً</SelectItem>
                    <SelectItem value="most_commented">
                      الأكثر تعليقاً
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            {/* Create Post */}
            <CreatePostDialog onPostCreated={handlePostCreated} />

            {/* Loading State */}
            {loadingState === "loading" && (
              <LoadingSpinner text="جاري تحميل المنشورات..." />
            )}

            {/* Error State */}
            {loadingState === "error" && error && (
              <div className="text-center py-12">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={loadPosts} variant="outline">
                  إعادة المحاولة
                </Button>
              </div>
            )}

            {/* Posts List */}
            {loadingState === "success" && (
              <>
                <h2 className="text-2xl font-bold mb-6">قائمة المنشورات</h2>
                {filteredPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium mb-2">
                      لا توجد منشورات
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery
                        ? "لم يتم العثور على منشورات تطابق بحثك"
                        : "كن أول من ينشر في هذا المجتمع"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onPostUpdate={handlePostUpdate}
                        myReport={getReportForPost(post.id) || undefined}
                      />
                    ))}
                  </div>
                )}

                {/* Load More */}
                {filteredPosts.length > 0 && (
                  <div className="text-center mt-8">
                    <Button
                      variant="outline"
                      size="lg"
                      aria-label="تحميل المزيد من المنشورات"
                    >
                      تحميل المزيد
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </MainLayout>
    </>
  );
}