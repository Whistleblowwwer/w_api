//Client test script (Only for tests)
import { io } from "socket.io-client";
import readline from "readline";

const socket = io("http://localhost:4000", {
  auth: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWRfdXNlciI6IjIzZmViMDhiLTFkY2UtNGI0OC1hMGIwLTQ2YTg0NjgyMjA3YyIsImlhdCI6MTcwMTM4NTMwNCwiZXhwIjoxNzAxNjQ0NTA0fQ.rSpHRvPcTOkAEi4U36bkFQ4Gxl8jxH5U_VIEkkmYVZQ",
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
          _id_sender: "23feb08b-1dce-4b48-a0b0-46a84682207c",  
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
