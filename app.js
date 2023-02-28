const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

function convertToCamelCase(obj) {
  return {
    playerId: obj.player_id,
    playerName: obj.player_name,
    jerseyNumber: obj.jersey_number,
    role: obj.role,
  };
}

let initializingDbandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server stated listening...");
    });
  } catch (err) {
    console.log(`There has been ${err.message}`);
    process.exit(1);
  }
};
initializingDbandServer();

// get all players
app.get("/players/", async (req, res) => {
  let sqlQuery = `
        SELECT *
        FROM cricket_team;
    `;
  const dbResponse = await db.all(sqlQuery);
  const finalResponse = [];
  for (let item of dbResponse) {
    finalResponse.push(convertToCamelCase(item));
  }
  //   console.log(finalResponse);

  res.send(finalResponse);
});

// get single player
app.get("/players/:id/", async (req, res) => {
  const { id } = req.params;
  let sqlQuery = `
        SELECT *
        FROM cricket_team
        WHERE player_id = ${id};
    `;
  const dbResponse = await db.get(sqlQuery);
  //   console.log(dbResponse);
  res.send(convertToCamelCase(dbResponse));
});

// post a new player
app.post("/players/", async (req, res) => {
  let playerDetails = req.body;
  const { playerId, playerName, jerseyNumber, role } = playerDetails;
  console.log(playerDetails);
  const sqlQuery = `
        INSERT INTO
            cricket_team (player_name, jersey_number, role)
            VALUES (
            '${playerName}', 
            ${jerseyNumber}, 
            '${role}');
    `;
  const dbResponse = await db.run(sqlQuery);
  console.log(dbResponse);
  res.send("Player Added to Team");
});

// post a new player
app.put("/players/:id", async (req, res) => {
  let playerDetails = req.body;
  const { id } = req.params;
  const { playerName, jerseyNumber, role } = playerDetails;
  const sqlQuery = `
        UPDATE
            cricket_team
        SET
            player_name = '${playerName}', 
            jersey_number = ${jerseyNumber}, 
            role = '${role}'
        WHERE player_id = ${id};
    `;
  const dbResponse = await db.run(sqlQuery);
  res.send("Player Details Updated");
});

// delete player
app.delete("/players/:id", async (req, res) => {
  const { id } = req.params;
  let sqlQuery = `
        DELETE FROM 
            cricket_team
            WHERE player_id = ${id};
    `;
  await db.run(sqlQuery);
  res.send("Player Removed");
});

module.exports = app;
