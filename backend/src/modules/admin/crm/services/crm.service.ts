import { Injectable, NotFoundException } from '@nestjs/common';
import { CrmRepository } from '../repositories/crm.repository';
import { CreateLeadDto, UpdateLeadStatusDto } from '../dto/crm.dto';

@Injectable()
export class CrmService {
  constructor(private readonly crmRepo: CrmRepository) {}

  async createLead(dto: CreateLeadDto) {
    return this.crmRepo.createLead(dto);
  }

  async listLeads() {
    return this.crmRepo.listLeads();
  }

  async updateLeadStatus(id: number, dto: UpdateLeadStatusDto) {
    const updated = await this.crmRepo.updateLeadStatus(id, dto);
    if (!updated) {
      throw new NotFoundException(`Lead #${id} no encontrado.`);
    }
    return updated;
  }

  async getPipelineStats() {
    return this.crmRepo.getPipelineStats();
  }
}
