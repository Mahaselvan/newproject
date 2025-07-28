import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  totalXP: number;
  level: number;
  streak: number;
}

export function useAuth() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/user/profile'],
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    enabled: !!localStorage.getItem('token'),
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      try {
        const response = await apiRequest('GET', '/api/user/profile');
        return await response.json();
      } catch (error) {
        if (error instanceof Error && error.message.includes('401')) {
          localStorage.removeItem('token');
          return null;
        }
        throw error;
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/login', credentials);
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      queryClient.setQueryData(['/api/user/profile'], { user: data.user });
      toast({
        title: "Welcome back!",
        description: "Successfully logged in.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await apiRequest('POST', '/api/auth/register', userData);
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      queryClient.setQueryData(['/api/user/profile'], { user: data.user });
      toast({
        title: "Welcome to IntelliLearn!",
        description: "Account created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const logout = () => {
    localStorage.removeItem('token');
    queryClient.setQueryData(['/api/user/profile'], null);
    queryClient.clear();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return {
    user: user?.user,
    isLoading,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isLoginPending: loginMutation.isPending,
    isRegisterPending: registerMutation.isPending,
  };
}
