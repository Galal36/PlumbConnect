import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, MapPin, Search, Wrench, Loader2, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import SEOHead from "@/components/SEOHead";
import StarRating from "@/components/StarRating";
import { generateSEOConfig } from "@/hooks/useSEO";
import LazyImage from "@/components/LazyImage";
import { realApiService } from "@/services/realApi";
import { chatApiService } from "@/services/chatApi";
import { servicesApiService, PlumberRating } from "@/services/servicesApi";
import { User } from "@/types";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Location {
  id: number;
  city: string;
}

export default function PlumbersList() {
  const [searchCity, setSearchCity] = useState("");
  const [searchName, setSearchName] = useState("");
  const [plumbers, setPlumbers] = useState<User[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState<number | null>(null);
  const [plumberRatings, setPlumberRatings] = useState<Record<number, PlumberRating>>({});

  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthContext();

  const seoConfig = generateSEOConfig({
    title: "قائمة الفنيين الصحيين في الكويت",
    description:
      "اختر أفضل الفنيين الصحيين المرخصين في الكويت. فنيين موثوقين بتقييمات عالية في جميع مناطق الكويت. ابحث بالمنطقة واختر الفني المناسب.",
    keywords:
      "فنيين صحيين الكويت، سباكين مرخصين، فني صحي موثوق، فني سباكة محترف، خدمات سباكة الكويت",
    url: "/plumbers",
    type: "website",
  });

  // Load plumber ratings
  const loadPlumberRatings = async (plumberIds: number[]) => {
    const ratings: Record<number, PlumberRating> = {};

    // Fetch ratings for each plumber
    await Promise.all(
      plumberIds.map(async (plumberId) => {
        try {
          const rating = await servicesApiService.getPlumberRating(plumberId);
          ratings[plumberId] = rating;
        } catch (error) {
          console.error(`Failed to load rating for plumber ${plumberId}:`, error);
          // Set default rating if API fails
          ratings[plumberId] = { average_rating: 0, total_reviews: 0 };
        }
      })
    );

    setPlumberRatings(ratings);
  };

  // Load plumbers from API
  useEffect(() => {
    const loadPlumbers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const plumbersData = await realApiService.getPlumbers();
        console.log('Plumbers data received:', plumbersData);
        setPlumbers(plumbersData);

        // Load ratings for all plumbers
        const plumberIds = plumbersData.map((plumber: any) => plumber.id);
        await loadPlumberRatings(plumberIds);
      } catch (err) {
        console.error('Failed to load plumbers:', err);
        setError('فشل في تحميل قائمة الفنيين الصحيين');
      } finally {
        setIsLoading(false);
      }
    };

    loadPlumbers();
  }, []);

  // Load locations from API
  useEffect(() => {
    const loadLocations = async () => {
      try {
        setIsLoadingLocations(true);
        const locationsData = await realApiService.getLocations();
        console.log('Locations data received:', locationsData);
        setLocations(locationsData);
      } catch (err) {
        console.error('Failed to load locations:', err);
        // Fall back to hardcoded cities if API fails
        setLocations([
          { id: 0, city: "الكل" },
          { id: 1, city: "مدينة الكويت" },
          { id: 5, city: "حولي" },
          { id: 11, city: "السالمية" },
          { id: 8, city: "الجهراء" },
          { id: 7, city: "الأحمدي" },
          { id: 6, city: "الفروانية" },
          { id: 9, city: "مبارك الكبير" },
        ]);
      } finally {
        setIsLoadingLocations(false);
      }
    };

    loadLocations();
  }, []);

  // Create a list of cities with "All" option at the top
  const allCities = [{ id: 0, city: "الكل" }, ...locations.filter(loc => loc.city !== "الكل")];

  const filteredPlumbers = plumbers.filter((plumber) => {
    const cityMatch =
      !searchCity || searchCity === "الكل" || (plumber.location && plumber.location.city === searchCity);
    const nameMatch = !searchName || plumber.name.includes(searchName);
    return cityMatch && nameMatch;
  });



  const handleStartChat = async (plumberId: number) => {
    if (!isAuthenticated) {
      toast.error("يجب تسجيل الدخول أولاً للمحادثة");
      navigate("/login");
      return;
    }

    if (user?.role !== "client") {
      toast.error("المحادثة متاحة للعملاء فقط");
      return;
    }

    try {
      setChatLoading(plumberId);
      const chat = await chatApiService.getOrCreateChat(plumberId);
      navigate(`/chat/${chat.id}`);
      toast.success("تم فتح المحادثة بنجاح");
    } catch (error) {
      console.error("Failed to start chat:", error);
      toast.error("فشل في بدء المحادثة. يرجى المحاولة مرة أخرى");
    } finally {
      setChatLoading(null);
    }
  };

  return (
    <>
      <SEOHead config={seoConfig} />
      <div className="min-h-screen bg-gray-900" dir="rtl">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              الفنيين الصحيين
            </h1>
            <p className="text-gray-300">
              اختر أفضل الفنيين الصحيين المرخصين في الكويت
            </p>
          </div>

          {/* Search and Filter */}
          <h2 className="text-2xl font-bold text-white mb-6">بحث وفلترة</h2>
          <div className="bg-white rounded-lg p-6 shadow-sm border mb-8">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  البحث بالاسم
                </label>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="ابحث عن فني صحي..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="text-end pe-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  المدينة
                </label>
                <Select value={searchCity} onValueChange={setSearchCity}>
                  <SelectTrigger className="text-end">
                    <SelectValue placeholder="اختر المدينة" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingLocations ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>جاري التحميل...</span>
                      </div>
                    ) : (
                      allCities.map((location) => (
                        <SelectItem key={location.id} value={location.city}>
                          {location.city}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button className="w-full">
                  <Search className="h-4 w-4 ms-2" />
                  بحث
                </Button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">نتائج البحث</h2>
            <p className="text-gray-300">
              {isLoading ? "جاري التحميل..." : `تم العثور على ${filteredPlumbers.length} فني صحي`}
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 mb-6">
              <p className="text-red-300 text-center">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-white ms-2">جاري تحميل الفنيين الصحيين...</span>
            </div>
          )}

          {/* Plumbers Grid */}
          {!isLoading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlumbers.map((plumber) => (
                <Card
                  key={plumber.id}
                  className="premium-card-gradient hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <Link
                        to={`/plumber/${plumber.id}`}
                        className="hover:opacity-80 transition-opacity"
                      >
                        <LazyImage
                          src={plumber.image || "/placeholder.svg"}
                          alt={`صورة الفني الصحي ${plumber.name} في ${plumber.location?.city || 'الكويت'} - فني موثوق`}
                          className="w-16 h-16 rounded-full object-cover border-2 border-primary/20 cursor-pointer hover:border-primary/40 transition-all"
                          loading="lazy"
                          onError={() => {
                            console.log('Image failed to load:', plumber.image);
                            console.log('Plumber data:', plumber);
                          }}
                        />
                      </Link>
                      <div className="flex-1">
                        <Link
                          to={`/plumber/${plumber.id}`}
                          className="text-lg font-semibold text-white mb-1 hover:text-primary transition-colors cursor-pointer inline-block"
                        >
                          {plumber.name}
                        </Link>
                        <div className="flex items-center gap-1 text-gray-300 mb-2">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{plumber.location?.city || 'الكويت'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <StarRating
                            rating={plumberRatings[plumber.id]?.average_rating || 0}
                            totalReviews={plumberRatings[plumber.id]?.total_reviews || 0}
                            size="sm"
                            showText={true}
                            className="text-gray-300"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1" asChild>
                        <Link to={`/plumber/${plumber.id}`}>عرض الملف الشخصي</Link>
                      </Button>
                      {isAuthenticated && user?.role === "client" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartChat(plumber.id)}
                          disabled={chatLoading === plumber.id}
                          className="px-3 hover:bg-primary hover:text-white transition-colors"
                        >
                          {chatLoading === plumber.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MessageCircle className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && filteredPlumbers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                لم يتم العثور على نتائج
              </h3>
              <p className="text-gray-300">جرب تغيير معايير البحث</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
