//Client test script (Only for tests)
import { io } from "socket.io-client";
import readline from "readline";

const socket = io("http://localhost:4000", {
  auth: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWRfdXNlciI6IjRmMTBjMmFmLWQwMzAtNGI2NC05MGM0LWQwMDliYTVmNzhkOCIsImlhdCI6MTY5ODcxMDk1NywiZXhwIjoxNjk4OTcwMTU3fQ.sbZL-8OVIx_SQhyVPkqR1ppzKXc529VQ8QzBu7kh848",
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
          _id_sender: "4f10c2af-d030-4b64-90c4-d009ba5f78d8",  
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
