import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/contants/api";
import { Badge } from "@/components/ui/badge";
import { Laptop, Smartphone, Monitor } from "lucide-react";

interface SessionData {
  _id: string;
  userId: string;
  token: string;
  clientId: string;
  deviceInfo: {
    userAgent: string;
    ip: string;
    browser: string;
    os: string;
    deviceName: string;
  };
  isActive: boolean;
  isCurrentDevice: boolean;
  lastActive: string;
  expiresAt: string;
  createdAt: string;
  logoutAt?: string | null;
  logoutReason?: string | null;
}

interface UserSessionResponse {
  isOnline: boolean;
  activeSessionRedis: SessionData | null;
  sessionHistory: SessionData[];
}

interface UserSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  userName: string;
  externalSessionData?: UserSessionResponse | null; 
}

export default function UserSessionModal({ isOpen, onClose, userId, userName, externalSessionData }: UserSessionModalProps) {
  const [userSession, setUserSession] = useState<UserSessionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
        if (externalSessionData) {
            setUserSession(externalSessionData);
            setLoading(false);
        } else if (userId) {
            fetchSession();
        } else {
            setUserSession(null);
        }
    } else {
        setUserSession(null);
        setError(null);
    }
  }, [isOpen, userId, externalSessionData]);




  const fetchSession = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/customers/${userId}/session`);
      const data = await res.json();
      
      if (res.ok) {
        setUserSession(data.data);
      } else {
        setError("Không thể tải thông tin phiên đăng nhập.");
      }
    } catch (err) {
      setError("Lỗi kết nối đến server.");
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (sessionData?: SessionData | null) => {
      if (!sessionData?.deviceInfo) return <Monitor className="h-5 w-5" />;
      
      const { os, deviceName } = sessionData.deviceInfo;
      if (os?.toLowerCase().includes("ios") || os?.toLowerCase().includes("android") || deviceName?.includes("iPhone")) {
          return <Smartphone className="h-5 w-5" />;
      }
      return <Laptop className="h-5 w-5" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Phiên đăng nhập: {userName}</DialogTitle>
        </DialogHeader>
        
        {loading ? (
             <div className="flex justify-center p-6">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
             </div>
        ) : error ? (
            <div className="p-4 text-center text-muted-foreground">
                {error}
            </div>
        ) : !userSession || userSession.sessionHistory.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground bg-gray-50 rounded-lg">
                Người dùng này chưa có phiên đăng nhập nào.
            </div>
        ) : (
            <div className="space-y-4">
                 {/* Trạng thái hiện tại */}
                 <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                    <span className="font-medium text-sm">Trạng thái hiện tại:</span>
                    <Badge variant={userSession.isOnline ? "default" : "secondary"} className={userSession.isOnline ? "bg-green-500 hover:bg-green-600" : ""}>
                        {userSession.isOnline ? "Đang online" : "Offline"}
                    </Badge>
                 </div>

                 <h4 className="text-sm font-semibold text-muted-foreground mt-4 mb-2 uppercase">Lịch sử đăng nhập</h4>

                 <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {userSession.sessionHistory.map((s) => (
                      <div key={s._id} className="flex flex-col space-y-2 p-3 border rounded-lg">
                          <div className="flex items-start space-x-3">
                              <div className="p-2 bg-gray-100 rounded-full border">
                                  {getDeviceIcon(s)}
                              </div>
                              <div className="flex-1 space-y-1">
                                  <div className="flex items-center justify-between">
                                     <p className="font-medium text-sm">{s.deviceInfo.browser} trên {s.deviceInfo.os}</p>
                                     {s.isActive && <Badge variant="outline" className="text-xs">Đang gắn token</Badge>}
                                  </div>
                                  <p className="text-xs text-muted-foreground">IP: {s.deviceInfo.ip} • Device: {s.deviceInfo.deviceName}</p>
                              </div>
                          </div>
          
                          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t mt-2">
                              <div>
                                  <p className="text-muted-foreground">Đăng nhập</p>
                                  <p className="font-medium">
                                      {format(new Date(s.createdAt), "HH:mm dd/MM/yyyy", { locale: vi })}
                                  </p>
                              </div>
                              <div>
                                  <p className="text-muted-foreground">Hoạt động cuối</p>
                                  <p className="font-medium">
                                      {format(new Date(s.lastActive), "HH:mm dd/MM/yyyy", { locale: vi })}
                                  </p>
                              </div>
                               {s.logoutAt && (
                                   <div className="col-span-2 mt-1 bg-red-50 p-1.5 rounded text-red-700">
                                       <span className="font-medium">Đã đăng xuất: </span> 
                                       {format(new Date(s.logoutAt), "HH:mm dd/MM/yyyy", { locale: vi })}
                                       {s.logoutReason && <span className="text-muted-foreground"> ({s.logoutReason})</span>}
                                   </div>
                               )}
                          </div>
                      </div>
                    ))}
                 </div>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
