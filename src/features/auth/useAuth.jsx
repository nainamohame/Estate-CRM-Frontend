import { createContext, useContext, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { api, setUnauthorizedHandler } from '../../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me').then((r) => r.data),
    retry: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    setUnauthorizedHandler(() => {
      queryClient.setQueryData(['me'], null);
    });
  }, [queryClient]);

  const loginMutation = useMutation({
    mutationFn: ({ email, password }) => api.post('/auth/login', { email, password }).then((r) => r.data),
    onSuccess: (user) => queryClient.setQueryData(['me'], user),
  });

  const logout = async () => {
    await api.post('/auth/logout').catch(() => {});
    queryClient.clear();
  };

  const value = {
    user: meQuery.data ?? null,
    isLoading: meQuery.isLoading,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
