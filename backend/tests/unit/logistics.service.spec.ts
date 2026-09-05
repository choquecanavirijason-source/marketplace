import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LogisticsService } from '../../src/modules/logistics/services/logistics.service';
import { NotFoundException } from '@nestjs/common';

describe('LogisticsService - Unit Suite', () => {
  let logisticsService: LogisticsService;
  let mockLogisticsRepo: any;

  beforeEach(() => {
    mockLogisticsRepo = {
      createShipment: vi.fn().mockImplementation((dto) =>
        Promise.resolve({
          id: 1,
          orderId: dto.orderId,
          trackingCode: 'TRK-TEST-1234',
          status: 'pendiente_preparacion',
        }),
      ),
      findById: vi.fn(),
      findByOrderId: vi.fn(),
      findByTrackingCode: vi.fn(),
      updateStatus: vi.fn().mockImplementation((id, dto) =>
        Promise.resolve({
          id,
          status: dto.status,
          events: [{ status: dto.status, location: dto.location, description: dto.description }],
        }),
      ),
    };

    logisticsService = new LogisticsService(mockLogisticsRepo);
  });

  it('debe registrar un nuevo envío', async () => {
    const shipment = await logisticsService.createShipment({
      orderId: 10,
      carrier: 'Correo Express',
      serviceType: 'estandar',
      destinationAddress: 'Av. Belgrano 450',
      destinationCity: 'Córdoba',
      receiverName: 'Carlos Gómez',
      receiverPhone: '351444555',
    });

    expect(shipment).toBeDefined();
    expect(shipment.trackingCode).toBe('TRK-TEST-1234');
    expect(mockLogisticsRepo.createShipment).toHaveBeenCalled();
  });

  it('debe arrojar NotFoundException si no existe el código de tracking', async () => {
    mockLogisticsRepo.findByTrackingCode.mockResolvedValue(null);
    await expect(logisticsService.track('TRK-INEXISTENTE')).rejects.toThrow(NotFoundException);
  });

  it('debe actualizar el estado logístico correctamente', async () => {
    mockLogisticsRepo.findById.mockResolvedValue({ id: 1, status: 'en_transito' });

    const updated = await logisticsService.updateStatus(1, {
      status: 'entregado',
      location: 'Domicilio de entrega',
      description: 'Entregado en mano al destinatario.',
    });

    expect(updated.status).toBe('entregado');
    expect(mockLogisticsRepo.updateStatus).toHaveBeenCalledWith(1, {
      status: 'entregado',
      location: 'Domicilio de entrega',
      description: 'Entregado en mano al destinatario.',
    });
  });
});
