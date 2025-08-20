import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Search, Filter, Eye, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuthContext } from "@/contexts/AuthContext";
import { complaintsApiService, Complaint, COMPLAINT_TYPES, COMPLAINT_STATUS } from "@/services/complaintsApi";
import { toast } from "sonner";

export default function ComplaintsList() {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoadingComplaints, setIsLoadingComplaints] = useState(true);
  const [filters, setFilters] = useState({
    complaint_type: "",
    status: "",
    search: "",
  });

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Load complaints
  const loadComplaints = async () => {
    try {
      setIsLoadingComplaints(true);
      const data = await complaintsApiService.getComplaints(filters);
      setComplaints(data);
    } catch (error) {
      console.error("Failed to load complaints:", error);
      toast.error("فشل في تحميل الشكاوى");
    } finally {
      setIsLoadingComplaints(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      loadComplaints();
    }
  }, [isAuthenticated, user, filters]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-900" dir="rtl">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 rounded-full p-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">إدارة الشكاوى</h1>
          <p className="text-gray-300">
            {user?.role === 'admin' ? 'عرض وإدارة جميع الشكاوى' : 'عرض شكاويك المقدمة والمستلمة'}
          </p>
        </div>

        {/* Filters */}
        <Card className="premium-card-gradient mb-6">
          <CardHeader>
            <CardTitle className="text-end flex items-center gap-2">
              <Filter className="h-5 w-5" />
              تصفية الشكاوى
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="البحث في الشكاوى..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pr-10"
                />
              </div>

              {/* Complaint Type Filter */}
              <Select
                value={filters.complaint_type}
                onValueChange={(value) => setFilters(prev => ({ ...prev, complaint_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="نوع الشكوى" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">جميع الأنواع</SelectItem>
                  {COMPLAINT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="حالة الشكوى" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">جميع الحالات</SelectItem>
                  {COMPLAINT_STATUS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Add New Complaint Button */}
        <div className="mb-6 flex justify-end">
          <Button asChild>
            <Link to="/complain">
              <AlertTriangle className="h-4 w-4 mr-2" />
              تقديم شكوى جديدة
            </Link>
          </Button>
        </div>

        {/* Complaints List */}
        {isLoadingComplaints ? (
          <div className="text-center py-12">
            <div className="text-white">جاري تحميل الشكاوى...</div>
          </div>
        ) : complaints.length === 0 ? (
          <Card className="premium-card-gradient">
            <CardContent className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">لا توجد شكاوى</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {complaints.map((complaint) => (
              <Card key={complaint.id} className="premium-card-gradient">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={getStatusColor(complaint.status)}>
                          {complaint.status_display}
                        </Badge>
                        <Badge variant="outline">
                          {complaint.complaint_type_display}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-300 mb-2">
                        <span className="font-semibold">من:</span> {complaint.from_user.name} ({complaint.from_user.role})
                        <span className="mx-2">•</span>
                        <span className="font-semibold">ضد:</span> {complaint.to_user.name} ({complaint.to_user.role})
                      </div>
                      
                      <p className="text-white mb-3">{complaint.description}</p>
                      
                      <div className="text-xs text-gray-400">
                        تاريخ التقديم: {formatDate(complaint.created_at)}
                        {complaint.resolved_at && (
                          <span className="mr-4">
                            تاريخ الحل: {formatDate(complaint.resolved_at)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {complaint.related_chat && (
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/chat/${complaint.related_chat}`}>
                            <MessageSquare className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {complaint.admin_notes && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-semibold text-blue-800 mb-1">ملاحظات الإدارة:</p>
                      <p className="text-sm text-blue-700">{complaint.admin_notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
