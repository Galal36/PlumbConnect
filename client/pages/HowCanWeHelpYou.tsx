import { generateSEOConfig } from "@/hooks/useSEO";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  MessageSquare, 
  Shield, 
  Clock, 
  Star, 
  MapPin, 
  Phone, 
  CheckCircle,
  Users,
  Wrench,
  FileText,
  Award,
  Zap,
  Heart
} from "lucide-react";
import MainLayout from "@/layouts/MainLayout";

export default function HowCanWeHelpYou() {
  const seoConfig = generateSEOConfig({
    title: "كيف نساعدك - فني صحي الكويت",
    description: "اكتشف كيف يمكن لمنصة فني صحي الكويت مساعدتك في العثور على أفضل الفنيين الصحيين وحل مشاكل السباكة",
    keywords: "كيف نساعدك، منصة فني صحي، خدمات السباكة، فني صحي الكويت",
    url: "/how-can-we-help-you",
    type: "article",
  });

  const services = [
    {
      icon: <Search className="w-8 h-8" />,
      title: "البحث السريع",
      description: "ابحث عن فني صحي في منطقتك بسهولة. استخدم فلاتر متقدمة للعثور على الفني المناسب لاحتياجاتك.",
      features: ["بحث حسب المنطقة", "فلترة حسب التقييم", "فلترة حسب الخبرة", "فلترة حسب السعر"]
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "التواصل المباشر",
      description: "تواصل مباشر مع الفني الصحي عبر الرسائل أو الاتصال. احصل على رد سريع واستفسر عن التفاصيل.",
      features: ["رسائل فورية", "مكالمات مباشرة", "مشاركة الصور", "تحديد المواعيد"]
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "الضمان والحماية",
      description: "نضمن لك الحصول على فني صحي موثوق ومرخص. جميع الفنيين على المنصة يخضعون لمراجعة دقيقة.",
      features: ["فنيين مرخصين", "تقييمات موثوقة", "ضمان العمل", "حماية العميل"]
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "خدمة 24/7",
      description: "احصل على مساعدة في أي وقت. لدينا فنيين متاحين على مدار الساعة لحالات الطوارئ.",
      features: ["متاح 24/7", "استجابة سريعة", "حالات الطوارئ", "مواعيد مرنة"]
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "تقييمات موثوقة",
      description: "اقرأ تقييمات العملاء الحقيقية. تعرف على تجارب الآخرين قبل اختيار الفني الصحي.",
      features: ["تقييمات حقيقية", "صور العمل", "تعليقات مفصلة", "معدل الرضا"]
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "خدمة محلية",
      description: "فنيين صحيين في جميع مناطق الكويت. احصل على خدمة سريعة من فني قريب منك.",
      features: ["جميع المناطق", "وصول سريع", "معرفة المناطق", "خدمة محلية"]
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "ابحث عن فني صحي",
      description: "استخدم محرك البحث المتقدم للعثور على فني صحي في منطقتك",
      icon: <Search className="w-6 h-6" />
    },
    {
      step: "2",
      title: "اقرأ التقييمات",
      description: "اطلع على تقييمات العملاء السابقين وتجاربهم",
      icon: <Star className="w-6 h-6" />
    },
    {
      step: "3",
      title: "تواصل مباشر",
      description: "اتصل أو راسل الفني الصحي مباشرة لطلب الخدمة",
      icon: <MessageSquare className="w-6 h-6" />
    },
    {
      step: "4",
      title: "احصل على الخدمة",
      description: "استلم خدمة عالية الجودة مع ضمان العمل",
      icon: <CheckCircle className="w-6 h-6" />
    }
  ];

  const benefits = [
    "توفير الوقت والجهد في البحث عن فني صحي",
    "ضمان الحصول على فني مرخص وموثوق",
    "أسعار منافسة وعادلة",
    "خدمة سريعة ومتاحة 24/7",
    "حماية العميل وضمان العمل",
    "تقييمات حقيقية وموثوقة",
    "تواصل مباشر وسهل",
    "خدمة محلية في جميع المناطق"
  ];

  return (
    <>
      <SEOHead config={seoConfig} />
      <MainLayout showNavbar={true}>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
          {/* Hero Section */}
          <section className="pt-20 pb-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="mb-8">
                <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm">
                  خدماتنا لك
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  كيف
                  <span className="block text-primary bg-gradient-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent">
                    نساعدك؟
                  </span>
                </h1>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  منصة فني صحي الكويت تقدم لك حلول شاملة لجميع احتياجات السباكة. 
                  اكتشف كيف يمكننا تسهيل حياتك وضمان حصولك على أفضل الخدمات.
                </p>
              </div>
            </div>
          </section>

          {/* Main Content */}
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Services Grid */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-white text-center mb-12">
                  <Wrench className="w-8 h-8 inline-block mr-3 text-primary" />
                  خدماتنا لك
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service, index) => (
                    <Card key={index} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                      <CardHeader className="pb-3">
                        <div className="text-primary mb-3">
                          {service.icon}
                        </div>
                        <CardTitle className="text-white text-lg">
                          {service.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300 leading-relaxed mb-4">
                          {service.description}
                        </p>
                        <div className="space-y-2">
                          {service.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="flex items-center space-x-2 space-x-reverse">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span className="text-gray-300 text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* How It Works */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-white text-center mb-12">
                  <Zap className="w-8 h-8 inline-block mr-3 text-primary" />
                  كيف تعمل المنصة؟
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {howItWorks.map((step, index) => (
                    <Card key={index} className="bg-primary/10 border-primary/30 text-center">
                      <CardContent className="p-6">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                          <span className="text-white font-bold text-lg">{step.step}</span>
                        </div>
                        <div className="text-primary mb-3">
                          {step.icon}
                        </div>
                        <h3 className="text-white font-semibold mb-2">
                          {step.title}
                        </h3>
                        <p className="text-gray-300 text-sm">
                          {step.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-white text-center mb-8">
                  <Heart className="w-8 h-8 inline-block mr-3 text-primary" />
                  مميزات استخدام منصتنا
                </h2>
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      {benefits.map((benefit, index) => (
                        <div key={index} className="flex items-center space-x-3 space-x-reverse">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span className="text-gray-300">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Call to Action */}
              <div className="text-center">
                <Card className="bg-primary/10 border-primary/30">
                  <CardContent className="p-8">
                    <Award className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-4">
                      ابدأ الآن!
                    </h3>
                    <p className="text-gray-300 text-lg leading-relaxed max-w-3xl mx-auto mb-6">
                      لا تنتظر أكثر من ذلك! ابدأ في استخدام منصتنا الآن واحصل على أفضل خدمات السباكة في الكويت. 
                      نحن هنا لمساعدتك في كل خطوة.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Badge variant="secondary" className="px-6 py-3 text-lg">
                        <Users className="w-5 h-5 mr-2" />
                        ابحث عن فني صحي
                      </Badge>
                      <Badge variant="outline" className="px-6 py-3 text-lg border-primary text-primary">
                        <Phone className="w-5 h-5 mr-2" />
                        تواصل معنا
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </div>
      </MainLayout>
    </>
  );
} 