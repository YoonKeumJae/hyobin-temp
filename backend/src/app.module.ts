import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { AiMealPlanModule } from './ai-meal-plan/ai-meal-plan.module';

@Module({
  imports: [HealthModule, AiMealPlanModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
