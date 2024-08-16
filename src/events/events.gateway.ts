import { Logger, UseGuards, Request } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';


@WebSocketGateway(3001, {
  cors: { origin: '*' },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private authService: AuthService,

  ) { }

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('EventsGateway');



  @SubscribeMessage('join-version')
  async joinChatRoom(
    @ConnectedSocket() socket: Socket,
    @MessageBody() roomId: string,
  ): Promise<void> {

    const accToken = this.authService.extractTokenFromHeader(socket.handshake.headers.authorization);
    const payload = await this.authService.verifyJwtToken(accToken);
    this.server.to(roomId).emit('joined', [roomId, payload]);
  }
  @SubscribeMessage('leave-version')
  leaveRoom(@ConnectedSocket() socket: Socket, @MessageBody() roomId: string) {
    // 이미 접속한 방인지 확인
    if (socket.rooms) {
      socket.leave(roomId);
    }
  }

  @SubscribeMessage('ClientToServer')
  handleClientToServer(@MessageBody() data) {
    //-> 클라이언트에서 서버로 메시지를 보낼 때 실행되는 함수
    this.logger.log(`${data}`)
    this.server.emit('ServerToClient', data);
  }

  afterInit(server: Server) {
    this.logger.log('웹소켓 서버 초기화 ✅');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client Disconnected : ${client.id}`);

  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client Connected : ${client.id}`);
    this.server.emit('ServerToClient', "sfdsklfjakl");
  }
}