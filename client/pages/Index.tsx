import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Wrench,
  Droplets,
  Flame,
  Phone,
  MapPin,
  Mail,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import SEOHead from "@/components/SEOHead";
import { generateSEOConfig, SEOUtils } from "@/hooks/useSEO";
import LazyImage from "@/components/LazyImage";

export default function Index() {
  const seoConfig = generateSEOConfig({
    title: "احجز فني صحي موثوق في الكويت",
    description:
      "منصة الكويت للفنيين الصحيين الموثوقة. احجز أفضل الفنيين الصحيين المرخصين والمؤمنين في جميع مناطق الكويت. خدمة سريعة، أسعار مناسبة، وجودة عالية.",
    keywords:
      "فني صحي الكويت، سباك الكويت، إصلاح سباكة، تمديد أنابيب، سخان ماء، حنفيات، مجاري، فني موثوق، صيانة سباكة، خدمات منزلية",
    url: "/",
    type: "website",
  });

  const structuredData = SEOUtils.generateLocalBusinessSchema({
    name: "فني صحي الكويت",
    description: "منصة الكويت للفنيين الصحيين الموثوقة",
    phone: "+965-XXXX-XXXX",
    address: "الكويت",
    rating: 4.8,
    reviewCount: 500,
  });

  const services = [
    {
      icon: <Droplets className="h-8 w-8" />,
      title: "إصلاح الحنفيات",
      description: "إصلاح سريع للحنفيات المعط��ة ومشاكل ضغط الماء",
    },
    {
      icon: <Wrench className="h-8 w-8" />,
      title: "تمديد الأنابيب",
      description: "خدمات تمديد وتبديل الأنابيب بشكل مهني واحترافي",
    },
    {
      icon: <Flame className="h-8 w-8" />,
      title: "مشاكل سخان الماء",
      description: "إصلاح وصيانة وتركيب سخانات الماء",
    },
  ];

  return (
    <>
      <SEOHead config={seoConfig} structuredData={structuredData} />
      <MainLayout className="bg-gray-900" showNavbar={true}>
        {/* Hero Section */}
        <section className="premium-gradient py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center">
              <Badge
                variant="secondary"
                className="mb-6 bg-white/20 backdrop-blur-sm border-white/30 text-white animate-pulse"
              >
                ⚡ منصة موثوقة في الكويت
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg leading-tight">
                احجز فني صحي موثوق
                <span className="block text-white/90 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                  في الكويت
                </span>
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow">
                ادخل إلى منصتنا واختار أفضل الفنيين الصحيين في الكويت. شوف
                التقييمات واختار اللي يناسبك.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  className="text-lg px-10 py-6 bg-white text-primary hover:bg-white/90 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 font-semibold"
                  asChild
                >
                  <Link to="/plumbers">
                    <Wrench className="h-5 w-5 ms-2" />
                    شوف الفنيين الصحيين
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-6 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm hover:border-white/50 transition-all duration-300"
                  asChild
                >
                  <Link to="/how-to-choose-plumber">كيف تختار فني صحي؟</Link>
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-white/70 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>+500 عميل راضي</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span>فنيين موثوقين</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span>استجابة سريعة</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-20 bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                خدماتنا
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                من الإصلاحات الطارئة إلى التركيبات المخططة، اختار الفني صحي
                المناسب لاحتياجاتك من منصتنا.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <Card
                  key={index}
                  className="text-center premium-card-gradient hover:shadow-2xl transition-all duration-500 hover:scale-105 group border-gray-600/20 hover:border-primary/30"
                >
                  <CardContent className="p-8 relative overflow-hidden">
                    <div className="premium-gradient text-white mb-6 flex justify-center w-20 h-20 rounded-2xl items-center mx-auto shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                      {service.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-primary transition-colors duration-300">
                      {service.title}
                    </h3>
                    <p className="text-gray-300 mb-6 leading-relaxed">
                      {service.description}
                    </p>
                    <Button
                      variant="outline"
                      className="w-full border-primary/20 text-primary hover:bg-primary hover:text-white transition-all duration-300 font-medium"
                    >
                      شوف الفنيين الصحيين
                    </Button>

                    {/* Decorative element */}
                    <div className="absolute top-4 left-4 w-8 h-8 bg-primary/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                ليش تختارنا؟
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-blue-400 mx-auto rounded-full"></div>
            </div>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center group hover:transform hover:scale-105 transition-all duration-300">
                <div className="premium-gradient rounded-2xl p-5 w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-3 text-lg">
                  خدمة سريعة
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  نساعدك تلاقي الفني المناسب بسرعة
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-white mb-2">فنيين موثوقين</h3>
                <p className="text-gray-300 text-sm">
                  فنيين ��وي خبرة وسمعة طيبة
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-white mb-2">خبراء محليين</h3>
                <p className="text-gray-300 text-sm">نخدم جميع مناطق الكويت</p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Wrench className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-white mb-2">شغل عدل</h3>
                <p className="text-gray-300 text-sm">
                  فنيين يهتموا برضا العملاء
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 premium-gradient relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
              محتاج فني صحي عاجل؟
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow">
              لا تنتظر! شوف الفنيين الصحيين المتاحين الحين في منطقتك واختار
              الأنسب لك.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90 shadow-xl"
                asChild
              >
                <Link to="/plumbers">شوف الفنيين الصحيين المتاحين</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                asChild
              >
                <Link to="/how-can-we-help-you">
                <Wrench className="h-5 w-5 ms-2" />
                كيف نساعدك؟
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer
          id="contact"
          className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="premium-gradient rounded-xl p-3 shadow-lg">
                    <Wrench className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-bold premium-text-gradient">
                    فني صحي الكويت
                  </span>
                </div>
                <p className="text-gray-400 mb-4">
                  منصة الكويت للفني صحية الموثوقة. نربطك بأفضل الفنيين الصحيين
                  المرخصين والمؤمنين.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">كيف نعمل</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-primary" />
                    <span className="text-gray-300">شوف التقييمات</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Wrench className="h-5 w-5 text-primary" />
                    <span className="text-gray-300">اختار الفني الصحي</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span className="text-gray-300">احجز الموعد</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">مناطق الخدمة</h3>
                <ul className="space-y-2 text-gray-300">
                  <li>مدينة الكويت</li>
                  <li>حولي</li>
                  <li>السالمية</li>
                  <li>الجهراء</li>
                  <li>الأحمدي</li>
                  <li>الفروانية</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">المميزات</h3>
                <div className="space-y-2 text-gray-300">
                  <p>فنيين صحيين موثوقين</p>
                  <p>خبرات متنوعة</p>
                  <p>أسعار شفافة</p>
                  <p>خدمة عملاء مميزة</p>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-12 pt-8 text-center">
              <p className="text-gray-400">
                © 2025 فني صحي الكويت. جميع الحقوق محفوظة. منصة للفنيين الصحيين
                في الكويت.
              </p>
            </div>
          </div>
        </footer>
      </MainLayout>
    </>
  );
}
