import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Star,
  Clock,
  Shield,
  Users,
  Award,
  PhoneCall,
  MessageCircle,
  Wrench,
  Heart,
  Zap,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

export default function HowToChoose() {
  const features = [
    {
      icon: <Star className="h-8 w-8 text-yellow-500" />,
      title: "فنيين ذوي خبرة عالية",
      description:
        "فنيين صحيين مؤهلين بخبرة عملية تزيد عن 5 سنوات في مجال الأعمال الصحية والصيانة.",
    },
    {
      icon: <Clock className="h-8 w-8 text-blue-500" />,
      title: "استجابة سريعة",
      description:
        "نحن نساعدك في العثور على الفني المناسب بسرعة ونسهل عليك التواصل معه مباشرة.",
    },
    {
      icon: <Shield className="h-8 w-8 text-green-500" />,
      title: "جودة في العمل",
      description:
        "الفنيين الصحيين في منصتنا معروفين بجودة عملهم واهتمامهم بالتفاصيل.",
    },
    {
      icon: <Heart className="h-8 w-8 text-red-500" />,
      title: "رضا العملاء أولويتنا",
      description:
        "نحن نؤمن بأن سعادة عملائنا هي مقياس نجاحنا الحقيقي ونسعى لتوفير أفضل تجربة.",
    },
  ];

  const steps = [
    {
      number: "1",
      title: "تصفح ملفات الفنيين",
      description:
        "اختر من بين أكثر من 100 فني صحي مؤهل ومرخص في جميع مناطق الكويت",
      icon: <Users className="h-6 w-6" />,
    },
    {
      number: "2",
      title: "قارن الخبرات والمهارات",
      description: "اطلع على خبرات ومهارات كل فني لتختار الأنسب لاحتياجاتك",
      icon: <Star className="h-6 w-6" />,
    },
    {
      number: "3",
      title: "تواصل مباشرة",
      description:
        "تواصل مع الفني مباشرة عبر المحادثة لمناقشة التفاصيل والموعد",
      icon: <MessageCircle className="h-6 w-6" />,
    },
    {
      number: "4",
      title: "احجز بثقة",
      description:
        "احجز الخدمة بكل ثقة مع الفنيين الموثوقين والملتزمين بالمواعيد",
      icon: <CheckCircle className="h-6 w-6" />,
    },
  ];

  const stats = [
    { number: "500+", label: "عميل سعيد", icon: <Heart className="h-5 w-5" /> },
    { number: "100+", label: "فني مؤهل", icon: <Users className="h-5 w-5" /> },
    {
      number: "سريع",
      label: "تواصل مباشر",
      icon: <Star className="h-5 w-5" />,
    },
    {
      number: "موثوق",
      label: "منصة آمنة",
      icon: <Clock className="h-5 w-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900" dir="rtl">
      <Navbar />

      {/* Hero Section */}
      <section className="premium-gradient py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <Badge
              variant="secondary"
              className="mb-6 bg-white/20 backdrop-blur-sm border-white/30 text-white animate-pulse"
            >
              ⭐ منصة موثوقة للفنيين الصحيين
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg leading-tight">
              كيف تختار أفضل
              <span className="block text-white/90 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                فني صحي في الكويت؟
              </span>
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto drop-shadow">
              نحن نساعدك في اختيار أفضل الفنيين الصحيين المؤهلين والموثوقين في
              الكويت. دليلك الشامل للحصول على خدمة متميزة تلبي احتياجاتك.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="premium-gradient rounded-full p-4">
                    {stat.icon}
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-white mb-2">
                  {stat.number}
                </h3>
                <p className="text-gray-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              لماذا نحن الخيار الأمثل؟
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              نحن نقدم خدمات الفنيين الصحيين بأعلى معايير الجودة والمهنية في
              الكويت
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="premium-card-gradient hover:shadow-2xl transition-all duration-300"
              >
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="premium-gradient rounded-xl p-3">
                        {feature.icon}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-gray-300 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How to Choose Steps */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              كيف تختار الفني المناسب؟
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              اتبع هذه الخطوات البسيطة للحصول على أفضل خدمة
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <Card
                key={index}
                className="premium-card-gradient text-center hover:shadow-2xl transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="premium-gradient rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">
                      {step.number}
                    </span>
                  </div>
                  <div className="mb-4 flex justify-center text-primary">
                    {step.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                مميزات منصتنا الحصرية
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="premium-gradient rounded-full p-2 flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      اختيار دقيق للفنيين
                    </h4>
                    <p className="text-gray-300">
                      نساعدك في العثور على الفنيين ذوي الخبرة والمهارة المناسبة
                      لاحتياجاتك
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="premium-gradient rounded-full p-2 flex-shrink-0">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      جودة عالية
                    </h4>
                    <p className="text-gray-300">
                      الفنيين في منصتنا معروفين بجودة عملهم وحرصهم على إرضاء
                      العملاء
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="premium-gradient rounded-full p-2 flex-shrink-0">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      خدمة سريعة
                    </h4>
                    <p className="text-gray-300">
                      منصة سهلة الاستخدام تساعدك في العثور على الفني المناسب
                      بسرعة
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="premium-gradient rounded-full p-2 flex-shrink-0">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">
                      تغطية شاملة
                    </h4>
                    <p className="text-gray-300">
                      نغطي جميع مناطق الكويت مع فنيين مؤهلين في كل منطقة
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Card className="premium-card-gradient p-6 text-center">
                <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">
                  تواصل مباشر
                </h4>
                <p className="text-gray-300 text-sm">
                  تواصل مع الفني عبر المحادثة مباشرة
                </p>
              </Card>
              <Card className="premium-card-gradient p-6 text-center">
                <Users className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">
                  اختيار متنوع
                </h4>
                <p className="text-gray-300 text-sm">
                  مجموعة واسعة من الفنيين المؤهلين
                </p>
              </Card>
              <Card className="premium-card-gradient p-6 text-center">
                <Shield className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">
                  أمان مضمون
                </h4>
                <p className="text-gray-300 text-sm">
                  جميع البيانات محمية بأعلى معايير الأمان
                </p>
              </Card>
              <Card className="premium-card-gradient p-6 text-center">
                <Clock className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-white mb-2">
                  مواعيد مرنة
                </h4>
                <p className="text-gray-300 text-sm">
                  تنسيق المواعيد حسب ما يناسبك
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 premium-gradient">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            جاهز لاختيار أفضل فني صحي؟
          </h2>
          <p className="text-xl text-white/90 mb-8">
            انضم لآلاف العملاء الراضين واحصل على خدمة متميزة الآن
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="text-lg px-10 py-6 bg-white text-primary hover:bg-white/90 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 font-semibold"
              asChild
            >
              <Link to="/plumbers">
                <Wrench className="h-5 w-5 ms-2" />
                تصفح الفنيين الآن
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm hover:border-white/50 transition-all duration-300"
              asChild
            >
              <Link to="/#testimonials">شاهد تجارب العملاء</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
