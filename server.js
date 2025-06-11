import "dotenv/config";
// laad env bestand

import express from "express";

import { Liquid } from "liquidjs";

const app = express();

app.use(express.urlencoded({ extended: true }));

const engine = new Liquid();
app.engine("liquid", engine.express());
app.set("view engine", "liquid");
app.set("views", "./views");

app.use(express.static("public"));

app.get("/mensen-pagina", async (req, res) => {
  try {
    const [peopleResponse, messagesResponse] = await Promise.all([
      fetch("https://the-sprint-api.onrender.com/people", {
        headers: {
          "X-API-Key": `${process.env.API_KEY}`,
        },
      }),
      fetch("https://fdnd.directus.app/items/messages"),
    ]);

    const messagesData = await messagesResponse.json();
    const peopleData = await peopleResponse.json();

    console.log(messagesData);

    res.render("mensen-pagina", { 
      users: peopleData, 
      messages: messagesData });

  } catch (err) {
    console.error("Fout bij ophalen:", err);
    res.status(500).send("Fout bij het ophalen van data");
  }
});

app.get("/", async function (request, response) {
  response.render("index.liquid", {});
});

// Stel het poortnummer in waar Express op moet gaan luisteren
// Lokaal is dit poort 8000; als deze applicatie ergens gehost wordt, waarschijnlijk poort 80
app.set("port", process.env.PORT || 8022);

// Start Express op, gebruik daarbij het zojuist ingestelde poortnummer op
app.listen(app.get("port"), function () {
  // Toon een bericht in de console
  console.log(`Daarna kun je via http://localhost:${app.get("port")}/ hi `);
});
