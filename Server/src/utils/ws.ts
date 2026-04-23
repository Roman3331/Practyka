import { ServerWebSocket } from "bun";

// Types for our WebSocket messages
export type WSEvent = 
  | { type: 'subject_created', data: any }
  | { type: 'subject_deleted', data: { id: string } }
  | { type: 'student_joined', data: { subjectId: string, studentId: string } }
  | { type: 'assignment_created', data: { subjectId: string, assignment: any } }
  | { type: 'assignment_deleted', data: { subjectId: string, assignmentId: string } }
  | { type: 'submission_updated', data: { subjectId: string, assignmentId: string } }
  | { type: 'material_updated', data: { subjectId: string } }
  | { type: 'announcement_created', data: { subjectId: string } }
  | { type: 'assignment_chat_message', data: { subjectId: string, assignmentId: string, studentId: string, message: any } }
  | { type: 'assignment_chat_message_updated', data: { subjectId: string, assignmentId: string, studentId: string, messageId: string, text: string } }
  | { type: 'assignment_chat_message_deleted', data: { subjectId: string, assignmentId: string, studentId: string, messageId: string } }
  | { type: 'notification', data: any };

// Class to manage WebSocket connections and broadcasting
class WSManager {
  private clients: Map<any, string | null> = new Map();

  addClient(ws: any, userId: string | null = null) {
    this.clients.set(ws, userId);
  }

  setUserId(ws: any, userId: string) {
    this.clients.set(ws, userId);
  }

  removeClient(ws: any) {
    this.clients.delete(ws);
  }

  broadcast(event: WSEvent) {
    const message = JSON.stringify(event);
    for (const [client] of this.clients) {
      client.send(message);
    }
  }

  sendToUser(userId: string, event: WSEvent) {
    const message = JSON.stringify(event);
    for (const [client, id] of this.clients) {
      if (id === userId) {
        client.send(message);
      }
    }
  }
}

export const wsManager = new WSManager();
