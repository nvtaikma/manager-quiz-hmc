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
}

interface UserSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  userName: string;
  externalSessionData?: SessionData | null; // Add this prop
}

export default function UserSessionModal({ isOpen, onClose, userId, userName, externalSessionData }: UserSessionModalProps) {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
        if (externalSessionData) {
            setSession(externalSessionData);
            setLoading(false);
        } else if (userId) {
            fetchSession();
        } else {
            setSession(null);
        }
    } else {
        setSession(null);
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
        setSession(data.data);
      } else {
        setError("Không thể tải thông tin phiên đăng nhập.");
      }
    } catch (err) {
      setError("Lỗi kết nối đến server.");
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (deviceType?: string) => {
      // Simple heuristic based on device name or OS
      // backend returns deviceName e.g. "iPhone", "Macintosh"
      if (!session?.deviceInfo) return <Monitor className="h-5 w-5" />;
      
      const { os, deviceName } = session.deviceInfo;
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
        ) : !session ? (
            <div className="p-6 text-center text-muted-foreground bg-gray-50 rounded-lg">
                Người dùng này chưa có phiên đăng nhập nào đang hoạt động.
            </div>
        ) : (
            <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 border rounded-lg bg-gray-50">
                    <div className="p-2 bg-white rounded-full border shadow-sm">
                        {getDeviceIcon()}
                    </div>
                    <div className="flex-1 space-y-1">
                        <p className="font-medium text-sm">{session.deviceInfo.browser} trên {session.deviceInfo.os}</p>
                        <p className="text-xs text-muted-foreground">IP: {session.deviceInfo.ip}</p>
                    </div>
                     <Badge variant={session.isActive ? "default" : "secondary"}>
                        {session.isActive ? "Đang online" : "Offline"}
                     </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground text-xs uppercase tracking-wider">Hoạt động cuối</p>
                        <p className="font-medium">
                            {format(new Date(session.lastActive), "HH:mm dd/MM/yyyy", { locale: vi })}
                        </p>
                    </div>
                     <div>
                        <p className="text-muted-foreground text-xs uppercase tracking-wider">Hết hạn</p>
                        <p className="font-medium">
                            {format(new Date(session.expiresAt), "HH:mm dd/MM/yyyy", { locale: vi })}
                        </p>
                    </div>
                </div>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
