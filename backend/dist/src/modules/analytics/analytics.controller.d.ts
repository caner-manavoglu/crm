import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private analyticsService;
    constructor(analyticsService: AnalyticsService);
    getDashboard(): Promise<{
        total: number;
        pending: number;
        assigned: number;
        inProgress: number;
        resolved: number;
        closed: number;
        totalStaff: number;
        availableStaff: number;
    }>;
    getStatusBreakdown(): Promise<any[]>;
    getDepartmentBreakdown(): Promise<any[]>;
    getTrend(days?: string): Promise<any[]>;
    getStaffPerformance(): Promise<any[]>;
}
