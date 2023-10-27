//Client test script (Only for tests)
import { io } from "socket.io-client";
import readline from "readline";

const socket = io("http://localhost:4000", {
  auth: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWRfdXNlciI6IjU1Y2VkMTdjLTIzNjktNDQ5MS05ZGEwLTg3ZmJmOTBkNTllYiIsImlhdCI6MTY5ODM1Mjk0NCwiZXhwIjoxNjk4NjEyMTQ0fQ.9Rw7HzTPpUy_NEzXwZpyCyxJ1e299K-LcQb7nXNoFUE",
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
          _id_sender: "55ced17c-2369-4491-9da0-87fbf90d59eb",  
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

