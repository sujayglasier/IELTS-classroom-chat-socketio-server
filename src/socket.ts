import { Server as HttpServer } from 'http';
import { Socket, Server } from 'socket.io';
import { v4 } from 'uuid';
import { apiService } from './api.service';
import { ChatEvent, MessageType } from './constants';

type UsersObj = {
    roomId: string;
    userId: string;
    userType: string;
    socketId: string;
}

type sendingMessageObj = {
	id: string;
	roomId: string;
	senderId: string;
	message: string;
	messageType: string;
	createdAt: string;
}

export class ServerSocket {
    public static instance: ServerSocket;
    private io: Server;
    public users : Array<UsersObj>; /** Master list of all connected users */
    private apiService = new apiService();

    constructor(server: HttpServer) {
        ServerSocket.instance = this;
        this.users = [];
        this.io = new Server(server, {
            // serveClient: false,
            pingInterval: 10000,
            pingTimeout: 5000,
            cookie: false,
            cors: {
                origin: '*'
            }
        });

        this.socketListen();
    }

    private async socketListen(): Promise<void> {

        // Run when client connects
		this.io.on(ChatEvent.CONNECT, (socket: Socket) => {
            console.info('Socket user connected => ' + socket.id);

			// join room
			socket.on(ChatEvent.JOIN_ROOM, async (roomId: string, userId: string, userType: string) => {
				console.log({userId, roomId});

				const userObj: UsersObj = {
					roomId: roomId,
					userId: userId,
					userType: userType,
					socketId: socket.id,
				};
				this.users.push(userObj);
				console.log(this.users);
				
				// join room
				socket.join(userObj.roomId);

				// get old message
				let roomChatMessageList = await this.apiService.getClassroomChatMessageList(userObj.roomId);
				if (roomChatMessageList.status == false) {
					return false;
				}
				roomChatMessageList = roomChatMessageList.map((item: sendingMessageObj) => this.formatMessage(item.id, item.roomId, item.senderId, item.message, item.messageType, item.createdAt))
				// receive old message event
				socket.emit(ChatEvent.REC_ALL_MESSAGE, {
					userId: userObj.userId,
					messageList: roomChatMessageList
				});

				// // Welcome current user
				// socket.emit(ChatEvent.REC_MESSAGE, {
				// 	userId: userObj.userId,
				// 	messageList: [this.formatMessage('messageId', userObj.roomId, userObj.userId, 'Welcome to Chat!', MessageType.TYPE_MESSAGE)]
				// });
				// // Broadcast when a user connects
				// socket.broadcast.to(userObj.roomId).emit(ChatEvent.REC_MESSAGE, {
				// 	userId: userObj.userId,
				// 	messageList: [this.formatMessage('messageId', userObj.roomId, userObj.userId, `${userObj.userId} has joined the chat`, MessageType.TYPE_MESSAGE)]
				// });

				// get room user list
				let roomUserList = await this.apiService.getClassroomUserList(userObj.roomId);
				if (roomUserList.status == false) {
					return false;
				}
				roomUserList = roomUserList?.map((item: any) => {
					return {
						...item,
						status: this.users.some(user => user.userId == item.user_id)
					}
				})
				// Send users and room info  event
				this.io.to(userObj.roomId).emit("roomUsers", {
					roomId: userObj.roomId,
					users: this.users.filter(user => user.roomId === userObj.roomId),
					users_list: roomUserList,
				});
			});

			// Listen for chatMessage
			socket.on(ChatEvent.SEND_MESSAGE, async (message: string, messageType: string) => { // userId: string, roomId: string, 
				const userObj = this.users.find(user => user.socketId === socket.id);
				if (!userObj) {
					return false;
				}

				// store message
				let storedChatMessage = await this.apiService.storeChatMessage(userObj.roomId, userObj.userId, userObj.userType, message, messageType);
				if (storedChatMessage.status == false) {
					return false;
				}
				this.io.to(userObj.roomId).emit(ChatEvent.REC_MESSAGE, {
					userId: userObj.userId,
					messageList: [this.formatMessage(storedChatMessage.message_id, userObj.roomId, userObj.userId, message, messageType, storedChatMessage.createdAt)]
				});
			});


			// Runs when client disconnects
			socket.on(ChatEvent.DISCONNECT, async () => {
				console.info('Socket user disconnected => ' + socket.id);
				
				const findIndex = this.users.findIndex(user => user.socketId === socket.id);
				if (findIndex !== -1) {
					const removeUser = this.users.splice(findIndex, 1)[0];
					console.log(this.users);

					// this.io.to(removeUser.roomId).emit(ChatEvent.REC_MESSAGE, {
					// 	userId: removeUser.userId,
					// 	messageList: [this.formatMessage('messageId', removeUser.roomId, removeUser.userId, `${removeUser.userId} has left the chat`, MessageType.TYPE_MESSAGE)]
					// });

					// Send users and room info
					// this.io.to(removeUser.roomId).emit("roomUsers", {
					// 	roomId: removeUser.roomId,
					// 	users: this.users.filter(user => user.roomId === removeUser.roomId)
					// });

					// get room user list
					let roomUserList = await this.apiService.getClassroomUserList(removeUser.roomId);
					if (roomUserList.status == false) {
						return false;
					}
					roomUserList = roomUserList.map((item: any) => {
						return {
							...item,
							status: this.users.some(user => user.userId == item.user_id)
						}
					})
					// Send users and room info event
					this.io.to(removeUser.roomId).emit("roomUsers", {
						roomId: removeUser.roomId,
						users: this.users.filter(user => user.roomId === removeUser.roomId),
						users_list: roomUserList,
					});
				}
			});
		});
	}

    private formatMessage(messageId: string, roomId: string, senderId: string, message: string, messageType: string = MessageType.TYPE_MESSAGE, createdAt: string): sendingMessageObj {
		return {
			id: messageId,
			roomId: roomId,
			senderId: senderId,
			message: message,
			messageType: messageType,
			createdAt: createdAt
		};
	}
}