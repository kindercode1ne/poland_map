const express = require("express");
const mysql = require("mysql");
const axios = require("axios");
const cors = require("cors");
const app = express();
const port = 3000;

app.use(cors());

const db = mysql.createConnection({
  host: "localhost",
  user: "YOUR_USER",
  password: "YOUR_PASS",
  database: "YOUR_DB_NAME",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    process.exit(1);
  }
  console.log("Connected to MySQL database.");
});


app.get("/cities", (req, res) => {
  const adminCode = req.query.adminCode;
  if (!adminCode)
    return res.status(400).json({ error: "Missing adminCode parameter" });

  const query = "SELECT * FROM cities WHERE adminCode1 = ?";
  db.query(query, [adminCode], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    console.log(`Found ${results.length} cities for adminCode ${adminCode}`);
    res.json(results);
  });
});

app.get("/searchCity", async (req, res) => {
  const cityName = req.query.name;
  if (!cityName)
    return res.status(400).json({ error: "Missing name parameter" });

  const checkQuery = "SELECT * FROM cities WHERE name = ?";
  db.query(checkQuery, [cityName], async (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length > 0) {
      console.log(`City "${cityName}" found in DB.`);
      return res.json(results);
    } else {
      const username = "YOUR_GEONAMES_USER";
      const url = `http://api.geonames.org/searchJSON?name_startsWith=${encodeURIComponent(
        cityName
      )}&country=PL&featureClass=P&username=${username}`;

      try {
        const response = await axios.get(url);
        const data = response.data;

        if (data.geonames && data.geonames.length > 0) {
          const city = data.geonames[0];
          const insertQuery = `
                        INSERT IGNORE INTO cities (
                            adminCode1, lng, geonameId, toponymName, countryId, 
                            fcl, population, countryCode, name, fclName, 
                            adminCodes1, countryName, fcodeName, adminName1, lat, fcode
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;

          db.query(
            insertQuery,
            [
              city.adminCode1,
              parseFloat(city.lng),
              city.geonameId,
              city.toponymName,
              city.countryId,
              city.fcl,
              city.population,
              city.countryCode,
              city.name,
              city.fclName,
              city.adminCodes1?.ISO3166_2,
              city.countryName,
              city.fcodeName,
              city.adminName1,
              parseFloat(city.lat),
              city.fcode,
            ],
            (err, result) => {
              if (err) {
                console.error("Error saving city:", err);
              } else {
                console.log(`City "${city.name}" saved to DB.`);
              }
            }
          );

          return res.json([city]);
        } else {
          console.log(`City "${cityName}" not found in API.`);
          return res.status(404).json({ error: "City not found" });
        }
      } catch (error) {
        console.error("Error fetching city from API:", error);
        return res.status(500).json({ error: "API error" });
      }
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
