import { useGlobalContext } from '@/Context/GlobalContext';
import { UserCircleIcon } from '@heroicons/react/24/outline';

export const LoginButton = () => {
  const { user, loading, error, logout } = useGlobalContext();

  if (loading) {
    return <div>Loading...</div>;
  }
  const signInWithGoogle = () => {
    
  }
  return (
    <div className="flex items-center gap-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {user ? (
        <div className="flex items-center gap-2">
          <UserCircleIcon className="h-6 w-6 text-gray-600" />
          <span className="text-sm">{user.displayName || user.email}</span>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      ) : (
        <button
          onClick={signInWithGoogle}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sign in with Google
        </button>
      )}
    </div>
  );
}; 