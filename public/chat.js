const socket = io();
const form = document.querySelector("#chat");
const authorInput = document.querySelector("#author");
const messageInput = document.querySelector("#message");
const sendButton = form.querySelector("button");
const connectionStatus = document.querySelector("#status");
const messages = document.querySelector("#messages");
const empty = document.querySelector("#empty");
const clock = new Intl.DateTimeFormat("uk-UA", { timeStyle: "medium" });

function showConnection(connected) {
  connectionStatus.textContent = connected
    ? "Підключено"
    : "Очікування підключення…";
  sendButton.disabled = !connected;
}

socket.on("connect", () => showConnection(true));
socket.on("disconnect", () => showConnection(false));
socket.on("connect_error", () => showConnection(false));

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const author = authorInput.value.trim();
  const text = messageInput.value.trim();

  if (!socket.connected || !author || !text) {
    return;
  }

  socket.emit("chat:message", { author, text });
  messageInput.value = "";
  messageInput.focus();
});

socket.on("chat:message", ({ author, text, time, automatic }) => {
  const nearBottom =
    messages.scrollHeight - messages.scrollTop - messages.clientHeight < 40;
  const entry = document.createElement("article");
  const name = document.createElement("strong");
  const timestamp = document.createElement("time");
  const body = document.createElement("p");

  entry.classList.toggle("automatic", automatic);
  name.textContent = author;
  timestamp.dateTime = new Date(time).toISOString();
  timestamp.textContent = clock.format(time);
  body.textContent = text;
  entry.append(name, timestamp, body);

  empty.remove();
  messages.append(entry);
  if (nearBottom) {
    messages.scrollTop = messages.scrollHeight;
  }
});
