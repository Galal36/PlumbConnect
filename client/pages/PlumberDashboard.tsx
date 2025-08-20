import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Star,
  MapPin,
  Edit,
  Wrench,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  Settings,
  Plus,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

interface Work {
  id: string;
  title: string;
  description: string;
  images: string[];
  date: string;
  clientName: string;
  status: "completed" | "in_progress" | "pending";
}

interface Experience {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
}

interface Service {
  id: string;
  clientName: string;
  service: string;
  amount: number;
  status: "pending" | "accepted" | "in_progress" | "completed" | "cancelled";
  requestDate: string;
}

export default function PlumberDashboard() {
  // Mock plumber data - this would come from auth context/API
  const currentPlumber = {
    id: "plumber1",
    name: "أحمد الراشد",
    email: "ahmed@example.com",
    phone: "+965 9876 5432",
    city: "السالمية",
    avatar: "/placeholder.svg",
    joinDate: "2020-03-15",
    role: "plumber" as const,
    rating: 4.8,
    reviewCount: 42,
    completedJobs: 156,
    bio: "فني صحي محترف مع خبرة أكثر من 10 سنوات في جميع أعمال الفني صحية",
  };

  // Mock plumber activity data
  const plumberActivity = {
    completedJobs: 156,
    activeServices: 8,
    totalEarnings: 4250,
    monthlyJobs: 23,
  };

  // Mock experiences based on ERD
  const experiences: Experience[] = [
    {
      id: "1",
      title: "فني صحي أول - شركة المياه الكويتية",
      description:
        "العمل في مشاريع البنية التحتية للمياه والصرف الصحي في المباني الحكومية والسكنية",
      startDate: "2020-01-01",
      endDate: null,
      isCurrent: true,
    },
    {
      id: "2",
      title: "فني صحي - شركة البناء المتقدم",
      description:
        "تنفيذ أعمال الفني الصحي في المجمعات السكنية والفللا الحديثة مع التركيز على الأنظمة الذكية",
      startDate: "2018-03-01",
      endDate: "2019-12-31",
      isCurrent: false,
    },
  ];

  // Mock recent works
  const recentWorks: Work[] = [
    {
      id: "1",
      title: "إصلاح تسريب في الحمام",
      description: "إصلاح تسريب مياه في حمام شقة بالسالمية",
      images: ["/placeholder.svg"],
      date: "2025-01-18",
      clientName: "سارة الكندري",
      status: "completed",
    },
    {
      id: "2",
      title: "تركيب سخان مياه جديد",
      description: "تركيب سخان مياه كهربائي 50 لتر",
      images: ["/placeholder.svg"],
      date: "2025-01-17",
      clientName: "محمد العجمي",
      status: "in_progress",
    },
  ];

  // Mock active services
  const activeServices: Service[] = [
    {
      id: "1",
      clientName: "فاطمة الكندري",
      service: "إصلاح حنفية المطبخ",
      amount: 45,
      status: "pending",
      requestDate: "2025-01-18T10:30:00",
    },
    {
      id: "2",
      clientName: "خالد الصباح",
      service: "تنظيف مجاري الحمام",
      amount: 80,
      status: "accepted",
      requestDate: "2025-01-18T08:15:00",
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-KW");
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "منذ قليل";
    if (diffInHours < 24) return `منذ ${diffInHours} ساعة`;
    return `منذ ${Math.floor(diffInHours / 24)} يوم`;
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-700",
      accepted: "bg-blue-100 text-blue-700",
      in_progress: "bg-orange-100 text-orange-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };

    const statusText = {
      pending: "في الانتظار",
      accepted: "مقبول",
      in_progress: "قيد التنفيذ",
      completed: "مكتمل",
      cancelled: "ملغي",
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors]}>
        {statusText[status as keyof typeof statusText]}
      </Badge>
    );
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-900" dir="rtl">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="premium-card-gradient mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-6 md:space-x-reverse">
              <Avatar className="w-24 h-24 border-4 border-primary/20 shadow-lg">
                <AvatarImage src={currentPlumber.avatar} />
                <AvatarFallback className="text-xl">
                  {currentPlumber.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-white">
                    {currentPlumber.name}
                  </h1>
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary"
                  >
                    مختص فني صحي
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mb-4 text-gray-300">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{currentPlumber.city}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>عضو منذ {formatDate(currentPlumber.joinDate)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {renderStars(currentPlumber.rating)}
                    <span>({currentPlumber.reviewCount} تقييم)</span>
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {plumberActivity.completedJobs}
                    </div>
                    <div className="text-sm text-gray-300">مهمة مكتملة</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {plumberActivity.activeServices}
                    </div>
                    <div className="text-sm text-gray-300">خدمة نشطة</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {plumberActivity.totalEarnings}
                    </div>
                    <div className="text-sm text-gray-300">د.ك مكاسب</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {plumberActivity.monthlyJobs}
                    </div>
                    <div className="text-sm text-gray-300">مهمة هذا الشهر</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-3">
                <Button className="min-w-[160px]">
                  <Edit className="h-4 w-4 ms-2" />
                  تعديل الملف الشخصي
                </Button>
                <Button variant="outline" className="min-w-[160px]">
                  <Settings className="h-4 w-4 ms-2" />
                  إعدادات الحساب
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="services">الخدمات</TabsTrigger>
            <TabsTrigger value="works">أعمالي</TabsTrigger>
            <TabsTrigger value="experience">خبراتي</TabsTrigger>
            <TabsTrigger value="profile">ملفي الشخصي</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Active Services */}
              <Card className="premium-card-gradient">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      الخدمات النشطة
                    </h3>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/services">عرض الكل</Link>
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {activeServices.slice(0, 3).map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center justify-between p-3 bg-white/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-white">
                            {service.clientName}
                          </p>
                          <p className="text-sm text-gray-300">
                            {service.service}
                          </p>
                        </div>
                        <div className="text-start">
                          {getStatusBadge(service.status)}
                          <p className="text-sm text-gray-400 mt-1">
                            {service.amount} د.ك
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Works */}
              <Card className="premium-card-gradient">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      أحدث الأعمال
                    </h3>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="#works">إضافة عمل</Link>
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {recentWorks.slice(0, 3).map((work) => (
                      <div
                        key={work.id}
                        className="flex items-center justify-between p-3 bg-white/50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-white">{work.title}</p>
                          <p className="text-sm text-gray-300">
                            {work.clientName}
                          </p>
                        </div>
                        <div className="text-start">
                          {getStatusBadge(work.status)}
                          <p className="text-sm text-gray-400 mt-1">
                            {formatDate(work.date)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="premium-card-gradient">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">4.8</div>
                  <div className="text-sm text-gray-300">تقييم عام</div>
                </CardContent>
              </Card>
              <Card className="premium-card-gradient">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">87</div>
                  <div className="text-sm text-gray-300">عميل راضي</div>
                </CardContent>
              </Card>
              <Card className="premium-card-gradient">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">98%</div>
                  <div className="text-sm text-gray-300">معدل النجاح</div>
                </CardContent>
              </Card>
              <Card className="premium-card-gradient">
                <CardContent className="p-6 text-center">
                  <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">2.5</div>
                  <div className="text-sm text-gray-300">ساعة متوسط الوقت</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">إدارة الخدمات</h2>
              <Button asChild>
                <Link to="/services">عرض جميع الخدمات</Link>
              </Button>
            </div>
            <div className="space-y-4">
              {activeServices.map((service) => (
                <Card key={service.id} className="premium-card-gradient">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">
                          {service.clientName}
                        </h3>
                        <p className="text-gray-300">{service.service}</p>
                        <p className="text-sm text-gray-400">
                          طُلب {formatTimeAgo(service.requestDate)}
                        </p>
                      </div>
                      <div className="text-start space-y-2">
                        {getStatusBadge(service.status)}
                        <div className="text-lg font-bold text-primary">
                          {service.amount} د.ك
                        </div>
                        <div className="flex gap-2">
                          {service.status === "pending" && (
                            <>
                              <Button size="sm">قبول</Button>
                              <Button size="sm" variant="outline">
                                رفض
                              </Button>
                            </>
                          )}
                          {service.status === "accepted" && (
                            <Button size="sm">بدء العمل</Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Works Tab */}
          <TabsContent value="works" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                أعمالي ({recentWorks.length})
              </h2>
              <Button>
                <Plus className="h-4 w-4 ms-2" />
                إضافة عمل جديد
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {recentWorks.map((work) => (
                <Card key={work.id} className="premium-card-gradient">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-white">
                        {work.title}
                      </h3>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-gray-300 mb-3">{work.description}</p>
                    <p className="text-sm text-gray-400 mb-3">
                      العميل: {work.clientName}
                    </p>
                    {work.images.length > 0 && (
                      <img
                        src={work.images[0]}
                        alt="صورة العمل"
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                    )}
                    <div className="flex justify-between items-center">
                      {getStatusBadge(work.status)}
                      <span className="text-sm text-gray-400">
                        {formatDate(work.date)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Experience Tab */}
          <TabsContent value="experience" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">خبراتي المهنية</h2>
              <Button>
                <Plus className="h-4 w-4 ms-2" />
                إضافة خبرة جديدة
              </Button>
            </div>
            <div className="space-y-4">
              {experiences.map((experience) => (
                <Card key={experience.id} className="premium-card-gradient">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            {experience.title}
                          </h3>
                          {experience.isCurrent && (
                            <Badge className="bg-green-100 text-green-700">
                              حالي
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-300 mb-3">
                          {experience.description}
                        </p>
                        <div className="text-sm text-gray-400">
                          {formatDate(experience.startDate)} -{" "}
                          {experience.isCurrent
                            ? "حتى الآن"
                            : formatDate(experience.endDate!)}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <h2 className="text-xl font-bold text-white">معلوماتي الشخصية</h2>
            <Card className="premium-card-gradient">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <label className="font-semibold text-white">
                        البريد الإلكتروني
                      </label>
                      <p className="text-gray-300">{currentPlumber.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <label className="font-semibold text-white">
                        رقم الهاتف
                      </label>
                      <p className="text-gray-300">{currentPlumber.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <label className="font-semibold text-white">
                        المدينة
                      </label>
                      <p className="text-gray-300">{currentPlumber.city}</p>
                    </div>
                  </div>
                  <div>
                    <label className="font-semibold text-white">
                      النبذة الشخصية
                    </label>
                    <p className="text-gray-300">{currentPlumber.bio}</p>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t">
                  <Button variant="outline" className="w-full">
                    <Edit className="h-4 w-4 ms-2" />
                    تعديل المعلومات
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
