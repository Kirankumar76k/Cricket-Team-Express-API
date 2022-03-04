const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const intializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running successfully at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error at ${error.message}`);
    process.exit(1);
  }
};
intializeDbAndServer();
app.get("/players/", async (request, response) => {
  const getAllPlayersQuery = `select * from cricket_team order by player_id`;
  const dbResponse = await db.all(getAllPlayersQuery);
  response.send(dbResponse);
});

app.post("players/", async (request, response) => {
  const playerDetails = request.body;
  const { player_name, jersey_number, role } = playerDetails;
  const insertQuery = `
    insert into cricket_team (player_name,jersey_number,role) 
    values (
        ${player_name},
        ${jersey_number},
        ${role});`;
  const dbResponse = await db.run(insertQuery);
  const playerId = dbResponse.lastId;
  response.send({ playerId: playerId });
});
