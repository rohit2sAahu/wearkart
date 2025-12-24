import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

interface SellerRouteProps {
  children: React.ReactNode;
}

export function SellerRoute({ children }: SellerRouteProps) {
  const { user, isSeller, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth?type=seller" replace />;
  }

  if (!isSeller) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}