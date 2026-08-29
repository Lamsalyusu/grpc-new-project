


let currentTaskId = null;
let socket = null;

function initChat(taskId) {
  currentTaskId = taskId;  // ← store it
  
  socket = io('http://127.0.0.1:3000/chat', {  // ← use 127.0.0.1, not localhost
    auth: { token: getToken() }
  });

  socket.on('connect', () => {
    // console.log('Socket connected');
    socket.emit('join_task', { task_id: currentTaskId });
  });

  socket.on('receive_message', (msg) => {
    const box = document.getElementById('chatMessages');
    box.insertAdjacentHTML('beforeend', renderMsg(msg));
    box.scrollTop = box.scrollHeight;
  });

  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });
}

function sendChat() {
  const input = document.getElementById('chatInput');
  const body = input.value.trim();
  if (!body || !socket || !currentTaskId) return;

  socket.emit('send_message', { task_id: currentTaskId, body });  // ← use stored ID
  input.value = '';
}

document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendChat();
});

document.getElementById('btnSendChat')?.addEventListener('click', sendChat);
document.getElementById('btnLogout')?.addEventListener('click', logout);