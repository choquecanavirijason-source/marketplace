"use client";

import { useQuery, useMutation, useQueryClient, QueryKey } from "@tanstack/react-query";
import { useCallback, useState } from "react";

export interface ApiQueryOptions<T> {
  enabled?: boolean;
  initialData?: T;
  staleTime?: number;
}

export interface ApiMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
  onError?: (error: unknown, variables: TVariables) => void;
  invalidateQueries?: QueryKey[];
}

export const useApiQuery = <T>(
  queryKey: QueryKey,
  queryFn: (context: { signal?: AbortSignal }) => Promise<T>,
  options: ApiQueryOptions<T> = {},
) => {
  const query = useQuery<T>({
    queryKey,
    queryFn: ({ signal }) => queryFn({ signal }),
    enabled: options.enabled,
    initialData: options.initialData,
    staleTime: options.staleTime,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useApiMutation = <TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: ApiMutationOptions<TData, TVariables> = {},
) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<TData, unknown, TVariables>({
    mutationFn,
    onSuccess: async (data, variables) => {
      if (options.invalidateQueries) {
        for (const key of options.invalidateQueries) {
          await queryClient.invalidateQueries({ queryKey: key });
        }
      }
      if (options.onSuccess) {
        await options.onSuccess(data, variables);
      }
    },
    onError: (err, variables) => {
      if (options.onError) {
        options.onError(err, variables);
      }
    },
  });

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    reset: mutation.reset,
  };
};

export const useApiCall = <TArgs extends unknown[], TResult>(
  asyncFn: (...args: TArgs) => Promise<TResult>,
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [data, setData] = useState<TResult | null>(null);

  const execute = useCallback(
    async (...args: TArgs): Promise<TResult> => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await asyncFn(...args);
        setData(result);
        return result;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [asyncFn],
  );

  return {
    execute,
    isLoading,
    error,
    data,
  };
};
