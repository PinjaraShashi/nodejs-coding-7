const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(7000, () => {
      console.log("server is running at http://localhost:7000/");
    });
  } catch (e) {
    console.log(`db error is ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//1. GET ALL PLAYERS

app.get("/players/", async (request, response) => {
  const getPlayerDetailsQuery = `
    SELECT 
    player_id AS playerId,
    player_name AS playerName
    FROM 
    player_details
    `;
  const getPlayerDetailsArray = await db.all(getPlayerDetailsQuery);
  response.send(getPlayerDetailsArray);
});

//2 . GET SPECIFIC PLAYER

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getSpecificPlayerQuery = `
    SELECT 
    player_id AS playerId,
    player_name AS playerName
    FROM
    player_details
    WHERE
    player_id = ${playerId}
    `;
  const getSpecificPlayerArray = await db.get(getSpecificPlayerQuery);
  response.send(getSpecificPlayerArray);
});

// 3. UPDATE PLAYER DETAILS

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName } = playerDetails;
  const updatePlayerDetails = `
    UPDATE
    player_details
    SET
    player_name = '${playerName}'
    WHERE
    player_id = ${playerId}
    `;
  await db.run(updatePlayerDetails);
  response.send("Player Details Updated");
});

//4. GET MATCH DETAILS

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const specificMatchDetails = `
    SELECT
    match_id AS matchId,
    match,
    year
    FROM
    match_details
    WHERE
    match_id = ${matchId}
    `;
  const getSpecificMatchDetailsArray = await db.get(specificMatchDetails);
  response.send(getSpecificMatchDetailsArray);
});

//5 . GET LIST OF MATCHES OF PLAYER

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchDetailsQuery = `
    SELECT
    match_id AS matchId,
    match,
    year
    FROM
    player_match_score
        NATURAL JOIN match_details
    WHERE
        player_id = ${playerId}
    `;
  const playerMatches = await db.all(getPlayerMatchDetailsQuery);
  response.send(playerMatches);
});

//6. LIST OF PLAYERS OF SPECIFIC MATCH

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getPlayerSpecificMatchQuery = `
    SELECT
    player_id AS playerId,
    player_name As playerName
    FROM
    player_details
    NATURAL JOIN
    player_match_score 
    WHERE 
    match_id = ${matchId}
    `;
  const getPlayerSpecificMatchArray = await db.all(getPlayerSpecificMatchQuery);
  response.send(getPlayerSpecificMatchArray);
});

// 7. LAST

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getStatisticsQuery = `
    SELECT
    player_id AS payerId,
    player_name AS playerName,
    SUM(score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes
    FROM
    player_details
    NATURAL JOIN player_match_score
    WHERE
    player_id = ${playerId}
    `;
  const stats = await db.get(getStatisticsQuery);
  console.log(stats);
  response.send(stats);
});

module.exports = app;
