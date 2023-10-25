// client.js para pruebas
import { io } from "socket.io-client";

const socket = io("http://localhost:4000", {
  auth: {
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWRfdXNlciI6ImUyNGM4YTY1LWQwOTUtNDg0NC05NWZhLWE5Y2EwYzliZmQ0YiIsImlhdCI6MTY5ODE4NTc4NSwiZXhwIjoxNjk4NDQ0OTg1fQ.eeMJ4RR7W8ysaW5-Yc_7vB5t8xqld_o6ZpQWVm-v8Js",
  },
});

socket.on("connect", () => {
  console.log("Conectado al servidor");
});

socket.on("connect_error", (err) => {
  console.log("Error de conexión:", err.message);
});

