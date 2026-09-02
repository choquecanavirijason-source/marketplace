import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { DrizzleService } from '../infrastructure/database/drizzle.service';
import {
  usersTable,
  userProfilesTable,
  businessProfilesTable,
  rolesTable,
  permissionsTable,
  userRolesTable,
  rolePermissionsTable,
  onboardingStatesTable,
  securityEventsTable,
  auditLogsTable,
} from '../infrastructure/database/schema';
import { CryptoUtils, Permissions, ROLE_PERMISSIONS } from '../shared';
import { STATIC_ACCOUNTS, generateFakeUsers } from './fixtures/users.fixture';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly drizzle: DrizzleService) {}

  async run(fakeUserCount = 500) {
    this.logger.log('🌱 Iniciando proceso de Seed de la base de datos...');

    const defaultPassword = 'Password1234!';
    const passwordHash = await CryptoUtils.hashPassword(defaultPassword);

    // 1. Seed Roles and Permissions
    this.logger.log('🛡️ Sembrando roles del sistema y permisos granulares...');
    const allPermissionCodes = Object.values(Permissions);
    const permissionMap = new Map<string, string>();

    for (const code of allPermissionCodes) {
      const parts = code.split('.');
      const resource = parts[0] || 'general';
      const action = parts[1] || 'action';

      const permRows = await this.drizzle.db
        .insert(permissionsTable)
        .values({
          resource,
          action,
          code,
          createdAt: new Date(),
        })
        .onConflictDoNothing({ target: permissionsTable.code })
        .returning();

      if (permRows[0]) {
        permissionMap.set(code, permRows[0].id);
      }
    }

    // Fetch all permissions if already existed
    const existingPerms = await this.drizzle.db.select().from(permissionsTable);
    for (const p of existingPerms) {
      permissionMap.set(p.code, p.id);
    }

    const roleMap = new Map<string, string>();
    const rolesToSeed = [
      { codename: 'buyer', name: 'Comprador' },
      { codename: 'seller', name: 'Vendedor General' },
      { codename: 'seller_individual', name: 'Vendedor Individual' },
      { codename: 'seller_empresa', name: 'Vendedor Corporativo' },
      { codename: 'admin', name: 'Administrador' },
      { codename: 'superadmin', name: 'Super Administrador' },
      { codename: 'support', name: 'Soporte y Operaciones' },
      { codename: 'finance', name: 'Finanzas y Riesgo' },
    ];

    for (const r of rolesToSeed) {
      const roleRows = await this.drizzle.db
        .insert(rolesTable)
        .values({
          codename: r.codename,
          name: r.name,
          isSystem: true,
          createdAt: new Date(),
        })
        .onConflictDoNothing({ target: rolesTable.codename })
        .returning();

      const roleId = roleRows[0]?.id;
      if (roleId) {
        roleMap.set(r.codename, roleId);
      }
    }

    const existingRoles = await this.drizzle.db.select().from(rolesTable);
    for (const r of existingRoles) {
      roleMap.set(r.codename, r.id);
    }

    // Link Role Permissions
    for (const [roleCode, permList] of Object.entries(ROLE_PERMISSIONS)) {
      const roleId = roleMap.get(roleCode.toLowerCase());
      if (!roleId) continue;

      for (const permCode of permList) {
        const permId = permissionMap.get(permCode);
        if (!permId) continue;

        try {
          await this.drizzle.db.insert(rolePermissionsTable).values({
            roleId,
            permissionId: permId,
          });
        } catch {
          // Ignore duplicate links
        }
      }
    }

    // 2. Insert Static Administrative Accounts
    this.logger.log('👤 Insertando cuentas fijas (Admin, Staff, Seller, Buyer)...');
    for (const acc of STATIC_ACCOUNTS) {
      const userId = crypto.randomUUID();
      const userRows = await this.drizzle.db
        .insert(usersTable)
        .values({
          id: userId,
          email: acc.email,
          phone: acc.phone,
          passwordHash,
          type: acc.type,
          status: acc.status,
          emailVerifiedAt: new Date(),
          phoneVerifiedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoNothing({ target: usersTable.email })
        .returning();

      const activeUserId = userRows[0]?.id || userId;

      // Insert User Profile
      await this.drizzle.db
        .insert(userProfilesTable)
        .values({
          userId: activeUserId,
          firstName: acc.firstName,
          lastName: acc.lastName,
          language: 'es',
          currency: 'USD',
          completionPct: 100,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoNothing({ target: userProfilesTable.userId });

      // Insert Business Profile if seller
      if (acc.legalName && acc.taxId) {
        await this.drizzle.db
          .insert(businessProfilesTable)
          .values({
            userId: activeUserId,
            legalName: acc.legalName,
            tradeName: acc.tradeName || null,
            taxId: acc.taxId,
            legalType: 'EMPRESA',
            billingEmail: acc.email,
            reviewStatus: 'approved',
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .onConflictDoNothing({ target: businessProfilesTable.userId });
      }

      // Assign user roles
      for (const r of acc.roles) {
        const rId = roleMap.get(r.toLowerCase());
        if (rId) {
          try {
            await this.drizzle.db.insert(userRolesTable).values({
              userId: activeUserId,
              roleId: rId,
              assignedAt: new Date(),
            });
          } catch {
            // ignore
          }
        }
      }

      // Initial Onboarding States
      for (const step of ['registro_base', 'email_verificado', 'telefono_verificado', 'perfil_completo', 'terminos_aceptados']) {
        try {
          await this.drizzle.db.insert(onboardingStatesTable).values({
            userId: activeUserId,
            stepCode: step,
            status: 'completed',
            completedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        } catch {
          // ignore
        }
      }
    }

    // 3. Generate and Insert Fake Users
    this.logger.log(`👥 Generando ${fakeUserCount} usuarios aleatorios con Faker...`);
    const fakeUsers = generateFakeUsers(fakeUserCount, passwordHash);

    const chunkSize = 100;
    for (let i = 0; i < fakeUsers.length; i += chunkSize) {
      const chunk = fakeUsers.slice(i, i + chunkSize);

      for (const u of chunk) {
        const inserted = await this.drizzle.db
          .insert(usersTable)
          .values({
            id: u.id,
            email: u.email,
            phone: u.phone,
            passwordHash: u.passwordHash,
            status: u.status,
            type: u.type,
            emailVerifiedAt: u.emailVerifiedAt,
            phoneVerifiedAt: u.phoneVerifiedAt,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
          })
          .onConflictDoNothing({ target: usersTable.email })
          .returning();

        if (inserted[0]) {
          await this.drizzle.db.insert(userProfilesTable).values({
            userId: inserted[0].id,
            firstName: u.firstName,
            lastName: u.lastName,
            language: 'es',
            currency: 'USD',
            completionPct: 50,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
          });

          const roleId = roleMap.get(u.type.toLowerCase()) || roleMap.get('buyer');
          if (roleId) {
            await this.drizzle.db.insert(userRolesTable).values({
              userId: inserted[0].id,
              roleId,
              assignedAt: u.createdAt,
            });
          }
        }
      }

      this.logger.log(`  ✓ Insertados ${Math.min(i + chunkSize, fakeUsers.length)} de ${fakeUsers.length} usuarios...`);
    }

    // 4. Initial Audit & Security Log
    await this.drizzle.db.insert(securityEventsTable).values({
      eventType: 'SYSTEM_DATABASE_SEEDED',
      severity: 'info',
      detailsJson: JSON.stringify({ fakeUserCount, seedDate: new Date() }),
      ip: '127.0.0.1',
      createdAt: new Date(),
    });

    await this.drizzle.db.insert(auditLogsTable).values({
      eventType: 'SYSTEM_DATABASE_SEEDED',
      details: `Se sembraron las cuentas administrativas, roles RBAC y ${fakeUserCount} usuarios con Faker.`,
      ipAddress: '127.0.0.1',
      userAgent: 'NestJS SeedService',
      createdAt: new Date(),
    });

    this.logger.log('🎉 Seed completado exitosamente.');
    this.logger.log('==============================================');
    this.logger.log('🔑 Credenciales por defecto para todas las cuentas:');
    this.logger.log('   Contraseña: Password1234!');
    this.logger.log('   Super Admin: admin@marketplace.com');
    this.logger.log('   Staff: staff@marketplace.com');
    this.logger.log('   Seller: seller@marketplace.com');
    this.logger.log('   Buyer: buyer@marketplace.com');
    this.logger.log('==============================================');
  }
}
