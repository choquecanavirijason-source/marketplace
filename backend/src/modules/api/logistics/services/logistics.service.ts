import { Injectable, NotFoundException } from '@nestjs/common';
import { LogisticsRepository } from '../repositories/logistics.repository';
import { CreateShipmentDto, UpdateShipmentStatusDto } from '../dto/logistics.dto';

@Injectable()
export class LogisticsService {
  constructor(private readonly logisticsRepo: LogisticsRepository) {}

  async createShipment(dto: CreateShipmentDto) {
    return this.logisticsRepo.createShipment(dto);
  }

  async listShipments(limit?: number) {
    return this.logisticsRepo.listShipments(limit);
  }

  async getShipment(id: number) {
    const shipment = await this.logisticsRepo.findById(id);
    if (!shipment) {
      throw new NotFoundException(`Envío #${id} no encontrado.`);
    }
    return shipment;
  }

  async getShipmentByOrder(orderId: number) {
    const shipment = await this.logisticsRepo.findByOrderId(orderId);
    if (!shipment) {
      throw new NotFoundException(`No hay envíos asociados a la orden #${orderId}.`);
    }
    return shipment;
  }

  async track(trackingCode: string) {
    const shipment = await this.logisticsRepo.findByTrackingCode(trackingCode);
    if (!shipment) {
      throw new NotFoundException(`Código de seguimiento ${trackingCode} no encontrado.`);
    }
    return shipment;
  }

  async updateStatus(id: number, dto: UpdateShipmentStatusDto) {
    const existing = await this.logisticsRepo.findById(id);
    if (!existing) {
      throw new NotFoundException(`Envío #${id} no encontrado.`);
    }
    return this.logisticsRepo.updateStatus(id, dto);
  }
}
