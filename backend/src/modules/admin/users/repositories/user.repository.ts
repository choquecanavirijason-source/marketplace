import { Injectable } from '@nestjs/common';
import { eq, sql, and, or, ilike, desc, asc, isNull, inArray } from 'drizzle-orm';
import { UserRepositoryPort, UserListFilters, AddressInput } from '../interfaces/user-repository.interface';
import {
  UserEntity,
  UserProfileProps,
  BusinessProfileProps,
  SellerProfileProps,
  AddressProps,
  OnboardingStateProps,
} from '../entities/user.entity';
import { DrizzleService } from '../../../../infrastructure/database/drizzle.service';
import {
  usersTable,
  userProfilesTable,
  businessProfilesTable,
  sellerProfilesTable,
  rolesTable,
  userRolesTable,
  addressesTable,
  onboardingStatesTable,
} from '../../../../infrastructure/database/schema';
import { UserRole, UserType, UserStatus, getPermissionsForRole } from '../../../../shared';

@Injectable()
export class UserRepository implements UserRepositoryPort {
  constructor(private readonly drizzle: DrizzleService) {}

  private async hydrateUser(userRow: typeof usersTable.$inferSelect): Promise<UserEntity> {
    const userId = userRow.id;

    const [profileRows, businessRows, sellerRows, userRoleRows, addressRows, onboardingRows] =
      await Promise.all([
        this.drizzle.db
          .select()
          .from(userProfilesTable)
          .where(eq(userProfilesTable.userId, userId))
          .limit(1)
          .catch(() => []),
        this.drizzle.db
          .select()
          .from(businessProfilesTable)
          .where(eq(businessProfilesTable.userId, userId))
          .limit(1)
          .catch(() => []),
        this.drizzle.db
          .select()
          .from(sellerProfilesTable)
          .where(eq(sellerProfilesTable.userId, userId))
          .limit(1)
          .catch(() => []),
        this.drizzle.db
          .select({
            roleCodename: rolesTable.codename,
            roleName: rolesTable.codename,
          })
          .from(userRolesTable)
          .innerJoin(rolesTable, eq(userRolesTable.roleId, rolesTable.id))
          .where(eq(userRolesTable.userId, userId))
          .catch(() => []),
        this.drizzle.db
          .select()
          .from(addressesTable)
          .where(eq(addressesTable.userId, userId))
          .orderBy(desc(addressesTable.isDefault))
          .catch(() => []),
        this.drizzle.db
          .select()
          .from(onboardingStatesTable)
          .where(eq(onboardingStatesTable.userId, userId))
          .catch(() => []),
      ]);

    const profile: UserProfileProps = profileRows[0]
      ? {
          id: profileRows[0].id,
          userId: profileRows[0].userId,
          firstName: profileRows[0].firstName,
          lastName: profileRows[0].lastName,
          avatarUrl: profileRows[0].avatarUrl,
          birthDate: profileRows[0].birthDate ? new Date(profileRows[0].birthDate) : null,
          language: profileRows[0].language,
          currency: profileRows[0].currency,
          country: profileRows[0].country,
          phoneCountry: profileRows[0].phoneCountry,
          completionPct: profileRows[0].completionPct,
        }
      : {
          firstName: '',
          lastName: '',
          language: 'es',
          currency: 'USD',
          completionPct: 20,
        };

    const businessProfile: BusinessProfileProps | null = businessRows[0]
      ? {
          id: businessRows[0].id,
          userId: businessRows[0].userId,
          legalName: businessRows[0].legalName,
          tradeName: businessRows[0].tradeName,
          taxId: businessRows[0].taxId,
          legalType: businessRows[0].legalType,
          billingEmail: businessRows[0].billingEmail,
          fiscalAddress: businessRows[0].fiscalAddress,
          reviewStatus: businessRows[0].reviewStatus,
        }
      : null;

    const sellerProfile: SellerProfileProps | null = sellerRows[0]
      ? {
          id: sellerRows[0].id,
          userId: sellerRows[0].userId,
          storeName: sellerRows[0].storeName,
          storeSlug: sellerRows[0].storeSlug,
          description: sellerRows[0].description,
          logoUrl: sellerRows[0].logoUrl,
          bannerUrl: sellerRows[0].bannerUrl,
          taxId: sellerRows[0].taxId,
          rating: sellerRows[0].rating,
          totalSales: sellerRows[0].totalSales,
          isVerified: sellerRows[0].isVerified,
          status: sellerRows[0].status,
        }
      : null;

    const roles =
      userRoleRows.length > 0
        ? userRoleRows.map((r: any) => r.roleCodename.toLowerCase())
        : [(userRow.type || UserType.BUYER).toLowerCase()];

    const primaryRole = (roles[0] || userRow.type || UserType.BUYER).toLowerCase() as UserType;

    const permissionSet = new Set<string>();
    for (const r of roles) {
      const perms = getPermissionsForRole(r);
      for (const p of perms) permissionSet.add(p);
    }

    const addresses: AddressProps[] = addressRows.map((a: any) => ({
      id: a.id,
      userId: a.userId,
      label: a.label,
      country: a.country,
      province: a.province,
      city: a.city,
      street: a.street,
      number: a.number,
      zip: a.zip,
      isDefault: a.isDefault,
    }));

    const onboardingStates: OnboardingStateProps[] = onboardingRows.map((o: any) => ({
      id: o.id,
      userId: o.userId,
      stepCode: o.stepCode,
      status: o.status,
      completedAt: o.completedAt,
    }));

    return new UserEntity({
      id: userRow.id,
      status: userRow.status as UserStatus,
      type: primaryRole,
      role: primaryRole as unknown as UserRole,
      email: userRow.email,
      phone: userRow.phone,
      passwordHash: userRow.passwordHash,
      emailVerifiedAt: userRow.emailVerifiedAt,
      phoneVerifiedAt: userRow.phoneVerifiedAt,
      createdAt: userRow.createdAt,
      updatedAt: userRow.updatedAt,
      deletedAt: userRow.deletedAt,
      profile,
      businessProfile,
      sellerProfile,
      roles,
      permissions: Array.from(permissionSet),
      addresses,
      onboardingStates,
    });
  }

