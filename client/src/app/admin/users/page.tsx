"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  Search,
  ShieldCheck,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { DashboardLayout, adminNavItems } from "@/components/layout/DashboardLayout";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "@/hooks/useUsers";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { container } from "@/infrastructure/container";
import { UserForm, type UserFormValues } from "./form";
import { Button } from "@/components/ui/button";
import { Can } from "@/components/auth/Can";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
  User,
  KycLevel,
  CreateUserData,
  UpdateUserData,
} from "@/types";

const ROLE_LABELS: Record<string, string> = {
  superadmin: "Super Admin",
  admin: "Administrador",
  seller_empresa: "Vendedor Empresa",
  seller_company: "Vendedor Empresa",
  seller_individual: "Vendedor Individual",
  seller: "Vendedor",
  buyer: "Comprador",
  support: "Soporte Operativo",
  finance: "Finanzas & Riesgo",
  SUPERADMIN: "Super Admin",
  ADMIN: "Administrador",
  SELLER: "Vendedor",
  BUYER: "Comprador",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Activa",
  activa: "Activa",
  pending: "Pendiente",
  pendiente: "Pendiente",
  pending_verification: "Pendiente Verificación",
  in_review: "En Revisión",
  en_revision: "En Revisión",
  restricted: "Restringida",
  restringida: "Restringida",
  suspended: "Suspendida",
  suspendida: "Suspendida",
  rejected: "Rechazada",
  rechazada: "Rechazada",
  logically_deleted: "Baja Lógica",
  eliminada_logicamente: "Baja Lógica",
  ACTIVE: "Activa",
  PENDING: "Pendiente",
  SUSPENDED: "Suspendida",
  BANNED: "Bloqueada",
};

