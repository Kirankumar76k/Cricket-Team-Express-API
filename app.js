const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
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
initializeDBAndServer();
app.get("/players/", async (request, response) => {
  const getAllPlayersQuery = `select * from cricket_team order by player_id`;
  const dbResponse = await db.all(getAllPlayersQuery);
  response.send(dbResponse);
});

//insert player

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { player_name, jersey_number, role } = playerDetails;
  const insertQuery = `
    INSERT INTO cricket_team(player_name,jersey_number,role) 
    values (
       '${player_name}','${jersey_number}','${role}');`;
  const dbResponse = await db.run(insertQuery);
  const playerId = dbResponse.lastID;
  response.send({ playerId: playerId });
});

//get one player

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetails = `select * from cricket_team 
  where player_id=${playerId}`;
  const dbResponse = await db.get(getPlayerDetails);
  response.send(dbResponse);
});

//update player

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { player_name, jersey_number, role } = request.body;
  const updatePlayer = `update cricket_team set 
    player_name = '${player_name}',
    jersey_number ='${jersey_number}',
    role= '${role}'
    where player_id = ${playerId};`;
  const dbResponse = db.run(updatePlayer);
  response.send("updated Successfully");
});

//delete player

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `
    delete from cricket_team where player_id = ${playerId};
    `;
  const dbResponse = db.run(deleteQuery);
  response.send("deleted successfully");
});
module.exports = app;
