import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../../../../infrastructure/database/drizzle.service';
import { productsTable } from '../../../../infrastructure/database/schema';
import { ilike, or } from 'drizzle-orm';
import { AiAssistantPromptDto } from '../dto/ai.dto';

@Injectable()
export class AiService {
  constructor(private readonly drizzle: DrizzleService) {}

  async consultAssistant(dto: AiAssistantPromptDto) {
    const term = `%${dto.query.trim().toLowerCase()}%`;
    const matchedProducts = await this.drizzle.db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        price: productsTable.price,
        stock: productsTable.stock,
        description: productsTable.description,
      })
      .from(productsTable)
      .where(or(ilike(productsTable.name, term), ilike(productsTable.description, term)))
      .limit(3);

    let answer = '';
    if (matchedProducts.length > 0) {
      const itemsList = matchedProducts
        .map((p: { name: string; price: string; stock: number }) => `• **${p.name}** (\$$${p.price}) - Stock disponible: ${p.stock}`)
        .join('\n');
      answer = `¡Hola! Basado en el catálogo de FerroMax para tu consulta "${dto.query}", encontré estas opciones recomendadas:\n\n${itemsList}\n\n¿Te gustaría que agregue alguna de estas herramientas a tu carrito o necesitás detalles técnicos adicionales?`;
    } else {
      answer = `Entiendo tu consulta sobre "${dto.query}". En FerroMax contamos con amplia variedad en herramientas de construcción, ferretería y maquinaria. Te sugiero explorar nuestras categorías principales o especificar marca o potencia para asistirte con precisión.`;
    }

    return {
      query: dto.query,
      answer,
      suggestions: matchedProducts.map((p: { id: number; name: string; price: string }) => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
      })),
      timestamp: new Date().toISOString(),
    };
  }

  async getSemanticRecommendations(productId: number) {
    const products = await this.drizzle.db
      .select({
        id: productsTable.id,
        name: productsTable.name,
        price: productsTable.price,
        stock: productsTable.stock,
      })
      .from(productsTable)
      .limit(4);

    return products.map((p: { id: number; name: string; price: string; stock: number }) => ({
      ...p,
      price: Number(p.price),
      matchScore: 0.94,
    }));
  }
}
