import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CrmService } from '../../src/modules/admin/crm/services/crm.service';
import { NotFoundException } from '@nestjs/common';

describe('CrmService - Unit Suite', () => {
  let crmService: CrmService;
  let mockCrmRepo: any;

  beforeEach(() => {
    mockCrmRepo = {
      createLead: vi.fn().mockImplementation((dto) =>
        Promise.resolve({
          id: 1,
          name: dto.name,
          email: dto.email,
          status: 'nuevo',
          score: 15,
        }),
      ),
      listLeads: vi.fn().mockResolvedValue([
        { id: 1, name: 'Martín', email: 'martin@obra.com', status: 'nuevo' },
      ]),
      updateLeadStatus: vi.fn(),
      getPipelineStats: vi.fn().mockResolvedValue({
        totalLeads: 5,
        qualifiedCount: 2,
        contactedCount: 1,
        newCount: 2,
      }),
    };

    crmService = new CrmService(mockCrmRepo);
  });

  it('debe registrar un nuevo lead', async () => {
    const lead = await crmService.createLead({
      name: 'Esteban Ocon',
      email: 'esteban@alpine.com',
      company: 'Alpine Constructora',
      source: 'web',
    });

    expect(lead).toBeDefined();
    expect(lead.name).toBe('Esteban Ocon');
    expect(mockCrmRepo.createLead).toHaveBeenCalled();
  });

  it('debe obtener las estadísticas del pipeline comercial', async () => {
    const stats = await crmService.getPipelineStats();
    expect(stats.totalLeads).toBe(5);
    expect(stats.qualifiedCount).toBe(2);
  });

  it('debe arrojar NotFoundException si el lead a actualizar no existe', async () => {
    mockCrmRepo.updateLeadStatus.mockResolvedValue(null);
    await expect(crmService.updateLeadStatus(999, { status: 'calificado' })).rejects.toThrow(
      NotFoundException,
    );
  });
});
