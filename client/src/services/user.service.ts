import type {
  User,
  UserFilters,
  PaginatedUsers,
  CreateUserData,
  UpdateUserData,
  UserAuditEvent,
} from "@/types";
import { apiRequest } from "@/config/axios";

const mapUser = (u: any): User => {
  const firstName = u.firstName || u.profile?.firstName || "";
  const lastName = u.lastName || u.profile?.lastName || "";
  const fullName =
    u.fullName ||
    (firstName && lastName ? `${firstName} ${lastName}`.trim() : firstName || u.name || u.email);

  const role = (u.role || u.type || (Array.isArray(u.roles) && u.roles[0]) || "buyer").toLowerCase();
  const status = (u.status || "active").toLowerCase();

  return {
    ...u,
    id: String(u.id),
    email: u.email || "",
    phone: u.phone || u.mobile_number || u.mobileNumber || null,
    firstName,
    lastName,
    fullName,
    avatarUrl: u.avatarUrl || u.profile?.avatarUrl || null,
    role,
    roles: Array.isArray(u.roles) ? u.roles : [role],
    type: u.type || role,
    status,
    country: u.country || u.profile?.country || null,
    phoneCountry: u.phoneCountry || u.profile?.phoneCountry || null,
    kycLevel: typeof u.kycLevel === "number" ? u.kycLevel : (u.kyc_level ?? 0),
    emailVerified: Boolean(u.emailVerified ?? u.emailVerifiedAt ?? u.email_verified),
    phoneVerified: Boolean(u.phoneVerified ?? u.phoneVerifiedAt ?? u.phone_verified),
    completionPct: typeof u.completionPct === "number" ? u.completionPct : (u.profile?.completionPct ?? 20),
    createdAt: typeof u.createdAt === "string" ? u.createdAt : (u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString()),
    updatedAt: typeof u.updatedAt === "string" ? u.updatedAt : (u.updatedAt ? new Date(u.updatedAt).toISOString() : new Date().toISOString()),
  };
};

export class UserService {
  async getUsers(filters: UserFilters = {}, signal?: AbortSignal): Promise<PaginatedUsers> {
    const params: Record<string, any> = {};
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;
    if (filters.search && filters.search.trim().length > 0) {
      params.search = filters.search.trim();
    }
    if (filters.role && filters.role !== "ALL") {
      params.role = filters.role;
    }
    if (filters.status && filters.status !== "ALL") {
      params.status = filters.status;
    }
    if (filters.sortBy) {
      params.sortBy = filters.sortBy;
    }
    if (filters.sortOrder) {
      params.sortOrder = filters.sortOrder;
    }

    const raw = await apiRequest<any>("/admin/users", {
      params,
      auth: true,
      signal,
    });

    const payload = raw?.data?.items
      ? raw.data
      : raw?.items
      ? raw
      : Array.isArray(raw?.data)
      ? { items: raw.data, total: raw.data.length }
      : Array.isArray(raw)
      ? { items: raw, total: raw.length }
      : { items: [] };

    const rawList: any[] = Array.isArray(payload.items) ? payload.items : [];
    const items: User[] = rawList.map(mapUser);

    const total: number =
      typeof payload?.total === "number"
        ? payload.total
        : typeof raw?.total === "number"
        ? raw.total
        : typeof raw?.meta?.total === "number"
        ? raw.meta.total
        : items.length;

    const page: number =
      typeof payload?.page === "number"
        ? payload.page
        : typeof raw?.page === "number"
        ? raw.page
        : (filters.page ?? 1);

    const limit: number =
      typeof payload?.limit === "number"
        ? payload.limit
        : typeof raw?.limit === "number"
        ? raw.limit
        : (filters.limit ?? 10);

    const totalPages: number =
      typeof payload?.totalPages === "number"
        ? payload.totalPages
        : typeof raw?.totalPages === "number"
        ? raw.totalPages
        : Math.max(1, Math.ceil(total / Math.max(1, limit)));

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      currentPage: page,
      lastPage: totalPages,
    };
  }

  async getUserById(id: string): Promise<User> {
    const raw = await apiRequest<any>(`/admin/users/${id}`, { auth: true });
    return mapUser(raw?.data ?? raw);
  }

  async createUser(data: CreateUserData): Promise<User> {
    const raw = await apiRequest<any>("/admin/users", {
      method: "POST",
      body: data,
      auth: true,
    });
    return mapUser(raw?.data ?? raw);
  }

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    const raw = await apiRequest<any>(`/admin/users/${id}`, {
      method: "PATCH",
      body: data,
      auth: true,
    });
    return mapUser(raw?.data ?? raw);
  }

  async updateUserStatus(id: string, status: string, reason: string): Promise<any> {
    const raw = await apiRequest<any>(`/admin/users/${id}/status`, {
      method: "PATCH",
      body: { status: status.toLowerCase(), reason },
      auth: true,
    });
    return raw?.data ?? raw;
  }

  async updateUserRoles(id: string, roles: string[]): Promise<any> {
    const raw = await apiRequest<any>(`/admin/users/${id}/roles`, {
      method: "PATCH",
      body: { roles },
      auth: true,
    });
    return raw?.data ?? raw;
  }

  async getUserAudit(id: string): Promise<{ userId: string; userEmail: string; events: UserAuditEvent[] }> {
    const raw = await apiRequest<any>(`/admin/users/${id}/audit`, { auth: true });
    return raw?.data ?? raw;
  }

  async deleteUser(id: string): Promise<void> {
    await apiRequest(`/admin/users/${id}`, {
      method: "DELETE",
      auth: true,
    });
  }

  async uploadAvatar(imageDataUrl: string): Promise<{ avatarUrl: string }> {
    const raw = await apiRequest<any>("/identity/avatar", {
      method: "POST",
      auth: true,
      body: {
        image: imageDataUrl,
      },
    });
    return raw?.data ?? raw;
  }
}

export const userService = new UserService();
