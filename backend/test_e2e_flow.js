const axios = require('axios');
const io = require('socket.io-client');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const API_URL = 'http://localhost:5000/api';
const SOCKET_URL = 'http://localhost:5000';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTest() {
  console.log("🚀 Starting End-to-End Automated Test Flow...\n");
  
  try {
    // 1. Admin Login
    console.log("1. Admin logging in...");
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'password123'
    });
    const adminToken = loginRes.data.token;
    console.log("   ✅ Admin logged in successfully.\n");

    // 2. Create Event
    console.log("2. Creating a test event...");
    const eventRes = await axios.post(`${API_URL}/events`, {
      name: 'E2E Automated Test Event',
      date: new Date().toISOString().split('T')[0],
      auto_email_enabled: false,
      cert_generation_enabled: true,
      certificate_rank_limit: 3
    }, { headers: { Authorization: `Bearer ${adminToken}` } });
    const eventId = eventRes.data.id;
    const quizCode = eventRes.data.quiz_code;
    console.log(`   ✅ Event created. ID: ${eventId}, Code: ${quizCode}\n`);

    // 3. Add Question
    console.log("3. Adding a question to the event...");
    const form = new FormData();
    form.append('question_text', 'What is 2 + 2?');
    form.append('option_a', '3');
    form.append('option_b', '4');
    form.append('option_c', '5');
    form.append('option_d', '6');
    form.append('correct_option', 'B');
    form.append('marks', '10');
    form.append('negative_marks', '0');
    form.append('time_limit', '15'); // 15 seconds

    const qRes = await axios.post(`${API_URL}/events/${eventId}/questions`, form, {
      headers: { 
        Authorization: `Bearer ${adminToken}`,
        ...form.getHeaders()
      }
    });
    const questionId = qRes.data.id;
    const questionData = qRes.data; // Note: actual endpoint returns the question object or just message? 
    // Wait, the API returns { message: 'Question added', insertId: ... }
    console.log("   ✅ Question added successfully.\n");

    // Fetch the question to get the full object (needed for socket)
    const questionsListRes = await axios.get(`${API_URL}/events/${eventId}/questions`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const theQuestion = questionsListRes.data[0];

    // 4. Register Participants
    console.log("4. Registering 3 Participants...");
    const participants = [
      { name: 'Student Fast', email: 'fast@test.com', phone: '1111111111' },
      { name: 'Student Medium', email: 'med@test.com', phone: '2222222222' },
      { name: 'Student Slow', email: 'slow@test.com', phone: '3333333333' },
    ];
    
    for (let i=0; i<participants.length; i++) {
      const p = participants[i];
      await axios.post(`${API_URL}/participants/register`, {
        quizCode: quizCode,
        name: p.name,
        email: p.email,
        phone: p.phone,
        college: 'Test College'
      });
      console.log(`   ✅ Registered: ${p.name}`);
    }

    // 4.5 Make event Active
    console.log("\n4.5 Admin makes event Active...");
    await axios.put(`${API_URL}/events/${eventId}`, {
      is_active: true,
      status: 'LIVE'
    }, { headers: { Authorization: `Bearer ${adminToken}` } });

    // 4.6 Participants Join
    console.log("4.6 Participants joining the live quiz...");
    for (let i=0; i<participants.length; i++) {
      const p = participants[i];
      const res = await axios.post(`${API_URL}/participants/join`, {
        quizCode: quizCode,
        email: p.email
      });
      participants[i].id = res.data.participantId;
      console.log(`   ✅ Joined: ${p.name} (ID: ${participants[i].id})`);
    }
    console.log("");

    // 5. Connect Sockets
    console.log("5. Initializing Sockets...");
    const adminSocket = io(SOCKET_URL);
    adminSocket.emit('admin_join', { quizCode });
    
    const pSockets = participants.map(p => {
      const s = io(SOCKET_URL);
      s.emit('participant_join', { quizCode, participantId: p.id });
      return s;
    });
    
    await delay(1000); // Wait for connections
    console.log("   ✅ Sockets connected.\n");

    // 6. Admin starts quiz
    console.log("6. Admin starting quiz...");
    adminSocket.emit('admin_action', { action: 'start_quiz', quizCode });
    await delay(500);

    // 7. Admin starts question
    console.log("7. Admin broadcasting Question 1...");
    adminSocket.emit('start_question', { quizCode, question: theQuestion, timeLimit: 15 });
    
    await delay(1000); // 1 second elapsed

    // 8. Participants answer at different speeds
    console.log("8. Participants submitting answers...");
    
    // Fast student answers at 1 second in (Total time ~1s)
    pSockets[0].emit('submit_answer', { quizCode, participantId: participants[0].id, questionId: theQuestion.id, answer: 'B' });
    console.log("   ✅ Student Fast answered 'B' (correct) at ~1s");
    
    await delay(2000); // Total 3 seconds elapsed
    
    // Medium student answers at 3 seconds in
    pSockets[1].emit('submit_answer', { quizCode, participantId: participants[1].id, questionId: theQuestion.id, answer: 'B' });
    console.log("   ✅ Student Medium answered 'B' (correct) at ~3s");
    
    await delay(2000); // Total 5 seconds elapsed
    
    // Slow student answers at 5 seconds in
    pSockets[2].emit('submit_answer', { quizCode, participantId: participants[2].id, questionId: theQuestion.id, answer: 'B' });
    console.log("   ✅ Student Slow answered 'B' (correct) at ~5s");
    
    // 9. Wait for question timer to end naturally or force end (socket has authoritative timer)
    console.log("\nWaiting for question timer to end (10 seconds remaining)...");
    await delay(11000); 

    // 10. End Quiz
    console.log("\n9. Admin ending quiz...");
    adminSocket.emit('admin_action', { action: 'end_quiz', quizCode });
    
    // Wait for bulk certificate generation to run in background
    console.log("   Waiting 2 seconds for bulk certificate generation to complete...");
    await delay(2000);
    
    // 11. Fetch Final Results
    console.log("\n10. Fetching Final Results and Ranks...");
    const resultsRes = await axios.get(`${API_URL}/events/${eventId}/results`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    const finalResults = resultsRes.data.results;
    
    console.log("\n🏆 FINAL LEADERBOARD 🏆");
    finalResults.forEach((r, idx) => {
      console.log(`Rank ${r.rank_pos || idx + 1}: ${r.name} | Score: ${r.score} | Cert ID: ${r.certificate_id || 'NONE'}`);
    });

    // 12. Validations
    console.log("\n🔍 Running Validations...");
    let passed = true;
    
    if (finalResults[0].name !== 'Student Fast') {
      console.error("   ❌ FAILED: Fast student should be Rank 1");
      passed = false;
    } else {
      console.log("   ✅ PASSED: Fast student is Rank 1");
    }
    
    if (finalResults[1].name !== 'Student Medium') {
      console.error("   ❌ FAILED: Medium student should be Rank 2");
      passed = false;
    } else {
      console.log("   ✅ PASSED: Medium student is Rank 2");
    }
    
    if (finalResults[2].name !== 'Student Slow') {
      console.error("   ❌ FAILED: Slow student should be Rank 3");
      passed = false;
    } else {
      console.log("   ✅ PASSED: Slow student is Rank 3");
    }
    
    if (!finalResults[0].certificate_id) {
      console.error("   ❌ FAILED: Certificates were not generated automatically");
      passed = false;
    } else {
      console.log("   ✅ PASSED: Certificates were generated automatically");
    }

    if (passed) {
      console.log("\n🎉 ALL TESTS PASSED SUCESSFULLY! Event flow is robust.");
    } else {
      console.log("\n⚠️ SOME TESTS FAILED.");
    }

    // Cleanup
    adminSocket.disconnect();
    pSockets.forEach(s => s.disconnect());
    process.exit(0);

  } catch (error) {
    console.error("TEST FATAL ERROR:");
    if (error.response) {
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

runTest();
