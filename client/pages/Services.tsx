import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Wrench,
  Loader2,
  User
} from "lucide-react";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuthContext } from "@/contexts/AuthContext";
import { servicesApiService, ServiceRequest } from "@/services/servicesApi";
import { toast } from "sonner";
import ServiceStatusDialog from "@/components/ServiceStatusDialog";
import ServiceReviewDialog from "@/components/ServiceReviewDialog";
import ServiceRatingDialog from "@/components/ServiceRatingDialog";

export default function Services() {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [selectedService, setSelectedService] = useState<ServiceRequest | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [serviceToRate, setServiceToRate] = useState<ServiceRequest | null>(null);

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Load services on component mount
  useEffect(() => {
    const loadServices = async () => {
      try {
        setIsLoadingServices(true);
        const userServices = await servicesApiService.getServiceRequests();
        setServices(userServices);
      } catch (error: any) {
        console.error("Failed to load services:", error);
        toast.error("فشل في تحميل الخدمات");
      } finally {
        setIsLoadingServices(false);
      }
    };

    if (isAuthenticated && user) {
      loadServices();
    }
  }, [isAuthenticated, user]);

  // Handle service update
  const handleServiceUpdated = (updatedService: ServiceRequest) => {
    setServices(prev =>
      prev.map(service =>
        service.id === updatedService.id ? updatedService : service
      )
    );
  };

  // Handle accept service
  const handleAcceptService = (service: ServiceRequest) => {
    setSelectedService(service);
    setIsStatusDialogOpen(true);
  };

  // Handle reject service
  const handleRejectService = async (service: ServiceRequest) => {
    try {
      const updatedService = await servicesApiService.rejectServiceRequest(service.id);
      handleServiceUpdated(updatedService);
      toast.success("تم رفض الخدمة");
    } catch (error: any) {
      console.error("Failed to reject service:", error);
      toast.error(error.message || "فشل في رفض الخدمة");
    }
  };

  // Handle review service
  const handleReviewService = (service: ServiceRequest) => {
    setSelectedService(service);
    setIsReviewDialogOpen(true);
  };

  // Handle showing rating dialog after service acceptance
  const handleShowRating = (service: ServiceRequest) => {
    setServiceToRate(service);
    setIsRatingDialogOpen(true);
  };

  // Handle rating submitted
  const handleRatingSubmitted = async () => {
    // Refresh services list to show updated data
    if (user) {
      try {
        const userServices = await servicesApiService.getServiceRequests();
        setServices(userServices);
      } catch (error: any) {
        console.error("Failed to refresh services:", error);
        // Don't show error toast here as it might be confusing after successful rating
      }
    }
  };
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            في الانتظار
          </Badge>
        );
      case 'accepted':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            مقبولة
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            مرفوضة
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            مكتملة
          </Badge>
        );
      default:
        return null;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-KW", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  // Loading state
  if (isLoading || isLoadingServices) {
    return (
      <div className="min-h-screen bg-gray-900" dir="rtl">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-white">جاري تحميل الخدمات...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900" dir="rtl">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">الخدمات</h1>
          <p className="text-gray-400">
            {user?.role === 'plumber'
              ? 'قائمة الخدمات المطلوبة منك'
              : 'قائمة الخدمات التي طلبتها'
            }
          </p>
        </div>

        {services.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="text-center py-12">
              <Wrench className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                لا توجد خدمات بعد
              </h3>
              <p className="text-gray-400">
                {user?.role === 'plumber'
                  ? 'لم يتم طلب أي خدمات منك حتى الآن'
                  : 'لم تطلب أي خدمات حتى الآن'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {services.map((service) => (
              <Card key={service.id} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={
                            user?.role === 'plumber'
                              ? service.sender_details.image || "/placeholder.svg"
                              : service.receiver_details.image || "/placeholder.svg"
                          }
                        />
                        <AvatarFallback>
                          {user?.role === 'plumber'
                            ? service.sender_details.name.charAt(0)
                            : service.receiver_details.name.charAt(0)
                          }
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg">
                          {user?.role === 'plumber'
                            ? `خدمة من ${service.sender_details.name}`
                            : `خدمة من ${service.receiver_details.name} (فني صحي)`
                          }
                        </h3>
                        <p className="text-sm text-gray-400">
                          {formatDate(service.created_at)}
                        </p>
                      </div>
                    </CardTitle>
                    {getStatusBadge(service.status)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-white mb-2">معلومات الخدمة:</h4>
                    <div className="text-gray-300 bg-gray-700 p-3 rounded-lg space-y-2">
                      <p><span className="font-medium">رقم الخدمة:</span> #{service.id}</p>
                      <div><span className="font-medium">الحالة:</span> {getStatusBadge(service.status)}</div>
                    </div>
                  </div>

                  {/* Show price only for clients and only if service is accepted */}
                  {user?.role !== 'plumber' && service.amount && parseFloat(service.amount) > 0 && service.status === 'accepted' && (
                    <div className="flex items-center gap-2 text-green-400">
                      <DollarSign className="h-4 w-4" />
                      <span>السعر: {service.amount} د.ك</span>
                    </div>
                  )}

                  {/* Action buttons - only for clients */}
                  {user?.role !== 'plumber' && service.status === 'pending' && (
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={() => handleAcceptService(service)}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        قبول الخدمة
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleRejectService(service)}
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        رفض الخدمة
                      </Button>
                    </div>
                  )}

                  {/* Review button - only for clients after completion */}
                  {user?.role !== 'plumber' && service.status === 'completed' && (
                    <div className="pt-4">
                      <Button
                        onClick={() => handleReviewService(service)}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        تقييم الخدمة
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Service Status Dialog */}
      {selectedService && (
        <ServiceStatusDialog
          isOpen={isStatusDialogOpen}
          onClose={() => {
            setIsStatusDialogOpen(false);
            setSelectedService(null);
          }}
          serviceRequest={selectedService}
          onServiceUpdated={handleServiceUpdated}
          onShowRating={handleShowRating}
        />
      )}

      {/* Service Review Dialog */}
      {selectedService && (
        <ServiceReviewDialog
          isOpen={isReviewDialogOpen}
          onClose={() => {
            setIsReviewDialogOpen(false);
            setSelectedService(null);
          }}
          serviceRequestId={selectedService.id}
          plumberName={selectedService.receiver_details.name}
        />
      )}

      {/* Service Rating Dialog - Shows immediately after accepting a service */}
      {serviceToRate && (
        <ServiceRatingDialog
          isOpen={isRatingDialogOpen}
          onClose={() => {
            setIsRatingDialogOpen(false);
            setServiceToRate(null);
          }}
          serviceRequest={serviceToRate}
          onRatingSubmitted={handleRatingSubmitted}
        />
      )}
    </div>
  );
}
