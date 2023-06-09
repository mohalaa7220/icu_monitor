const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const moment = require("moment");

const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const Lambs = require("./Model/icuModel");

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

io.on("connection", (socket) => {
  console.log("Client connection");

  socket.on("icu", (data) => {
    const { ecg, resp, spo2, co2, ibp, nibp } = data;
    const lambs = new Lambs({
      ecg: ecg || null,
      resp: resp || null,
      spo2: spo2 || null,
      co2: co2 || null,
      ibp: ibp || null,
      nibp: nibp || null,
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

app.use("/last_read", async (req, res) => {
  const { selected_date } = req.query;

  if (!selected_date) {
    const data = await Lambs.find().sort({ createdAt: -1 }).limit(5);
    res.send({ data });
  } else {
    const startDate = moment(selected_date).startOf("day").toDate();
    const endDate = moment(selected_date).endOf("day").toDate();

    const data = await Lambs.find({
      createdAt: { $gte: startDate, $lt: endDate },
    })
      .sort({ createdAt: -1 })
      .limit(5);

    res.send({ data });
  }
});

const PORT_2 = 9001;

app.listen(PORT_2, () => {
  console.log(`http://localhost:${PORT_2}`);
});

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`ws://localhost:${PORT}`);
});
