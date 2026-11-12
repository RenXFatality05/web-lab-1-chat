const express = require("express");
const { createServer } = require("node:http");
const path = require("node:path");
const { Server } = require("socket.io");
const { studentName, group, variant } = require("./student.json");

const app = express();
const server = createServer(app);
const io = new Server(server);
const port = Number(process.env.PORT ?? 3000);
const interval = (10 + variant) * 1000;

app.use(express.static(path.join(__dirname, "public")));

function sendMessage(author, text, automatic = false) {
  io.emit("chat:message", { author, text, automatic, time: Date.now() });
}

io.on("connection", (socket) => {
  socket.on("chat:message", (message) => {
    if (
      typeof message?.author !== "string" ||
      typeof message.text !== "string"
    ) {
      return;
    }

    const author = message.author.trim();
    const text = message.text.trim();

    if (!author || author.length > 40 || !text || text.length > 500) {
      return;
    }

    sendMessage(author, text);
  });
});

server.listen(port, () => {
  console.log(
    "Чат доступний за адресою http://localhost:" + server.address().port,
  );
  setInterval(() => {
    const text = `Автоматичне повідомлення від ст. ${studentName} гр. ${group} Варіант ${variant}`;
    sendMessage("Система", text, true);
  }, interval);
});
