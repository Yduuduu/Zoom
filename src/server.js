import express from 'express';
import http from 'http';
import SocketIO from 'socket.io';
import path from 'path';

const __dirname = path.resolve();
const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/src/views');
app.use('/public', express.static(__dirname + '/src/public'));
app.get('/', (_, res) => res.render('home'));
app.get('/*', (_, res) => res.redirect('/'));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

function publicRooms() {
  // const sids = wsServer.socket.adapter.sids;
  // const rooms = wsServer.socket.adapter.rooms;
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

// 서버에서 연결하는 코드
wsServer.on('connection', (socket) => {
  // wsServer.socketsJoin('announcement');
  // 닉네임 초기값 설정
  socket['nickname'] = 'Anon';
  // socket에서 콘솔찍을 수 있음
  socket.onAny((event) => {
    console.log(`Socket Event:${event}`);
  });
  // 방 입장
  socket.on('enter_room', (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit('welcome', socket.nickname, countRoom(roomName));
    wsServer.sockets.emit('room_change', publicRooms());
  });
  // 연결 끊어지기 직전
  socket.on('disconnecting', () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit('bye', socket.nickname, countRoom(room) - 1)
    );
  });
  // 연결 끊어짐
  socket.on('disconnect', () => {
    wsServer.sockets.emit('room_change', publicRooms());
  });

  // 메세지 보내기
  socket.on('new_message', (msg, room, done) => {
    socket.to(room).emit('new_message', `${socket.nickname}: ${msg}`);
    done();
  });
  // 닉네임 설정
  socket.on('nickname', (nickname) => (socket['nickname'] = nickname));
});

// ------------ WebSocket ------------
// import WebSocket, { WebSocketServer } from 'ws';
// const wss = new WebSocketServer({ server });
// // 여러 브라우저의 소켓에 대한 값을 담기위한 배열
// const sockets = [];

// // 해당 로직은 프론트와 연결되기위한 필수과정은 아니다.
// // 아래 event listener은 backend와 연결한 각 브라우저를 위한 것.
// wss.on('connection', (socket) => {
//   sockets.push(socket);
//   socket['nickname'] = 'Anon'; // 브라우저의 갯수만큼 실행되는 부분
//   console.log('Connected to Server ✅');

// // 연결이 되지않았을 때 뜨는 함수
// function onSocketClose() {
//   console.log('Disconnected from the Browser ❌');
// }
//   // socket.on message는 특정 socket에서 메세지를 받았을 때 발생
//   socket.on('close', onSocketClose);

//   // 메세지 보내기
//   // 백엔드에게는 꼭 string으로 값 넘겨주기
//   socket.on('message', (msg) => {
//     const message = JSON.parse(msg);
//     // console.log(message.payload.toString());
//     // form의 타입의 갯수만큼 만들어주기.
//     switch (message.type) {
//       case 'new_message':
//         // forEach를 사용하여 연결된 모든 socket들에 접근가능함
//         sockets.forEach((aSocket) =>
//           aSocket.send(`${socket.nickname}: ${message.payload}`)
//         );
//         break;
//       case 'nickname':
//         socket['nickname'] = message.payload; // 소켓 안에 정보저장이 가능하다.
//         break;
//     }
//   });
// });

httpServer.listen(3000, handleListen);
