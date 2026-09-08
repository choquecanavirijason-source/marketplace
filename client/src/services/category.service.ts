import type { ICategory, ICategoryRequest } from "@/types/category.types";
import type { IPaginatedResponse, IPaginationRequest } from "@/types/pagination";
import type { IApiResponse } from "@/types/api";
import { apiRequest } from "@/config/axios";

const getPaginated = async (params: IPaginationRequest): Promise<IPaginatedResponse<ICategory>> => {
  const query = new URLSearchParams({
    page: String(params.page || 1),
    limit: String(params.limit || params.per_page || 10),
  });
  if (params.search) query.set("search", params.search);

  const payload = await apiRequest<IPaginatedResponse<ICategory>>(`/admin/categories?${query.toString()}`, {
    auth: true,
  });

  const data = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray((payload as any)?.data?.items)
    ? (payload as any).data.items
    : [];

  const pagination = payload?.pagination ?? {
    page: Number(params.page || 1),
    limit: Number(params.limit || params.per_page || 10),
    total: data.length,
    totalPages: Math.max(1, Math.ceil(data.length / (params.limit || params.per_page || 10))),
  };

  return {
    success: payload?.success ?? true,
    data,
    pagination,
    meta: payload?.meta,
  };
};

const create = async (request: ICategoryRequest): Promise<IApiResponse<ICategory>> => {
  const payload = await apiRequest<IApiResponse<ICategory>>("/admin/categories", {
    method: "POST",
    auth: true,
    body: request,
  });
  return payload;
};

const update = async (id: number, request: ICategoryRequest): Promise<IApiResponse<ICategory>> => {
  const payload = await apiRequest<IApiResponse<ICategory>>(`/admin/categories/${id}`, {
    method: "PUT",
    auth: true,
    body: request,
  });
  return payload;
};

const remove = async (id: number): Promise<IApiResponse<void>> => {
  const payload = await apiRequest<IApiResponse<void>>(`/admin/categories/${id}`, {
    method: "DELETE",
    auth: true,
  });
  return payload;
};

const list = async (): Promise<ICategory[]> => {
  const res = await apiRequest<any>("/categories");
  const items = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : (res?.data?.items ?? []);
  return items;
};

const getBySlug = async (slug: string): Promise<ICategory> => {
  const res = await apiRequest<any>(`/categories/${slug}`);
  return res?.data || res;
};

export const CategoryService = {
  getPaginated,
  create,
  update,
  remove,
  list,
  getBySlug,
};

export const categoryService = CategoryService;
