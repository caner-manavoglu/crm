import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from './config/configuration';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CitiesModule } from './modules/cities/cities.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ComplaintsModule } from './modules/complaints/complaints.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { StaffAvailabilityModule } from './modules/staff-availability/staff-availability.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { ResolutionProcessesModule } from './modules/resolution-processes/resolution-processes.module';
import { HealthModule } from './modules/health/health.module';
import { MessagesModule } from './modules/messages/messages.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';
import { RatingsModule } from './modules/ratings/ratings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('database.host'),
        port: config.get('database.port'),
        database: config.get('database.name'),
        username: config.get('database.user'),
        password: config.get('database.password'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: config.get('NODE_ENV') !== 'production',
        logging: config.get('NODE_ENV') === 'development',
        autoLoadEntities: true,
      }),
    }),
    ThrottlerModule.forRoot([
      { name: 'default', ttl: 60_000, limit: 100 },
      { name: 'strict', ttl: 60_000, limit: 10 },
      { name: 'auth', ttl: 60_000, limit: 5 },
    ]),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    CitiesModule,
    DepartmentsModule,
    CategoriesModule,
    ComplaintsModule,
    AssignmentsModule,
    StaffAvailabilityModule,
    NotificationsModule,
    AnalyticsModule,
    SchedulerModule,
    ResolutionProcessesModule,
    HealthModule,
    MessagesModule,
    AttachmentsModule,
    RatingsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
