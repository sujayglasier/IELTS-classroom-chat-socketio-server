enum ChatEvent {
  JOIN_ROOM = 'joinRoom',
  CONNECT = 'connection',
  DISCONNECT = 'disconnect',
  SEND_MESSAGE = 'sendMessage',
  REC_MESSAGE = 'receiveMessage',
  REC_ALL_MESSAGE = 'receiveAllMessageList',
}

enum MessageType {
  TYPE_MESSAGE = "1",
  TYPE_IMAGE = "2",
  TYPE_VIDEO = "3",
  TYPE_PDF = "4",
  TYPE_CALL = "5",
}

export {ChatEvent, MessageType}