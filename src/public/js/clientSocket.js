let connected = false;
const socket = io();

socket.emit('setup', userLoggedIn);

socket.on('connected', () => connected = true);
socket.on('receive', (newMessage) => messageReceived(newMessage));