import { useAuth as useAuthContext } from '../components/auth/AuthProvider';

// Re-export the useAuth hook for convenience
export const useAuth = useAuthContext;

export default useAuth;