import "dotenv/config";
// laad env bestand

import express from "express";

import { Liquid } from "liquidjs";

const app = express();

import session from 'express-session';

app.use(session({
  secret: 'een_veilige_geheime_string', 
  resave: false,
  saveUninitialized: true,
}));

app.use(express.urlencoded({ extended: true }));
// app.use(express.json());

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

    // console.log(peopleData[0].tags[0]);
    // ik haal de eerst persoon op en de tag die daarbij hoort

    // console.log(peopleData);

    // eerst haal ik alle users op door foreach te gebruiken 
    // en dan doe ik dit ook bij de users.tags zodat ik alle tags kan ophalen
    // en dan kan ik de tags uitlezen

    peopleData.forEach(users => {
      users.tags.forEach( tags => {
      // console.log(tags)
      });
    });

    res.render("mensen-pagina", { 
      users: peopleData, 
      messages: messagesData.data,
      // newMessage: req.session.newMessage || null, }); 
      newMessages: req.session.newMessages || [], 
      likedMessages: req.session.likedMessages || []
    });
      // console.log(messagesData)

  } catch (err) {
    console.error("Fout bij ophalen:", err);
    res.status(500).send("Fout bij het ophalen van data");
  }
});

app.post('/mensen-pagina' , async (req, res) =>  {
  const { from, text } = req.body; 
  // Ik haal de data uit het formulier met request body
  // console.log(req.body)
  
 try { 
  const response = await fetch ('https://fdnd.directus.app/items/messages', {
   method: 'POST',
   headers: {
   'Content-Type':  'application/json',
   },
   body: JSON.stringify ({ from, text}),
 });

const newMessage = await response.json();
// console.log(newMessage);

if (!req.session.newMessages) {
  req.session.newMessages = [];
}

req.session.newMessages.push(newMessage.data);
console.log('Sessie newMessages:', req.session.newMessages);


 res.redirect('/mensen-pagina');

} catch (error) {
  console.error('Fout bij versturen bericht:', error);
  res.status(500).send('Kon bericht niet versturen');
}

});


app.post('/like/:id', async function (req, res) {
  const werknemerId  = req.params.id;
  const userId = 3; 
  console.log(werknemerId);


try {
  const postResponse = await fetch('https://fdnd.directus.app/items/messages', {
    method: 'POST',
    body: JSON.stringify({
      from: `user-${userId}`, 
      text: 'like',  
      for: `akiko-sprint-12-like-${werknemerId}`
    }),
    headers: {
        'Content-Type': 'application/json; charset=UTF-8'
    }
  });
  
  if (!postResponse.ok) throw new Error('Fout bij het liken');

  // console.log('Like succesvol opgeslagen');

  res.redirect('/mensen-pagina');

} catch (err) {
  console.error('Fout bij liken:', err.message);
  res.status(500).send('Kon niet liken');
}

});


// app.post('/like/:id', async(req,res)=> {
//   const likeId = req.params.id;
//   console.log(`Like ontvangen voor bericht ID: ${likeId}`);
//   try {

//     const getResponse = await fetch(`https://fdnd.directus.app/items/messages/${likeId}`);
//     if (!getResponse.ok) throw new Error('Bericht niet gevonden');
//     const messageData = await getResponse.json();

//     const currentLikes = messageData.data.likes || 0;

//     const patchResponse = await fetch(`https://fdnd.directus.app/items/messages/${likeId}`, {
//       method: 'PATCH',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify
//         ({ likes: currentLikes + 1 }),   
//     }); 

//     if (!patchResponse.ok) throw new Error('Kon likes niet updaten');

//     console.log(`Likes succesvol bijgewerkt voor bericht ID: ${likeId}`);

//     res.redirect('/mensen-pagina');

//   } catch (error) {
//     console.error('Fout bij liken:', error);
//     res.status(500).send('Kon niet liken');
//   }
// });
 
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
