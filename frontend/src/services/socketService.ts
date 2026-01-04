import io from 'socket.io-client';
import * as SocketIOClient from 'socket.io-client';

class SocketService {
  private socket: SocketIOClient.Socket | null = null;
  private isConnected: boolean = false;

  connect(serverUrl: string) {
    if (!this.isConnected) {
      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
      });

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
        this.isConnected = true;
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error: Error) => {
        console.error('Connection error:', error);
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  joinParkingZone(zoneId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('joinParkingZone', zoneId);
    }
  }

  leaveParkingZone(zoneId: string) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leaveParkingZone', zoneId);
    }
  }

  onSlotUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('slotUpdate', callback);
    }
  }

  offSlotUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.off('slotUpdate', callback);
    }
  }

  onZoneUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('zoneUpdate', callback);
    }
  }

  offZoneUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.off('zoneUpdate', callback);
    }
  }

  onParkingAvailabilityUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('parkingAvailabilityUpdate', callback);
    }
  }

  offParkingAvailabilityUpdate(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.off('parkingAvailabilityUpdate', callback);
    }
  }
}

export default new SocketService();