import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Search, Users, Trash2, Phone, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  created_at: string;
  last_login: string | null;
  city?: string;
}

export default function AdminUsers() {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  // Redirect if not admin
  if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
    return <Navigate to="/login" replace />;
  }

  // Load users
  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8001/api/users/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      // Handle paginated response
      const usersData = data.results || data;
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error("Failed to load users:", error);
      toast.error("فشل في تحميل المستخدمين");
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Delete user
  const deleteUser = async (userId: number, userName: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://localhost:8001/api/users/${userId}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Remove user from local state
      setUsers(users.filter(u => u.id !== userId));
      toast.success(`تم حذف المستخدم ${userName} بنجاح`);
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("فشل في حذف المستخدم");
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadUsers();
    }
  }, [isAuthenticated, user]);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone.includes(searchTerm) ||
        u.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchTerm]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'plumber': return 'bg-blue-100 text-blue-800';
      case 'client': return 'bg-green-100 text-green-800';
      case 'user': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-900" dir="rtl">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 rounded-full p-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">إدارة المستخدمين</h1>
          <p className="text-gray-300">
            عرض وإدارة جميع المستخدمين في النظام
          </p>
        </div>

        {/* Search */}
        <Card className="premium-card-gradient mb-6">
          <CardHeader>
            <CardTitle className="text-end flex items-center gap-2">
              <Search className="h-5 w-5" />
              البحث في المستخدمين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="البحث بالاسم، البريد الإلكتروني، الهاتف، أو الدور..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="premium-card-gradient">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">{users.length}</div>
              <div className="text-gray-300 text-sm">إجمالي المستخدمين</div>
            </CardContent>
          </Card>
          <Card className="premium-card-gradient">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{users.filter(u => u.role === 'plumber').length}</div>
              <div className="text-gray-300 text-sm">الفنيين</div>
            </CardContent>
          </Card>
          <Card className="premium-card-gradient">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{users.filter(u => u.role === 'client' || u.role === 'user').length}</div>
              <div className="text-gray-300 text-sm">العملاء</div>
            </CardContent>
          </Card>
          <Card className="premium-card-gradient">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-400">{users.filter(u => u.role === 'admin').length}</div>
              <div className="text-gray-300 text-sm">المدراء</div>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        {isLoadingUsers ? (
          <div className="text-center py-12">
            <div className="text-white">جاري تحميل المستخدمين...</div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <Card className="premium-card-gradient">
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">
                {searchTerm ? "لا توجد نتائج للبحث" : "لا توجد مستخدمين"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((listUser) => (
              <Card key={listUser.id} className="premium-card-gradient">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-white">{listUser.name}</h3>
                        <Badge className={getRoleColor(listUser.role)}>
                          {listUser.role === 'admin' ? 'مدير' :
                           listUser.role === 'plumber' ? 'فني صحي' : 'عميل'}
                        </Badge>
                        <Badge className={getStatusColor(listUser.status)}>
                          {listUser.status === 'active' ? 'نشط' :
                           listUser.status === 'inactive' ? 'غير نشط' : 'معلق'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{listUser.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{listUser.phone}</span>
                        </div>
                        {listUser.city && (
                          <div className="flex items-center gap-2">
                            <span>📍</span>
                            <span>{listUser.city}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span>📅</span>
                          <span>انضم في: {formatDate(listUser.created_at)}</span>
                        </div>
                      </div>

                      {listUser.last_login && (
                        <div className="mt-2 text-xs text-gray-400">
                          آخر دخول: {formatDate(listUser.last_login)}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Prevent admin from deleting themselves */}
                      {listUser.id.toString() !== user?.id?.toString() && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                              <AlertDialogDescription>
                                هل أنت متأكد من حذف المستخدم "{listUser.name}"؟
                                هذا الإجراء لا يمكن التراجع عنه.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteUser(listUser.id, listUser.name)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                حذف
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