  async findById(id: string): Promise<UserEntity | null> {
    const rows = await this.drizzle.db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.id, id), isNull(usersTable.deletedAt)))
      .limit(1);

    if (rows.length === 0) return null;
    return this.hydrateUser(rows[0]);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const rows = await this.drizzle.db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.email, email.toLowerCase().trim()), isNull(usersTable.deletedAt)))
      .limit(1);

    if (rows.length === 0) return null;
    return this.hydrateUser(rows[0]);
  }

  async findByPhone(phone: string): Promise<UserEntity | null> {
    const rows = await this.drizzle.db
      .select()
      .from(usersTable)
      .where(and(eq(usersTable.phone, phone.trim()), isNull(usersTable.deletedAt)))
      .limit(1);

    if (rows.length === 0) return null;
    return this.hydrateUser(rows[0]);
  }

    async findByTaxId(taxId: string): Promise<UserEntity | null> {
    const rows = await this.drizzle.db
      .select({ userId: businessProfilesTable.userId })
      .from(businessProfilesTable)
      .where(eq(businessProfilesTable.taxId, taxId))
      .limit(1);
    if (!rows[0]) return null;
    return this.findById(rows[0].userId);
  }

  async create(user: UserEntity): Promise<UserEntity> {
    const json = user.toJSON();

    const userRows = await this.drizzle.db
      .insert(usersTable)
      .values({
        id: json.id,
        status: json.status,
        type: json.type,
        email: json.email.toLowerCase().trim(),
        phone: json.phone?.trim() || null,
        passwordHash: user.passwordHash,
        emailVerifiedAt: json.emailVerifiedAt ? new Date(json.emailVerifiedAt) : null,
        emailVerified: Boolean(json.emailVerifiedAt),
        phoneVerifiedAt: json.phoneVerifiedAt ? new Date(json.phoneVerifiedAt) : null,
        createdAt: json.createdAt,
        updatedAt: json.updatedAt,
      })
      .returning();

    const createdUser = userRows[0];

    await this.drizzle.db.insert(userProfilesTable).values({
      userId: createdUser.id,
      firstName: json.firstName || '',
      lastName: json.lastName || '',
      avatarUrl: json.avatarUrl || null,
      birthDate: json.birthDate ? String(json.birthDate).substring(0, 10) : null,
      language: json.language || 'es',
      currency: json.currency || 'USD',
      country: json.country || null,
      phoneCountry: json.phoneCountry || null,
      completionPct: json.completionPct || 20,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (json.businessProfile) {
      await this.drizzle.db.insert(businessProfilesTable).values({
        userId: createdUser.id,
        legalName: json.businessProfile.legalName,
        tradeName: json.businessProfile.tradeName || null,
        taxId: json.businessProfile.taxId,
        legalType: json.businessProfile.legalType || null,
        billingEmail: json.businessProfile.billingEmail || json.email,
        fiscalAddress: json.businessProfile.fiscalAddress || null,
        reviewStatus: json.businessProfile.reviewStatus || 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    if (json.sellerProfile) {
      await this.drizzle.db
        .insert(sellerProfilesTable)
        .values({
          userId: createdUser.id,
          storeName: json.sellerProfile.storeName,
          storeSlug: json.sellerProfile.storeSlug,
          description: json.sellerProfile.description || null,
          logoUrl: json.sellerProfile.logoUrl || null,
          bannerUrl: json.sellerProfile.bannerUrl || null,
          taxId: json.sellerProfile.taxId || null,
          status: json.sellerProfile.status || 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .catch((err) => {
          console.error('Error auto-creating seller profile on registration:', err);
        });
    }

    const defaultRoleCodename = json.type || 'buyer';
    await this.assignRoles(createdUser.id, [defaultRoleCodename]);

    await this.saveOnboardingStep(createdUser.id, 'registro_base', 'completed');

    return this.findById(createdUser.id) as Promise<UserEntity>;
  }

  async update(user: UserEntity): Promise<UserEntity> {
    const json = user.toJSON();

    await this.drizzle.db
      .update(usersTable)
      .set({
        status: json.status,
        type: json.type,
        email: json.email.toLowerCase().trim(),
        phone: json.phone?.trim() || null,
        passwordHash: user.passwordHash,
        emailVerifiedAt: json.emailVerifiedAt ? new Date(json.emailVerifiedAt) : null,
        emailVerified: Boolean(json.emailVerifiedAt),
        phoneVerifiedAt: json.phoneVerifiedAt ? new Date(json.phoneVerifiedAt) : null,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, user.id));

    if (json.profile) {
      await this.drizzle.db
        .insert(userProfilesTable)
        .values({
          userId: user.id,
          firstName: json.firstName,
          lastName: json.lastName,
          avatarUrl: json.avatarUrl || null,
          birthDate: json.birthDate ? String(json.birthDate).substring(0, 10) : null,
          language: json.language || 'es',
          currency: json.currency || 'USD',
          country: json.country || null,
          phoneCountry: json.phoneCountry || null,
          completionPct: json.completionPct,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: userProfilesTable.userId,
          set: {
            firstName: json.firstName,
            lastName: json.lastName,
            avatarUrl: json.avatarUrl || null,
            birthDate: json.birthDate ? String(json.birthDate).substring(0, 10) : null,
            language: json.language || 'es',
            currency: json.currency || 'USD',
            country: json.country || null,
            phoneCountry: json.phoneCountry || null,
            completionPct: json.completionPct,
            updatedAt: new Date(),
          },
        });
    }

    if (json.businessProfile) {
      await this.drizzle.db
        .insert(businessProfilesTable)
        .values({
          userId: user.id,
          legalName: json.businessProfile.legalName,
          tradeName: json.businessProfile.tradeName || null,
          taxId: json.businessProfile.taxId,
          legalType: json.businessProfile.legalType || null,
          billingEmail: json.businessProfile.billingEmail || json.email,
          fiscalAddress: json.businessProfile.fiscalAddress || null,
          reviewStatus: json.businessProfile.reviewStatus || 'pending',
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: businessProfilesTable.userId,
          set: {
            legalName: json.businessProfile.legalName,
            tradeName: json.businessProfile.tradeName || null,
            taxId: json.businessProfile.taxId,
            legalType: json.businessProfile.legalType || null,
            billingEmail: json.businessProfile.billingEmail || json.email,
            fiscalAddress: json.businessProfile.fiscalAddress || null,
            reviewStatus: json.businessProfile.reviewStatus || 'pending',
            updatedAt: new Date(),
          },
        });
    }

    if (json.sellerProfile) {
      await this.drizzle.db
        .insert(sellerProfilesTable)
        .values({
          userId: user.id,
          storeName: json.sellerProfile.storeName,
          storeSlug: json.sellerProfile.storeSlug,
          description: json.sellerProfile.description || null,
          logoUrl: json.sellerProfile.logoUrl || null,
          bannerUrl: json.sellerProfile.bannerUrl || null,
          taxId: json.sellerProfile.taxId || null,
          status: json.sellerProfile.status || 'active',
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: sellerProfilesTable.userId,
          set: {
            storeName: json.sellerProfile.storeName,
            storeSlug: json.sellerProfile.storeSlug,
            description: json.sellerProfile.description || null,
            logoUrl: json.sellerProfile.logoUrl || null,
            bannerUrl: json.sellerProfile.bannerUrl || null,
            taxId: json.sellerProfile.taxId || null,
            status: json.sellerProfile.status || 'active',
            updatedAt: new Date(),
          },
        })
        .catch((err) => {
          console.error('Error updating seller profile:', err);
        });
    }

    return (await this.findById(user.id)) as UserEntity;
  }

  async delete(id: string): Promise<void> {
    await this.drizzle.db
      .update(usersTable)
      .set({
        status: UserStatus.LOGICALLY_DELETED,
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, id));
  }

  async list(
    filtersOrPage: UserListFilters | number = 1,
    maybeLimit = 20,
  ): Promise<{ items: UserEntity[]; total: number }> {
    let page = 1;
    let limit = 20;
    let search: string | undefined;
    let role: string | undefined;
    let type: string | undefined;
    let status: string | undefined;
    let sortBy: string | undefined;
    let sortOrder: 'asc' | 'desc' = 'desc';

    if (typeof filtersOrPage === 'number') {
      page = filtersOrPage;
      limit = maybeLimit;
    } else if (filtersOrPage) {
      page = filtersOrPage.page ?? 1;
      limit = filtersOrPage.limit ?? 20;
      search = filtersOrPage.search;
      role = filtersOrPage.role ? String(filtersOrPage.role) : undefined;
      type = filtersOrPage.type;
      status = filtersOrPage.status ? String(filtersOrPage.status) : undefined;
      sortBy = filtersOrPage.sortBy;
      sortOrder = filtersOrPage.sortOrder === 'asc' ? 'asc' : 'desc';
    }

    const offset = (page - 1) * limit;
    const conditions = [isNull(usersTable.deletedAt)];

    if (status) {
      conditions.push(eq(usersTable.status, status));
    }

    if (type) {
      conditions.push(eq(usersTable.type, type));
    } else if (role) {
      conditions.push(eq(usersTable.type, role));
    }

    if (search && search.trim().length > 0) {
      const term = `%${search.trim().toLowerCase()}%`;
      const searchCond = or(
        ilike(usersTable.email, term),
        ilike(usersTable.phone, term),
        ilike(userProfilesTable.firstName, term),
        ilike(userProfilesTable.lastName, term),
      );
      if (searchCond) {
        conditions.push(searchCond);
      }
    }

    const whereClause = and(...conditions);

    const isAsc = sortOrder === 'asc';
    let primaryOrder: any;

    switch (sortBy) {
      case 'name':
        primaryOrder = isAsc ? asc(userProfilesTable.firstName) : desc(userProfilesTable.firstName);
        break;
      case 'email':
        primaryOrder = isAsc ? asc(usersTable.email) : desc(usersTable.email);
        break;
      case 'phone':
        primaryOrder = isAsc ? asc(usersTable.phone) : desc(usersTable.phone);
        break;
      case 'role':
        primaryOrder = isAsc ? asc(usersTable.type) : desc(usersTable.type);
        break;
      case 'status':
        primaryOrder = isAsc ? asc(usersTable.status) : desc(usersTable.status);
        break;
      case 'completion':
        primaryOrder = isAsc ? asc(userProfilesTable.completionPct) : desc(userProfilesTable.completionPct);
        break;
      case 'createdAt':
      default:
        primaryOrder = isAsc ? asc(usersTable.createdAt) : desc(usersTable.createdAt);
        break;
    }

    const [countResult, rows] = await Promise.all([
      this.drizzle.db
        .select({ count: sql<number>`count(distinct ${usersTable.id})` })
        .from(usersTable)
        .leftJoin(userProfilesTable, eq(usersTable.id, userProfilesTable.userId))
        .where(whereClause),
      this.drizzle.db
        .select({ id: usersTable.id })
        .from(usersTable)
        .leftJoin(userProfilesTable, eq(usersTable.id, userProfilesTable.userId))
        .where(whereClause)
        .groupBy(
          usersTable.id,
          usersTable.email,
          usersTable.phone,
          usersTable.type,
          usersTable.status,
          usersTable.createdAt,
          userProfilesTable.firstName,
          userProfilesTable.lastName,
          userProfilesTable.completionPct,
        )
        .orderBy(primaryOrder, desc(usersTable.createdAt))
        .offset(offset)
        .limit(limit),
    ]);

    const total = Number(countResult[0]?.count ?? 0);
    const users = await Promise.all(rows.map((r: any) => this.findById(r.id)));
    const validUsers = users.filter((u: any): u is UserEntity => u !== null);

    return {
      items: validUsers,
      total,
    };
  }

  async assignRoles(userId: string, roleCodenames: string[], assignedBy?: string): Promise<void> {
    for (const code of roleCodenames) {
      await this.drizzle.db
        .insert(rolesTable)
        .values({
          codename: code.toLowerCase(),
          name: code.toUpperCase(),
          isSystem: true,
          createdAt: new Date(),
        })
        .onConflictDoNothing({ target: rolesTable.codename });
    }

    const foundRoles = await this.drizzle.db
      .select()
      .from(rolesTable)
      .where(
        inArray(
          rolesTable.codename,
          roleCodenames.map((c) => c.toLowerCase()),
        ),
      );

    await this.drizzle.db.delete(userRolesTable).where(eq(userRolesTable.userId, userId));

    for (const r of foundRoles) {
      await this.drizzle.db.insert(userRolesTable).values({
        userId,
        roleId: r.id,
        assignedBy: assignedBy || null,
        assignedAt: new Date(),
      });
    }
  }

  async saveOnboardingStep(userId: string, stepCode: string, status: string): Promise<void> {
    await this.drizzle.db
      .insert(onboardingStatesTable)
      .values({
        userId,
        stepCode,
        status,
        completedAt: status === 'completed' ? new Date() : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [onboardingStatesTable.userId, onboardingStatesTable.stepCode],
        set: {
          status,
          completedAt: status === 'completed' ? new Date() : null,
          updatedAt: new Date(),
        },
      });
  }

  async saveAddress(userId: string, address: AddressProps): Promise<AddressProps> {
    if (address.isDefault) {
      await this.clearDefaultAddresses(userId);
    }

    const rows = await this.drizzle.db
      .insert(addressesTable)
      .values({
        userId,
        label: address.label || 'Principal',
        country: address.country,
        province: address.province,
        city: address.city,
        street: address.street,
        number: address.number,
        zip: address.zip,
        isDefault: Boolean(address.isDefault),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    const r = rows[0];
    return {
      id: r.id,
      userId: r.userId,
      label: r.label,
      country: r.country,
      province: r.province,
      city: r.city,
      street: r.street,
      number: r.number,
      zip: r.zip,
      isDefault: r.isDefault,
    };
  }

  private async clearDefaultAddresses(userId: string): Promise<void> {
    await this.drizzle.db
      .update(addressesTable)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(eq(addressesTable.userId, userId));
  }

  private async findOwnedAddress(userId: string, addressId: string) {
    const rows = await this.drizzle.db
      .select()
      .from(addressesTable)
      .where(and(eq(addressesTable.id, addressId), eq(addressesTable.userId, userId)))
      .limit(1);
    return rows[0] ?? null;
  }

  async updateAddress(userId: string, addressId: string, data: AddressInput): Promise<AddressProps | null> {
    const existing = await this.findOwnedAddress(userId, addressId);
    if (!existing) return null;

    if (data.isDefault) {
      await this.clearDefaultAddresses(userId);
    }

    const rows = await this.drizzle.db
      .update(addressesTable)
      .set({
        label: data.label !== undefined ? data.label : existing.label,
        country: data.country !== undefined ? data.country : existing.country,
        province: data.province !== undefined ? data.province : existing.province,
        city: data.city !== undefined ? data.city : existing.city,
        street: data.street !== undefined ? data.street : existing.street,
        number: data.number !== undefined ? data.number : existing.number,
        zip: data.zip !== undefined ? data.zip : existing.zip,
        isDefault: data.isDefault !== undefined ? Boolean(data.isDefault) : existing.isDefault,
        updatedAt: new Date(),
      })
      .where(and(eq(addressesTable.id, addressId), eq(addressesTable.userId, userId)))
      .returning();

    const r = rows[0];
    return {
      id: r.id,
      userId: r.userId,
      label: r.label,
      country: r.country,
      province: r.province,
      city: r.city,
      street: r.street,
      number: r.number,
      zip: r.zip,
      isDefault: r.isDefault,
    };
  }

  async deleteAddress(userId: string, addressId: string): Promise<boolean> {
    const existing = await this.findOwnedAddress(userId, addressId);
    if (!existing) return false;

    const wasDefault = existing.isDefault;
    await this.drizzle.db
      .delete(addressesTable)
      .where(and(eq(addressesTable.id, addressId), eq(addressesTable.userId, userId)));

    if (wasDefault) {
      const remaining = await this.drizzle.db
        .select()
        .from(addressesTable)
        .where(eq(addressesTable.userId, userId))
        .orderBy(asc(addressesTable.createdAt))
        .limit(1);
      if (remaining[0]) {
        await this.drizzle.db
          .update(addressesTable)
          .set({ isDefault: true, updatedAt: new Date() })
          .where(eq(addressesTable.id, remaining[0].id));
      }
    }

    return true;
  }
}

export const PostgresUserRepository = UserRepository;
