import {Server,Socket,Namespace} from 'socket.io'
import socketMiddleware from './socketMiddleware';
import registerChatHandler from './chatHandler';

let io:Server;
const allowedOrigins = ['http://127.0.0.1:5500', 'http://localhost:5500', 'http://127.0.0.1:3000', 'http://localhost:3000'];
function initSocket(httpServer:any){
io = new Server(httpServer,{
    cors:{
    origin:allowedOrigins,
    methods:['GET','POST'],
    credentials:true,
  },
});
  const chatNamespace: Namespace = io.of('/chat');

  chatNamespace.use(socketMiddleware);
  chatNamespace.on('connection',(socket:Socket)=> {
  //  console.log(`connected successfully ${socket.id}`);
     registerChatHandler(chatNamespace,socket);
   socket.on('disconnect',()=>{
    // console.log(`disconnected client ${socket.id}`)
   });
});
return io;
}
function getIO(){
  if(!io){
    throw new Error('Socket.io not initialized');
  }
  return io;
}
export {initSocket,getIO}; 