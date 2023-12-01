//Client test script (Only for tests)
import { io } from "socket.io-client";
import readline from "readline";

const socket = io("http://localhost:4000", {
  auth: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWRfdXNlciI6IjQ2NTA0MzM5LTI1ZjAtNDc1Yy04ZTQxLTlmMTU4NGNlODRkMSIsImlhdCI6MTcwMTM5MzkwNywiZXhwIjoxNzAxNjUzMTA3fQ.XVceZX_O6QT3djJ5-FOBf6_C1pcE_HR_OIB2N5BWVeA",
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
          _id_sender: "46504339-25f0-475c-8e41-9f1584ce84d1",  
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
