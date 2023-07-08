const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const moment = require("moment");
const { Pool } = require("pg");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const pool = new Pool({
  connectionString:
    "postgres://icu_bgn1_user:32rSkAlzfY1bj93kDd7n3DhXEYc7gmfg@dpg-ch0rn433cv203bt3ndgg-a.oregon-postgres.render.com/icu_bgn1",
  ssl: {
    rejectUnauthorized: false,
  },
});

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

pool
  .connect()
  .then(() => {
    console.log("Database connection established");
  })
  .catch((err) => {
    console.error("Error connecting to database", err.message);
  });

io.on("connection", (socket) => {
  console.log("Client connection");

  const patient_id = socket.handshake.query.patient_id;

  socket.on("icu", (data) => {
    const { ecg, resp, spo2, co2, ibp, nibp } = data;
    const created = new Date();
    const query = `
        INSERT INTO "users_patientmonitor" (patient_id, ecg, resp, spo2, co2, ibp, nibp,created)
        VALUES ($1, $2, $3, $4, $5, $6, $7,$8)
      `;
    const values = [
      patient_id,
      ecg || null,
      resp || null,
      spo2 || null,
      co2 || null,
      ibp || null,
      nibp || null,
      created,
    ];

    pool
      .query(query, values)
      .then(() => {
        io.emit("icu", data);
      })
      .catch((err) => console.log(err.message));
  });
});

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`ws://localhost:${PORT}`);
});
