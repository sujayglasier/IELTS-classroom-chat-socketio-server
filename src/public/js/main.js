const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get userId and roomId from URL
const { roomId, userId, userType } = Qs.parse(location.search, {
	ignoreQueryPrefix: true
});

console.log({ userId, roomId });

// const socket = io();
const socket = io("http://192.168.0.33:8000");

// Join chatroom
// socket.emit('joinRoom', { userId, roomId });
socket.emit('joinRoom', roomId, userId, userType);

// Get roomId and users
socket.on('roomUsers', ({ roomId, users, users_list }) => {
	outputRoomName(roomId);
	outputUsers(users_list);
});

// old Message from server
socket.on('receiveAllMessageList', messageObj => {
	console.log(messageObj);
	messageObj?.messageList.forEach(element => {
		outputMessage(element);
	});

	// Scroll down
	chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message from server
socket.on('receiveMessage', messageObj => {
	console.log(messageObj);
	outputMessage(messageObj?.messageList[0]);

	// Scroll down
	chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', e => {
	e.preventDefault();

	// Get message text
	const message = e.target.elements.msg.value;
	const messageType = '1';

	// Emit message to server
	socket.emit('sendMessage', message, messageType);

	// Clear input
	e.target.elements.msg.value = '';
	e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
	const div = document.createElement('div');
	div.classList.add('message');
	div.innerHTML = `<p class="meta">${message.senderId} <span>${message.createdAt}</span></p>
	<p class="text">
		${message.message}
	</p>`;
	document.querySelector('.chat-messages').appendChild(div);
}

// Add roomId to DOM
function outputRoomName(roomId) {
	roomName.innerText = roomId;
}

// Add users to DOM
function outputUsers(users) {
	userList.innerHTML = `
		${users.map(user => `<li>${user.user_name}  ${user.status ? '<span style="color: lime;">1</span>' : '<span style="color: red;">0</span>'}</li>`).join('')}
	`;
}