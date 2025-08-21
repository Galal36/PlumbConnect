import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ChatBotTest from "@/components/ChatBotTest";
import { Bot, MessageCircle, Zap, Shield, Globe, Smartphone } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants";

/**
 * ChatBot Demo Page
 * Showcases the chatbot functionality and provides testing interface
 */
export default function ChatBotDemo() {
  const { isAuthenticated } = useAuthContext();

  const features = [
    {
      icon: <Bot className="h-6 w-6" />,
      title: "مساعد ذكي",
      description: "يستخدم الذكاء الاصطناعي لتقديم إجابات دقيقة ومفيدة"
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "محادثة تفاعلية",
      description: "واجهة محادثة سهلة الاستخدام مع تاريخ الرسائل"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "استجابة سريعة",
      description: "ردود فورية على استفساراتك حول السباكة"
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "آمن ومحمي",
      description: "محادثاتك محمية ومشفرة بأعلى معايير الأمان"
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "دعم اللغة العربية",
      description: "يفهم ويتحدث باللغة العربية بطلاقة"
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "متوافق مع الجوال",
      description: "يعمل بسلاسة على جميع الأجهزة والشاشات"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Bot className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold text-gray-900">المساعد الذكي</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            مساعدك الشخصي في عالم السباكة - يجيب على أسئلتك ويساعدك في العثور على أفضل الحلول
          </p>
          
          {!isAuthenticated && (
            <div className="mt-6">
              <Badge variant="outline" className="mb-4">
                يجب تسجيل الدخول لاستخدام المساعد الذكي
              </Badge>
              <div className="flex gap-4 justify-center">
                <Button asChild>
                  <Link to={ROUTES.LOGIN}>تسجيل الدخول</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to={ROUTES.REGISTER}>إنشاء حساب جديد</Link>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-2 text-primary">
                  {feature.icon}
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* How to Use */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center text-2xl">كيفية الاستخدام</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="font-semibold mb-2">انقر على أيقونة المساعد</h3>
                <p className="text-gray-600">ستجد أيقونة المساعد الذكي في الزاوية السفلى اليمنى من الشاشة</p>
              </div>
              <div>
                <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="font-semibold mb-2">اكتب سؤالك</h3>
                <p className="text-gray-600">اكتب أي سؤال متعلق بالسباكة أو استخدام الموقع</p>
              </div>
              <div>
                <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="font-semibold mb-2">احصل على الإجابة</h3>
                <p className="text-gray-600">سيقوم المساعد بتقديم إجابة مفصلة ومفيدة فوراً</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Example Questions */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center text-2xl">أمثلة على الأسئلة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-3 text-primary">أسئلة حول السباكة:</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• كيف أصلح تسريب في الحنفية؟</li>
                  <li>• ما هي أفضل طريقة لتنظيف المجاري؟</li>
                  <li>• كيف أختار السباك المناسب؟</li>
                  <li>• ما هي علامات انسداد الأنابيب؟</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 text-primary">أسئلة حول الموقع:</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• كيف أطلب خدمة سباك؟</li>
                  <li>• كيف أقيم السباك بعد الخدمة؟</li>
                  <li>• كيف أتواصل مع السباكين؟</li>
                  <li>• كيف أنشر مقال أو تجربة؟</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Interface - Only for authenticated users */}
        {isAuthenticated && (
          <div>
            <h2 className="text-2xl font-bold text-center mb-8">واجهة الاختبار</h2>
            <ChatBotTest />
          </div>
        )}

        {/* Call to Action */}
        <Card className="text-center bg-primary text-white">
          <CardContent className="py-12">
            <Bot className="h-16 w-16 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">جرب المساعد الذكي الآن!</h3>
            <p className="text-lg mb-6 opacity-90">
              ابدأ محادثة مع مساعدك الذكي واحصل على إجابات فورية لجميع أسئلتك
            </p>
            {isAuthenticated ? (
              <p className="text-lg">
                انظر إلى الزاوية السفلى اليمنى وانقر على أيقونة المساعد الذكي 👇
              </p>
            ) : (
              <div className="flex gap-4 justify-center">
                <Button variant="secondary" asChild>
                  <Link to={ROUTES.LOGIN}>تسجيل الدخول</Link>
                </Button>
                <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-primary" asChild>
                  <Link to={ROUTES.REGISTER}>إنشاء حساب</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
