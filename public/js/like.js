  document.querySelectorAll('.like-form').forEach(form => {
  form.addEventListener('submit', async (event) => {
  event.preventDefault(); // Voorkomt herladen van de pagina

  const likeIcon = form.querySelector('.like');

  try {
  likeIcon.src = 'assets/HeartFilled.svg';

  fetch(form.action, {
   method: 'POST',
   })
   
   if (!response.ok) {
        throw new Error('Liken mislukt op server');
      }
   
    } catch(err) {
    console.error('Error liken:', err);

     likeIcon.src = '/assets/HeartEmpty.svg';
      alert('Kon niet liken, probeer het later opnieuw.');
   }
 });
});

