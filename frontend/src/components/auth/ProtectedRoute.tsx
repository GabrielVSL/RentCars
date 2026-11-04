import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('CLIENTE' | 'EMPRESA' | 'BANCO')[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, token } = useAuthStore();
  const setAuthView = useUIStore((state) => state.setAuthView);

  if (!token || !user) {
    // Abre o modal de login automaticamente e redireciona para a Home
    setTimeout(() => setAuthView('login'), 100);
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role as any)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
