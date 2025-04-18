import { useRouter } from 'next/router';
import { useGlobalContext } from '../../Context/GlobalContext';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useGlobalContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && !user.email?.endsWith('.edu')) {
      router.push('/login?error=edu-email-required');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || !user.email?.endsWith('.edu')) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 