import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AiService } from '../../src/modules/ai/services/ai.service';

describe('AiService - Unit Suite', () => {
  let aiService: AiService;
  let mockDrizzle: any;

  beforeEach(() => {
    mockDrizzle = {
      db: {
        select: vi.fn(),
      },
    };

    aiService = new AiService(mockDrizzle);
  });

  it('debe responder con productos del catálogo cuando hay coincidencias semánticas', async () => {
    mockDrizzle.db.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            { id: 1, name: 'Taladro Percutor DeWalt', price: '45000', stock: 8, description: 'Potencia 800W' },
          ]),
        }),
      }),
    });

    const response = await aiService.consultAssistant({
      query: 'Necesito un taladro para mampostería',
    });

    expect(response).toBeDefined();
    expect(response.answer).toContain('Taladro Percutor DeWalt');
    expect(response.suggestions).toHaveLength(1);
    expect(response.suggestions[0].name).toBe('Taladro Percutor DeWalt');
  });

  it('debe proveer respuesta orientativa cuando no hay coincidencias exactas', async () => {
    mockDrizzle.db.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    const response = await aiService.consultAssistant({
      query: 'Zapatos de fiesta',
    });

    expect(response).toBeDefined();
    expect(response.suggestions).toHaveLength(0);
    expect(response.answer).toContain('ferretería y maquinaria');
  });
});
