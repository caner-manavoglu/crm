import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.split(' ')[1];
      if (!token) throw new Error('No token');

      const payload = this.jwtService.verify(token, {
        secret: this.config.get('jwt.secret'),
      });

      client.data.userId = payload.sub;
      client.data.role = payload.role;

      await client.join(`user:${payload.sub}`);
      if (payload.role === 'admin') await client.join('admin');

      this.logger.log(`Client connected: ${payload.sub}`);
    } catch (err) {
      this.logger.warn(`Unauthorized socket connection: ${err.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.data?.userId}`);
  }

  notifyUser(userId: string, event: string, payload: any) {
    this.server.to(`user:${userId}`).emit(event, payload);
  }

  notifyAdmins(event: string, payload: any) {
    this.server.to('admin').emit(event, payload);
  }

  broadcastAvailabilityUpdate(staffId: string, availability: any) {
    this.server.emit('availability:updated', { staffId, availability });
  }
}
