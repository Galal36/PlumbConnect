import { generateSEOConfig } from "@/hooks/useSEO";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Star, 
  Clock, 
  DollarSign, 
  FileText, 
  Phone, 
  MapPin, 
  CheckCircle,
  AlertTriangle,
  Wrench,
  Users,
  Award
} from "lucide-react";
import MainLayout from "@/layouts/MainLayout";

export default function HowToChoosePlumber() {
  const seoConfig = generateSEOConfig({
    title: "كيف تختار فني صحي موثوق - فني صحي الكويت",
    description: "دليل شامل لاختيار أفضل فني صحي في الكويت. نصائح مهمة لضمان جودة العمل والأمان",
    keywords: "كيف تختار فني صحي، فني صحي موثوق، نصائح اختيار سباك، فني صحي الكويت",
    url: "/how-to-choose-plumber",
    type: "article",
  });

  const tips = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "التحقق من الترخيص والوثائق",
      description: "تأكد من أن الفني الصحي لديه ترخيص ساري من البلدية أو الجهات المختصة. اطلب رؤية الوثائق الرسمية قبل البدء في العمل.",
      importance: "عالية",
      color: "bg-green-100 text-green-800"
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "التقييمات والمراجعات",
      description: "اقرأ تقييمات العملاء السابقين على المنصة. التقييمات العالية والمراجعات الإيجابية مؤشر جيد على جودة العمل.",
      importance: "عالية",
      color: "bg-blue-100 text-blue-800"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "الخبرة في المجال",
      description: "اختر فني صحي لديه خبرة لا تقل عن 3-5 سنوات في مجال السباكة. الخبرة تعني مهارة أعلى وحلول أفضل للمشاكل.",
      importance: "عالية",
      color: "bg-purple-100 text-purple-800"
    },
    {
      icon: <DollarSign className="w-6 h-6" />,
      title: "المقارنة بين الأسعار",
      description: "احصل على عروض أسعار من عدة فنيين صحيين. لا تختار الأرخص دائماً، بل اختر الأفضل من حيث الجودة والسعر.",
      importance: "متوسطة",
      color: "bg-yellow-100 text-yellow-800"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "عقد العمل المكتوب",
      description: "اطلب عقد عمل مكتوب يوضح تفاصيل العمل والأسعار والضمان. تجنب العمل الشفهي لتجنب المشاكل لاحقاً.",
      importance: "عالية",
      color: "bg-red-100 text-red-800"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "سهولة التواصل",
      description: "تأكد من أن الفني الصحي متاح للتواصل بسهولة. الفني الجيد يستجيب بسرعة للاتصالات والرسائل.",
      importance: "متوسطة",
      color: "bg-indigo-100 text-indigo-800"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "الموقع والقرب",
      description: "يفضل اختيار فني صحي قريب من موقعك لضمان الوصول السريع في حالات الطوارئ.",
      importance: "متوسطة",
      color: "bg-pink-100 text-pink-800"
    },
    {
      icon: <Wrench className="w-6 h-6" />,
      title: "الأدوات والمعدات",
      description: "تأكد من أن الفني الصحي يستخدم أدوات ومعدات حديثة وعالية الجودة. هذا مؤشر على الاحترافية.",
      importance: "متوسطة",
      color: "bg-orange-100 text-orange-800"
    }
  ];

  const redFlags = [
    "عدم وجود ترخيص أو وثائق رسمية",
    "رفض تقديم عقد عمل مكتوب",
    "طلب دفع كامل المبلغ مقدماً",
    "عدم وجود ضمان على العمل",
    "التأخير المتكرر في المواعيد",
    "عدم الرد على الاتصالات",
    "أسعار منخفضة جداً مقارنة بالسوق",
    "عدم وجود تأمين ضد الحوادث"
  ];

  const greenFlags = [
    "ترخيص ساري من الجهات المختصة",
    "عقد عمل واضح ومكتوب",
    "ضمان على العمل لمدة مناسبة",
    "تقييمات عالية من العملاء السابقين",
    "خبرة طويلة في المجال",
    "استخدام معدات حديثة وعالية الجودة",
    "استجابة سريعة للاتصالات",
    "أسعار منافسة وعادلة"
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
                  دليل شامل
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  كيف تختار
                  <span className="block text-primary bg-gradient-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent">
                    فني صحي موثوق؟
                  </span>
                </h1>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  نصائح مهمة لمساعدتك في اختيار أفضل فني صحي في الكويت. 
                  تعلم كيفية تجنب المشاكل وضمان جودة العمل والأمان.
                </p>
              </div>
            </div>
          </section>

          {/* Main Content */}
          <section className="py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Tips Grid */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-white text-center mb-12">
                  <CheckCircle className="w-8 h-8 inline-block mr-3 text-primary" />
                  نصائح مهمة لاختيار فني صحي موثوق
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tips.map((tip, index) => (
                    <Card key={index} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-primary">
                            {tip.icon}
                          </div>
                          <Badge className={tip.color}>
                            {tip.importance}
                          </Badge>
                        </div>
                        <CardTitle className="text-white text-lg">
                          {tip.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300 leading-relaxed">
                          {tip.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Warning Signs */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-white text-center mb-8">
                  <AlertTriangle className="w-8 h-8 inline-block mr-3 text-red-400" />
                  علامات التحذير - تجنب هذه الفنيين
                </h2>
                <Card className="bg-red-900/20 border-red-500/30">
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      {redFlags.map((flag, index) => (
                        <div key={index} className="flex items-center space-x-3 space-x-reverse">
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                          <span className="text-red-200">{flag}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Good Signs */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-white text-center mb-8">
                  <Award className="w-8 h-8 inline-block mr-3 text-green-400" />
                  علامات الجودة - ابحث عن هذه الصفات
                </h2>
                <Card className="bg-green-900/20 border-green-500/30">
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      {greenFlags.map((flag, index) => (
                        <div key={index} className="flex items-center space-x-3 space-x-reverse">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-green-200">{flag}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Final Advice */}
              <div className="text-center">
                <Card className="bg-primary/10 border-primary/30">
                  <CardContent className="p-8">
                    <Users className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-4">
                      نصيحة أخيرة
                    </h3>
                    <p className="text-gray-300 text-lg leading-relaxed max-w-3xl mx-auto">
                      تذكر دائماً أن اختيار فني صحي جيد هو استثمار في راحة منزلك وأمان عائلتك. 
                      لا تستعجل في الاختيار، وخذ وقتك في البحث والمقارنة. 
                      الفني الجيد سيكون سعيداً بالإجابة على أسئلتك وتوضيح تفاصيل العمل.
                    </p>
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