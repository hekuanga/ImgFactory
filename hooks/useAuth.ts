import { useAuth as useAuthContext } from '../contexts/AuthContext';

// 重新导出 useAuth，方便使用
export { useAuthContext as useAuth };

/**
 * Hook to check if user is authenticated
 * @returns {boolean} true if user is logged in, false otherwise
 */
export const useIsAuthenticated = () => {
  const { user, loading } = useAuthContext();
  return { isAuthenticated: !!user, loading };
};

/**
 * Hook to get current user
 * @returns {User | null} current user or null
 */
export const useCurrentUser = () => {
  const { user } = useAuthContext();
  return user;
};

/**
 * Hook to get current session
 * @returns {Session | null} current session or null
 */
export const useCurrentSession = () => {
  const { session } = useAuthContext();
  return session;
};

// 默认导出 useAuth
export default useAuthContext;

