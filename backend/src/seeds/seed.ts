import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';
import { SeedService } from './seed.service';

async function runSeed() {
  const app = await NestFactory.createApplicationContext(SeedModule);
  try {
    const seedService = app.get(SeedService);
    await seedService.run(1000);
  } finally {
    await app.close();
  }
}

runSeed().catch((err) => {
  console.error('❌ Error ejecutando seed:', err);
  process.exit(1);
});
