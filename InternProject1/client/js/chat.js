let currentTaskId = null;
let socket = null;

function initChat(taskId) {
  currentTaskId = taskId;  // ← store it
  
  socket = io('http://127.0.0.1:3000/chat', {  
    auth: { token: getToken() }
  });

  socket.on('connect', () => {
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

// function sendChat() {
//   const input = document.getElementById('chatInput');
//   const imageInput = document.getElementById('chatImage')
//   const body = input.value.trim();
//   const image = imageInput.files[0];
//   console.log(body);
//   console.log(image);
//   if (!body || !socket || !currentTaskId) return;

//   socket.emit('send_message', { task_id: currentTaskId, body,image });  // ← use stored ID
//   input.value = '';
//   imageInput.value = '';
// }

async function sendChat() {
  const input = document.getElementById('chatInput');
  const imageInput = document.getElementById('chatImage');

  const body = input.value.trim();
  const image = imageInput.files[0];

  if (!socket || !currentTaskId) return;

  // If image is selected
  if (image) {
  const formData = new FormData();

  if (body) {
    formData.append('body', body);
  }

  formData.append('image', image);

  try {
    const response = await fetch(
      `http://127.0.0.1:3000/api/v1/tasks/${currentTaskId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`
        },
        body: formData
      }
    );

    const result = await response.json();

    console.log(result);

    if (!response.ok) {
      console.error('Image message failed:', result);
      return;
    }

    const box = document.getElementById('chatMessages');

    box.insertAdjacentHTML(
      'beforeend',
      renderMsg(result.data.message)
    );

    box.scrollTop = box.scrollHeight;

  } catch (error) {
    console.error('Image upload failed:', error);
  }

  input.value = '';
  imageInput.value = '';

  return;
}

if (!body) return;
  socket.emit('send_message', {
    task_id: currentTaskId,
    body
  });
  input.value = '';
}

document.getElementById('chatInput')?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendChat();
});

document.getElementById('btnSendChat')?.addEventListener('click', sendChat);
document.getElementById('btnLogout')?.addEventListener('click', logout);