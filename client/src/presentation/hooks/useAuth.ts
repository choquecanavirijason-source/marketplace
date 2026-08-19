"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { container } from "@/infrastructure/container";
import { getAuthToken, getCurrentUser } from "@/shared/lib/marketplaceStorage";
import { mergeCartWithServer, resetCartSync } from "@/infrastructure/cartSync";
import type { LoginCredentials, RegisterData, UpdateProfileData } from "@/domain/repositories/AuthRepository";

export function useAuth() {
  const queryClient = useQueryClient();

  const session = useQuery({
    queryKey: ["session"],
    queryFn: () => container.getSession.execute(),
    enabled: Boolean(getAuthToken()),
    retry: false,
  });

  const login = useMutation({
    mutationFn: (credentials: LoginCredentials) => container.login.execute(credentials),
    onSuccess: () => {
      queryClient.setQueryData(["session"], undefined);
      queryClient.invalidateQueries({ queryKey: ["session"] });
      void mergeCartWithServer();
    },
  });

  const register = useMutation({
    mutationFn: (data: RegisterData) => container.register.execute(data),
    onSuccess: () => {
      queryClient.setQueryData(["session"], undefined);
      queryClient.invalidateQueries({ queryKey: ["session"] });
      void mergeCartWithServer();
    },
  });

  const updateProfile = useMutation({
    mutationFn: (data: UpdateProfileData) => container.updateProfile.execute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });

  const logout = useMutation({
    mutationFn: () => container.logout.execute(),
    onSuccess: () => {
      resetCartSync();
      queryClient.clear();
    },
  });

  return {
    user: getCurrentUser(),
    token: getAuthToken(),
    isLoading: session.isLoading,
    login: login.mutateAsync,
    isLoggingIn: login.isPending,
    register: register.mutateAsync,
    isRegistering: register.isPending,
    updateProfile: updateProfile.mutateAsync,
    isUpdatingProfile: updateProfile.isPending,
    logout: logout.mutateAsync,
    isLoggingOut: logout.isPending,
  };
}