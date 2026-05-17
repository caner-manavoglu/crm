import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
export declare class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private config;
    server: Server;
    private readonly logger;
    constructor(jwtService: JwtService, config: ConfigService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    notifyUser(userId: string, event: string, payload: any): void;
    notifyAdmins(event: string, payload: any): void;
    broadcastAvailabilityUpdate(staffId: string, availability: any): void;
}
