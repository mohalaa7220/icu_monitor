const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();

const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow any origin
    methods: ["GET", "POST"],
  },
});

// Connection Database
mongoose
  .connect(
    "mongodb+srv://mohamed:dZSjIYupyl5Xqo41@cluster0.zfiscmb.mongodb.net/graduate_project?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Database Connection established");
  })
  .catch((err) => {
    console.log(err);
  });

// 1- Create Schema
const lambsSchema = new mongoose.Schema(
  {
    lamb_id: {
      type: Number,
      trim: true,
      unique: [true, "lamb id Must be unique"],
    },
    status: {
      type: String,
    },
  },
  { timestamps: true }
);

const Lambs = mongoose.model("Lambs", lambsSchema);

io.on("connection", (socket) => {
  console.log("Client connection");
  socket.on("icu", (data) => {
    const lambs = new Lambs({
      ecg: data.ecg,
      resp: data.resp,
      spo2: data.spo2,
      co2: data.co2,
      ibp: data.ibp,
      nibp: data.nibp,
    });
    console.log(data);
    lambs
      .save()
      .then(() => {
        io.emit("icu", data);
      })
      .catch((err) => console.log(err));
  });
});

const PORT = 8000;

server.listen(PORT, () => {
  console.log(`ws://localhost:${PORT}`);
});
