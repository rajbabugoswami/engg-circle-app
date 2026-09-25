fetch('https://engg-circle-backend.onrender.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'sidhnath9670992769@gmail.com', password: 'Sidhnath@1' })
}).then(async res => console.log(res.status, await res.text())).catch(console.error);
