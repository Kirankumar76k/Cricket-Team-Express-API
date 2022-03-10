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
const getAllPlayerDbObject = (DbObject) => {
  return {
    playerId: DbObject.player_id,
    playerName: DbObject.player_name,
    jerseyNumber: DbObject.jersey_number,
    role: DbObject.role,
  };
};
app.get("/players/", async (request, response) => {
  const getAllPlayersQuery = `select * from cricket_team;`;
  const dbResponse = await db.all(getAllPlayersQuery);
  response.send(dbResponse.map((eachItem) => getAllPlayerDbObject(eachItem)));
});

//insert player

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const insertQuery = `
    INSERT INTO cricket_team(player_name,jersey_number,role) 
    values (
       '${playerName}','${jerseyNumber}','${role}');`;
  const dbResponse = await db.run(insertQuery);
  response.send("Player Added to Team");
});

//get one player

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerDetails = `select * from cricket_team 
  where player_id=${playerId}`;
  const dbResponse = await db.get(getPlayerDetails);
  response.send(getAllPlayerDbObject(dbResponse));
});

//update player

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const updatePlayer = `update cricket_team set 
    player_name = '${playerName}',
    jersey_number ='${jerseyNumber}',
    role= '${role}'
    where player_id = ${playerId};`;
  const dbResponse = await db.run(updatePlayer);
  response.send("Player Details Updated");
});

//delete player

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `
    delete from cricket_team where player_id = ${playerId};
    `;
  const dbResponse = await db.run(deleteQuery);
  response.send("Player Removed");
});
module.exports = app;
