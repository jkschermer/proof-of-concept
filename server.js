import "dotenv/config";
// laad env bestand

import express from "express";

import { Liquid } from "liquidjs";

const app = express(); 

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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
      // fetch("https://fdnd.directus.app/items/messages"),
      fetch("https://fdnd.directus.app/items/messages?filter[text][_eq]=like")
    ]);

    const messagesData = await messagesResponse.json();
    // console.log(messagesData);
    const peopleData = await peopleResponse.json();

    // console.log("Alle 'from' waarden in messages:", messagesData.data.map(m => m.from));

    const userId = 3; 

    const myLikes = messagesData.data.filter(like => like.from === `user-${userId}`);
    // console.log("myLikes:", myLikes);

    const likedUserIds = myLikes.map(like => {
      return like.for.split("-").pop();


    });

    const uniqueLikedUserIds = [...new Set(likedUserIds)];
    // console.log("uniqueLikedUserIds (zonder dubbele):", uniqueLikedUserIds);



    peopleData.forEach(user => {
      user.isLiked = uniqueLikedUserIds.includes(String(user.id));
      // console.log(`User ${user.id} (${user.name}) liked?`, user.isLiked);
    });



    // console.log(peopleData[0].tags[0]);
    // ik haal de eerst persoon op en de tag die daarbij hoort

    // console.log(peopleData);

    // eerst haal ik alle users op door foreach te gebruiken 
    // en dan doe ik dit ook bij de users.tags zodat ik alle tags kan ophalen
    // en dan kan ik de tags uitlezen

    const allTags = []; 
    // maak een lege array of lege lijst

    peopleData.forEach(users => {
      users.tags.forEach( tag => {
        allTags.push(tag);
   // met push (is een functie die je kan gebruiken op een arrray) voeg je het item toe aan de lijst all tags
        // console.log(allTags); 
      });
    });

    res.render("mensen-pagina", { 
      users: peopleData, 
      messages: messagesData.data,
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


 res.redirect('/mensen-pagina');

} catch (error) {
  console.error('Fout bij versturen bericht:', error);
  res.status(500).send('Kon bericht niet versturen');
}

});


app.post('/like/:id', async function (req, res) {
  const werknemerId  = req.params.id;
  const userId = 3; 

  console.log('userId (liker):', userId);
console.log('werknemerId (liked):', werknemerId);


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
  
  console.log('hoi');

  const responseData = await postResponse.json();
console.log(responseData);
  if (!postResponse.ok) throw new Error('Fout bij het liken');
  

  res.redirect('/mensen-pagina');

  // console.log('Like succesvol opgeslagen');

  // res.redirect('/mensen-pagina');

} catch (err) {
  console.error('Fout bij liken:', err.message);
  res.status(500).send('Kon niet liken');
}

});

app.get('/', (req, res) => {
  res.render('index');
  });
  

app.use((req, res) => {
  res.status(404).send('404 - Pagina niet gevonden');
});


// Stel het poortnummer in waar Express op moet gaan luisteren
// Lokaal is dit poort 8000; als deze applicatie ergens gehost wordt, waarschijnlijk poort 80
app.set("port", process.env.PORT || 8022);

// Start Express op, gebruik daarbij het zojuist ingestelde poortnummer op
app.listen(app.get("port"), function () {
  // Toon een bericht in de console
  console.log(`Daarna kun je via http://localhost:${app.get("port")}/ hi `);
});
