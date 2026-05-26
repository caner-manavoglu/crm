import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';

// Birden çok origin desteklemek için virgülle ayrılmış FRONTEND_URL'e izin verilir.
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

@WebSocketGateway({
  cors: {
    origin: allowedOrigins.length === 1 ? allowedOrigins[0] : allowedOrigins,
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    const token =
      client.handshake.auth?.token ||
      client.handshake.headers?.authorization?.split(' ')[1];

    // Anonim (token'sız) bağlantılara izin ver — sadece takip kodu odasına
    // katılabilirler; rol bazlı odalara erişimleri yok.
    if (!token) {
      client.data.anonymous = true;
      this.logger.log(`Anonymous client connected: ${client.id}`);
      return;
    }

    try {
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

  // Takip kodu odasına katılma — public, token gerektirmez. Yalnızca
  // formatı doğru kodlara izin veriyoruz (CRM-XXXXXX) ki rastgele odalara
  // join'lenip emit olmadığı sürece zaten boşa olur.
  @SubscribeMessage('track:subscribe')
  onTrackSubscribe(
    @MessageBody() data: { code?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const code = data?.code?.toUpperCase().trim();
    if (!code || !/^CRM-[A-Z0-9]{6}$/.test(code)) return { ok: false };
    void client.join(`track:${code}`);
    return { ok: true };
  }

  @SubscribeMessage('track:unsubscribe')
  onTrackUnsubscribe(
    @MessageBody() data: { code?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const code = data?.code?.toUpperCase().trim();
    if (!code) return;
    void client.leave(`track:${code}`);
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

  notifyTrack(trackingCode: string, event: string, payload: any) {
    if (!trackingCode) return;
    this.server.to(`track:${trackingCode}`).emit(event, payload);
  }

  // Şikayet thread odasına (mesajlaşma) canlı yayın.
  notifyComplaintThread(complaintId: string, event: string, payload: any) {
    if (!complaintId) return;
    this.server.to(`complaint:${complaintId}`).emit(event, payload);
  }

  @SubscribeMessage('complaint:subscribe')
  onComplaintSubscribe(
    @MessageBody() data: { complaintId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Sadece authenticated (anonim değil) kullanıcılar şikayet thread'ine katılabilir.
    if (client.data?.anonymous) return { ok: false };
    const id = data?.complaintId;
    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return { ok: false };
    void client.join(`complaint:${id}`);
    return { ok: true };
  }

  @SubscribeMessage('complaint:unsubscribe')
  onComplaintUnsubscribe(
    @MessageBody() data: { complaintId?: string },
    @ConnectedSocket() client: Socket,
  ) {
    const id = data?.complaintId;
    if (!id) return;
    void client.leave(`complaint:${id}`);
  }
}