export default function AdminUsersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);


  const {
    data: usersData,
    isLoading: usersLoading,
    isError: usersIsError,
    error: usersError,
  } = useUsers({
    page,
    limit,
    search: debouncedSearch,
    role: roleFilter as any,
    status: statusFilter as any,
  });

  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [userToChangeStatus, setUserToChangeStatus] = useState<User | null>(null);
  const [newStatusValue, setNewStatusValue] = useState<string>("suspendida");
  const [statusReason, setStatusReason] = useState<string>("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [userForAudit, setUserForAudit] = useState<User | null>(null);
  const [auditEvents, setAuditEvents] = useState<any[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
  };

  const handleCreateSubmit = async (values: UserFormValues) => {
    try {
      await createUserMutation.mutateAsync({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password!,
        phone: values.phone || null,
        role: values.role as any,
        status: values.status as any,
        kycLevel: values.kycLevel as KycLevel,
      });
      toast.success("Usuario creado exitosamente");
      setIsCreateOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Error al crear el usuario");
    }
  };

  const handleEditSubmit = async (values: UserFormValues) => {
    if (!editingUser) return;

    try {
      const payload: UpdateUserData = {
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone || null,
        role: values.role as any,
        status: values.status as any,
        kycLevel: values.kycLevel as KycLevel,
      };

      if (values.password && values.password.trim().length >= 8) {
        payload.password = values.password.trim();
      }

      await updateUserMutation.mutateAsync({
        id: editingUser.id,
        data: payload,
      });

      toast.success("Usuario actualizado correctamente");
      setEditingUser(null);
    } catch (err: any) {
      toast.error(err?.message || "Error al actualizar el usuario");
    }
  };

  const handleOpenStatusModal = (user: User) => {
    setUserToChangeStatus(user);
    const curr = (user.status || "").toLowerCase();
    setNewStatusValue(curr === "activa" || curr === "active" ? "suspendida" : "activa");
    setStatusReason("");
  };

  const handleConfirmStatusChange = async () => {
    if (!userToChangeStatus) return;
    if (!statusReason.trim() || statusReason.trim().length < 3) {
      toast.error("Debes especificar un motivo válido de al menos 3 caracteres.");
      return;
    }

    setIsUpdatingStatus(true);
    try {
      await container.users.updateUserStatus(
        userToChangeStatus.id,
        newStatusValue,
        statusReason.trim(),
      );
      toast.success(`Estado actualizado a ${STATUS_LABELS[newStatusValue] || newStatusValue}`);
      setUserToChangeStatus(null);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err: any) {
      toast.error(err?.message || "Error al cambiar el estado del usuario");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleOpenAudit = async (user: User) => {
    setUserForAudit(user);
    setAuditEvents([]);
    setAuditLoading(true);
    try {
      const res = await container.users.getUserAudit(user.id);
      setAuditEvents(res?.events ?? []);
    } catch {
      toast.error("No se pudo cargar la bitácora de seguridad.");
    } finally {
      setAuditLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      await deleteUserMutation.mutateAsync(userToDelete.id);
      toast.success("Usuario dado de baja lógicamente con éxito");
      setUserToDelete(null);
    } catch (err: any) {
      toast.error(err?.message || "Error al eliminar el usuario");
    }
  };

  const users = usersData?.items ?? [];
  const total = usersData?.total ?? 0;
  const totalPages = usersData?.totalPages ?? 1;

  return (
    <ProtectedRoute roles={["admin", "superadmin"]} redirectTo="/account/login?redirect=/admin/users">
      <DashboardLayout navItems={adminNavItems} title="Gestión de Usuarios">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6 min-w-0">
        {}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Usuarios del Marketplace
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Administra cuentas, roles, permisos y bitácora de seguridad ({total} usuarios registrados).
            </p>
          </div>
          <Can permission="usuario.crear">
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl shadow-sm w-full sm:w-auto"
            >
              <UserPlus className="h-4 w-4" />
              <span>Nuevo Usuario</span>
            </Button>
          </Can>
        </div>

        {}
        <section className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden min-w-0">
          {}
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between bg-card">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por nombre, email o teléfono..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 rounded-xl w-full"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-border bg-background px-3 py-2 text-xs sm:text-sm outline-none focus:border-primary"
              >
                <option value="ALL">Todos los Roles</option>
                <option value="superadmin">Super Admin</option>
                <option value="admin">Administrador</option>
                <option value="seller_empresa">Vendedor Empresa</option>
                <option value="seller_individual">Vendedor Individual</option>
                <option value="buyer">Comprador</option>
                <option value="support">Soporte</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-xl border border-border bg-background px-3 py-2 text-xs sm:text-sm outline-none focus:border-primary"
              >
                <option value="ALL">Todos los Estados</option>
                <option value="activa">Activa</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_revision">En Revisión</option>
                <option value="restringida">Restringida</option>
                <option value="suspendida">Suspendida</option>
                <option value="rechazada">Rechazada</option>
              </select>
            </div>
          </div>

          {}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs uppercase font-semibold text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 sm:px-6 sm:py-3.5">Usuario</th>
                  <th className="hidden sm:table-cell px-4 py-3 sm:px-6 sm:py-3.5">Contacto</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-3.5">Rol</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-3.5">Estado</th>
                  <th className="hidden md:table-cell px-4 py-3 sm:px-6 sm:py-3.5">Completitud</th>
                  <th className="hidden lg:table-cell px-4 py-3 sm:px-6 sm:py-3.5">Registro</th>
                  <th className="px-4 py-3 sm:px-6 sm:py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {usersLoading && !usersData ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 sm:px-6 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                        <span className="text-xs font-medium">Cargando usuarios...</span>
                      </div>
                    </td>
                  </tr>
                ) : usersIsError ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 sm:px-6 text-center text-red-500">
                      <p className="font-semibold text-sm">Error al cargar usuarios</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(usersError as any)?.message || "No se pudo conectar con el servidor."}
                      </p>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 sm:px-6 text-center text-muted-foreground">
                      No se encontraron usuarios con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const nameOrEmail =
                      u.fullName || [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email || "Usuario";
                    const initials =
                      `${u.firstName?.[0] || ""}${u.lastName?.[0] || ""}`.toUpperCase() ||
                      nameOrEmail[0]?.toUpperCase() ||
                      "U";
                    const roleKey = (u.role || "buyer").toLowerCase();
                    const statusKey = (u.status || "active").toLowerCase();
                    const isSuper = roleKey === "superadmin";

                    return (
                      <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3.5 sm:px-6 sm:py-4">
                          <div className="flex items-center gap-2.5 sm:gap-3">
                            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-xs">
                              {initials}
                            </div>
                            <div className="min-w-0 max-w-[140px] sm:max-w-xs">
                              <p className="font-semibold text-foreground truncate">{nameOrEmail}</p>
                              <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="hidden sm:table-cell px-4 py-3.5 sm:px-6 sm:py-4 text-xs text-muted-foreground">
                          {u.phone || "—"}
                        </td>

                        <td className="px-4 py-3.5 sm:px-6 sm:py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2 sm:px-2.5 py-0.5 text-[11px] sm:text-xs font-semibold ${
                              roleKey.includes("admin")
                                ? "bg-purple-100 text-purple-800"
                                : roleKey.includes("seller")
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {ROLE_LABELS[roleKey] || u.role}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 sm:px-6 sm:py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 sm:px-2.5 py-0.5 text-[11px] sm:text-xs font-semibold ${
                              statusKey === "activa" || statusKey === "active"
                                ? "bg-emerald-100 text-emerald-800"
                                : statusKey === "suspendida" || statusKey === "suspended"
                                ? "bg-orange-100 text-orange-800"
                                : statusKey === "restringida" || statusKey === "restricted"
                                ? "bg-yellow-100 text-yellow-800"
                                : statusKey === "pendiente" || statusKey === "pending" || statusKey === "pending_verification"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-slate-100 text-slate-800"
                            }`}
                          >
                            {(statusKey === "activa" || statusKey === "active") && (
                              <CheckCircle className="h-3 w-3 text-emerald-600" />
                            )}
                            {(statusKey === "suspendida" || statusKey === "suspended") && (
                              <AlertTriangle className="h-3 w-3 text-orange-600" />
                            )}
                            <span>{STATUS_LABELS[statusKey] || u.status}</span>
                          </span>
                        </td>

                        <td className="hidden md:table-cell px-4 py-3.5 sm:px-6 sm:py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${u.completionPct ?? 40}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground font-semibold">
                              {u.completionPct ?? 40}%
                            </span>
                          </div>
                        </td>

                        <td className="hidden lg:table-cell px-4 py-3.5 sm:px-6 sm:py-4 text-xs text-muted-foreground">
                          {new Date(u.createdAt).toLocaleDateString("es-AR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>

                        <td className="px-4 py-3.5 sm:px-6 sm:py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl">
                              <DropdownMenuLabel className="text-xs">Acciones</DropdownMenuLabel>
                              <Can permission="usuario.editar">
                                <DropdownMenuItem
                                  onClick={() => handleOpenEdit(u)}
                                  className="cursor-pointer gap-2"
                                >
                                  <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span>Editar datos</span>
                                </DropdownMenuItem>

                                {!isSuper && (
                                  <DropdownMenuItem
                                    onClick={() => handleOpenStatusModal(u)}
                                    className="cursor-pointer gap-2"
                                  >
                                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                    <span>Cambiar estado</span>
                                  </DropdownMenuItem>
                                )}
                              </Can>

                              <Can permission="auditoria.ver">
                                <DropdownMenuItem
                                  onClick={() => handleOpenAudit(u)}
                                  className="cursor-pointer gap-2"
                                >
                                  <ShieldAlert className="h-3.5 w-3.5 text-blue-500" />
                                  <span>Auditoría de seguridad</span>
                                </DropdownMenuItem>
                              </Can>

                              {!isSuper && (
                                <Can permission="usuario.eliminar">
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => setUserToDelete(u)}
                                    className="cursor-pointer gap-2 text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span>Baja lógica</span>
                                  </DropdownMenuItem>
                                </Can>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border px-4 py-3.5 sm:px-6 bg-muted/20">
            <div className="flex flex-wrap items-center justify-between sm:justify-start gap-4 text-xs text-muted-foreground">
              <p>
                Mostrando{" "}
                <span className="font-semibold text-foreground">
                  {total === 0 ? 0 : (page - 1) * limit + 1}
                </span>{" "}
                a{" "}
                <span className="font-semibold text-foreground">
                  {Math.min(page * limit, total)}
                </span>{" "}
                de <span className="font-semibold text-foreground">{total}</span> usuarios
              </p>

              <div className="flex items-center gap-1.5">
                <span>Filas por página:</span>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-semibold outline-none focus:border-primary cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 self-center sm:self-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg h-8 px-2.5 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                Anterior
              </Button>
              <span className="px-2 text-xs font-semibold text-foreground">
                {page} / {Math.max(1, totalPages)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-lg h-8 px-2.5 text-xs"
              >
                Siguiente
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </section>
      </div>

      {}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="w-[95vw] sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Completa los datos para registrar un usuario administrativo o del marketplace.
            </DialogDescription>
          </DialogHeader>

          <UserForm
            onSubmit={handleCreateSubmit}
            onCancel={() => setIsCreateOpen(false)}
            isSubmitting={createUserMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={Boolean(editingUser)} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="w-[95vw] sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica la información, rol o estado de {editingUser?.fullName}.
            </DialogDescription>
          </DialogHeader>

          {editingUser && (
            <UserForm
              key={editingUser.id}
              initialData={editingUser}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditingUser(null)}
              isSubmitting={updateUserMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {}
      <Dialog
        open={Boolean(userToChangeStatus)}
        onOpenChange={(open) => !open && setUserToChangeStatus(null)}
      >
        <DialogContent className="w-[95vw] sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Cambiar Estado de Cuenta
            </DialogTitle>
            <DialogDescription>
              Modificando estado de{" "}
              <strong className="text-foreground">{userToChangeStatus?.fullName}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase">Nuevo Estado</label>
              <select
                value={newStatusValue}
                onChange={(e) => setNewStatusValue(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="activa">Activa</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_revision">En Revisión</option>
                <option value="restringida">Restringida</option>
                <option value="suspendida">Suspendida</option>
                <option value="rechazada">Rechazada</option>
                <option value="eliminada_logicamente">Baja Lógica</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase">
                Motivo del cambio * (Requerido para auditoría)
              </label>
              <textarea
                value={statusReason}
                onChange={(e) => setStatusReason(e.target.value)}
                placeholder="Indica el motivo o justificación técnica/legal..."
                rows={3}
                required
                className="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setUserToChangeStatus(null)}
              disabled={isUpdatingStatus}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmStatusChange}
              disabled={isUpdatingStatus}
              className="rounded-xl font-bold"
            >
              {isUpdatingStatus ? "Aplicando..." : "Confirmar Estado"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {}
      <Dialog open={Boolean(userForAudit)} onOpenChange={(open) => !open && setUserForAudit(null)}>
        <DialogContent className="w-[95vw] sm:max-w-2xl rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Bitácora de Seguridad Forense
            </DialogTitle>
            <DialogDescription>
              Eventos registrados para{" "}
              <strong className="text-foreground">{userForAudit?.fullName}</strong> ({userForAudit?.email}).
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-3">
            {auditLoading ? (
              <div className="py-8 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <span className="text-xs">Cargando eventos de seguridad...</span>
              </div>
            ) : auditEvents.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground bg-muted/20 rounded-xl">
                No hay eventos de seguridad registrados para este usuario.
              </div>
            ) : (
              <div className="divide-y divide-border border rounded-2xl overflow-hidden">
                {auditEvents.map((evt, idx) => (
                  <div key={evt.id || idx} className="p-3.5 text-xs space-y-1 hover:bg-muted/30">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            evt.severity === "critical"
                              ? "bg-red-500"
                              : evt.severity === "warning"
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                        />
                        {evt.eventType}
                      </span>
                      <span className="text-muted-foreground text-[11px] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(evt.createdAt).toLocaleString("es-AR")}
                      </span>
                    </div>

                    <div className="text-muted-foreground flex items-center gap-3 text-[11px]">
                      <span>IP: {evt.ip || "127.0.0.1"}</span>
                      {evt.severity && (
                        <span className="uppercase font-semibold text-[10px]">
                          Severidad: {evt.severity}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setUserForAudit(null)} className="rounded-xl">
              Cerrar Bitácora
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {}
      <AlertDialog
        open={Boolean(userToDelete)}
        onOpenChange={(open) => !open && setUserToDelete(null)}
      >
        <AlertDialogContent className="w-[95vw] sm:max-w-lg rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <ShieldAlert className="h-5 w-5" />
              ¿Confirmar baja lógica del usuario?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de dar de baja lógica a{" "}
              <strong className="text-foreground">{userToDelete?.fullName}</strong> ({userToDelete?.email}).
              El usuario será marcado con `deleted_at` y sus sesiones quedarán inmediatamente revocadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
            >
              Confirmar Baja Lógica
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  </ProtectedRoute>
);
}
