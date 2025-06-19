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
    const [peopleResponse,likesResponse, messagesResponse] = await Promise.all([
      fetch("https://the-sprint-api.onrender.com/people", {
        headers: {
          "X-API-Key": `${process.env.API_KEY}`,
        },
      }),
      fetch("https://fdnd.directus.app/items/messages?filter[text][_eq]=like"),
      fetch("https://fdnd.directus.app/items/messages"),
    ]);

    const likesData = await likesResponse.json();
    console.log(likesData);
    const messagesData = await messagesResponse.json();
    console.log(messagesData);
    const peopleData = await peopleResponse.json();
    console.log(peopleData);
    const allMessages = messagesData.data;

    const myUserName = 'Akikko'; // jouw naam als afzender
    
    // console.log(('alle berichten' + allMessages));

const myMessages = allMessages.filter(msg => {
  if (!msg.from) return false;
  return msg.from === myUserName;
});

console.log("Voorbeelden van from:", allMessages.slice(0, 10).map(m => m.from));


const myUser = peopleData.filter(person => {
  return person.name.trim().toLowerCase() === myUserName.toLowerCase();
});

const users = peopleData.map(person => person.name);
console.log(users);

console.log('mensen data' + peopleData);

console.log('Gebruiker gevonden:', myUser);

console.log('Berichten van Akikko:', myMessages);


    // Log alle 'from' waardes om te zien wat er in zit
    // console.log('Alle from waardes:', allMessages.map(m => m.from));

    // Robuuste filter voor user-3 berichten
    // const myUserId = 'user-3';
    // const myMessages = allMessages.filter(msg => {
    //   if (!msg.from) return false;
    //   return msg.from.trim() === myUserId;
    // });

    // console.log('Gefilterde berichten van user-3:', myMessages);

    // console.log("Alle 'from' waarden in messages:", messagesData.data.map(m => m.from));

    const userId = 3; 

    const myLikes = likesData.data.filter(like => like.from === `user-${userId}`);
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

    // const allMessages = messagesData.data;

    // const myUserName = 'Akikooo';

// const myMessages = allMessages.filter(msg => msg.from === myUserName);

    // const allMessages = messagesData.data.filter(msg => msg.text !== "like");

    // const newMessages = messagesData.data.filter(msg => msg.text !== 'like');

    // const myMessages = allMessages.filter(msg => msg.from === `user-${userId}`);

//     const allMessages = messagesData.data;
//     const myUserId = 'user-3'; // vaste user ID

//     const myMessages = allMessages.filter(msg => msg.from && msg.from.includes('3'));
// console.log('Gefilterde berichten:', myMessages);


// const myMessages = allMessages.filter(msg => msg.from === myUserId);
// console.log('Alle from waardes in messages:', allMessages.map(m => m.from));
peopleData.forEach(user => {
  console.log('gebruiker' + user.name);
  user.messages = allMessages.filter(m => m.for === user.name && m.from === 'Akikko');
  
  console.log(user.messages);
});


    res.render("mensen-pagina", { 
      users: peopleData, 
      likes: likesData.data,
      // messages: messagesData.data,
      messages: myMessages,
      myUser: myUser
    });
      // console.log(messagesData)

  } catch (err) {
    console.error("Fout bij ophalen:", err);
    res.status(500).send("Fout bij het ophalen van data");
  }
});

app.post('/mensen-pagina' , async (req, res) =>  {
  // const userId = 3;
  const { from, text, for: forUser } = req.body; 
  // Ik haal de data uit het formulier met request body
  // console.log(req.body)
  console.log('Request body:', req.body);

  console.log('POST /mensen-pagina ontvangen:', req.body);
  
 try { 
  const response = await fetch ('https://fdnd.directus.app/items/messages', {
   method: 'POST',
   headers: {
   'Content-Type':  'application/json',
   },
   body: JSON.stringify ({ from: 'Akikko', text, for: forUser  }),
 });

const newMessage = await response.json();
console.log(newMessage);

console.log('Bericht succesvol gepost, redirecting nu...');
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
