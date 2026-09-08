import { Injectable } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { DrizzleService } from '../../../../infrastructure/database/drizzle.service';
import { leadsTable, opportunitiesTable } from '../../../../infrastructure/database/schema';
import { CreateLeadDto, UpdateLeadStatusDto } from '../dto/crm.dto';

@Injectable()
export class CrmRepository {
  constructor(private readonly drizzle: DrizzleService) {}

  async createLead(dto: CreateLeadDto) {
    const [lead] = await this.drizzle.db
      .insert(leadsTable)
      .values({
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        company: dto.company,
        source: dto.source,
        notes: dto.notes,
        status: 'nuevo',
        score: 15,
      })
      .returning();
    return lead;
  }

  async listLeads() {
    return this.drizzle.db
      .select()
      .from(leadsTable)
      .orderBy(desc(leadsTable.createdAt));
  }

  async updateLeadStatus(id: number, dto: UpdateLeadStatusDto) {
    const [updated] = await this.drizzle.db
      .update(leadsTable)
      .set({
        status: dto.status,
        score: dto.score !== undefined ? dto.score : undefined,
        notes: dto.notes !== undefined ? dto.notes : undefined,
        updatedAt: new Date(),
      })
      .where(eq(leadsTable.id, id))
      .returning();
    return updated;
  }

  async getPipelineStats() {
    const leads = await this.listLeads();
    return {
      totalLeads: leads.length,
      qualifiedCount: leads.filter((l) => l.status === 'calificado').length,
      contactedCount: leads.filter((l) => l.status === 'contactado').length,
      newCount: leads.filter((l) => l.status === 'nuevo').length,
    };
  }
}
