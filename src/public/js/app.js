const socket = io();

const welcome = document.getElementById('welcome');
const form = welcome.querySelector('form');
const room = document.getElementById('room');

room.hidden = true;
let roomName;

// 메세지 추가 유틸 함수
function addMessage(message) {
  const ul = room.querySelector('ul');
  const li = document.createElement('li');
  li.innerText = message;
  ul.appendChild(li);
}

// 메세지 보내기
function handleMessageSubmit(event) {
  event.preventDefault();
  const input = room.querySelector('#msg input');
  const value = input.value;
  socket.emit('new_message', value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = '';
}

// 닉네임 설정
function handleNicknameSubmit(event) {
  event.preventDefault();
  const input = room.querySelector('#name input');
  socket.emit('nickname', input.value);
}

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector('h3');
  h3.innerText = `Room ${roomName}`;
  const msgForm = room.querySelector('#msg');
  const nameForm = room.querySelector('#name');
  msgForm.addEventListener('submit', handleMessageSubmit);
  nameForm.addEventListener('submit', handleNicknameSubmit);
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const input = form.querySelector('input');
  // 첫번째 argument -> event 이름
  // 두번째 argument -> 보내고 싶은 payload
  // 세번째 argument -> 서버에서 호출하는 function ❗️중요 => 여러 개의 argument를 보낼 수 있다.
  // 마지막 argument가 함수여야한다.
  // 클라이언트의 emit와 서버의 on은 같은 이름/string이여야 한다.
  socket.emit('enter_room', input.value, showRoom);
  roomName = input.value;
  input.value = '';
}

form.addEventListener('submit', handleRoomSubmit);

socket.on('welcome', (user, newCount) => {
  const h3 = room.querySelector('h3');
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${user} arrived!`);
});

socket.on('bye', (left, newCount) => {
  const h3 = room.querySelector('h3');
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${left} left ㅠㅠ`);
});

socket.on('new_message', addMessage);

socket.on('room_change', (rooms) => {
  const roomList = welcome.querySelector('ul');
  roomList.innerHTML = '';
  if (rooms.legnth === 0) {
    return;
  }
  rooms.forEach((room) => {
    const li = document.createElement('li');
    li.innerText = room;
    roomList.append(li);
  });
});

// ------------ WebSocket ------------
// // ws(WebSocket), wss(WebSocket Secure)
// // socket -> 서버와의 연결
// const messageList = document.querySelector('ul');
// const nickFrom = document.querySelector('#nick');
// const messageFrom = document.querySelector('#message');
// //
// const socket = new WebSocket(`ws://${window.location.host}`);

// // JSON 형식의 데이터를 string으로 변환하는 함수
// function makeMessage(type, payload) {
//   const msg = { type, payload };
//   return JSON.stringify(msg);
// }

// // 연결이 되었을 때 뜨는 함수
// function handlerOpen() {
//   console.log('Connected to Browser ✅');
// }

// // connection이 open일 때 사용하는 listener 등록
// socket.addEventListener('open', handlerOpen);

// // 메세지를 받았을 때 사용하는 listener
// socket.addEventListener('message', (message) => {
//   const li = document.createElement('li');
//   li.innerText = message.data;
//   messageList.append(li);
// });

// // 서버가 오프라인이 됐을 때 사용하는 listener
// socket.addEventListener('close', () => {
//   console.log('Disconnected from Server ❌');
// });

// // 닉네임 저장 함수
// function handleNickSubmit(event) {
//   event.preventDefault();
//   const input = nickFrom.querySelector('input');
//   // Json 형식으로 데이터 보내기
//   socket.send(makeMessage('nickname', input.value));
//   input.value = '';
// }

// // 대화를 보내는 함수
// function handleSubmit(event) {
//   event.preventDefault();
//   const input = messageFrom.querySelector('input');
//   socket.send(makeMessage('new_message', input.value));
//   input.value = '';
// }

// nickFrom.addEventListener('submit', handleNickSubmit);
// messageFrom.addEventListener('submit', handleSubmit);
