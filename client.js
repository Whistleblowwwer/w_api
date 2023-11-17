//Client test script (Only for tests)
import { io } from "socket.io-client";
import readline from "readline";

const socket = io("http://localhost:4000", {
  auth: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWRfdXNlciI6IjBiZmIyMzE2LTJmZTktNGMyMy1hYmE4LTE4Zjk3MDhjYTg2ZSIsImlhdCI6MTY5OTM3ODIxMSwiZXhwIjoxNjk5NjM3NDExfQ.8oGu_7e1hVU2HOPRybNVekNqe6h_7Gmbuj9ihvtGHKw",
  },
});

socket.on("connect", () => {
  console.log("Conectado al servidor");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Ingrese el ID del receptor: ', (_id_receiver) => {
    rl.setPrompt('Mensaje: ');
    rl.prompt();

    rl.on('line', (message) => {
      if (message.toLowerCase() === 'salir') {
        rl.close();
        socket.disconnect();
      } else {
        const messageData = {
          content: message,
          _id_sender: "0bfb2316-2fe9-4c23-aba8-18f9708ca86e",  
          _id_receiver
        };
        socket.emit('sendMessage', messageData);
        rl.prompt();
      }
    });
  });
});

socket.on("connect_error", (err) => {
  console.log("Error de conexión:", err.message);
});

socket.on("newMessage", (message) => {
  console.log("Nuevo mensaje:", message);
});

socket.on("disconnect", () => {
  console.log("Desconectado del servidor");
});
