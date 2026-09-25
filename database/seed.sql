
-- Password is 'password123' (bcrypt hashed)
INSERT INTO admins (name, email, password) VALUES 
('Super Admin', 'admin@example.com', '$2b$10$3YmG0e9m3K/B.9tX3a1mMeEw.L5eKjO9QeM0s3iVpZkYV/j6A/WcO');

-- Seed Event
INSERT INTO events (admin_id, quiz_code, name, description, event_date, start_time, duration, default_time, max_participants, marks_per_q, negative_marks, is_active, status) VALUES
(1, 'QUIZ-2026-AI01', 'AI & Technology Quiz 2026', 'A mega quiz on Artificial Intelligence and modern technologies.', '2026-10-01', '10:00:00', 60, 30, 500, 10, 2, TRUE, 'PENDING');

-- Seed Questions
INSERT INTO questions (event_id, question_text, option_a, option_b, option_c, option_d, correct_option, order_num) VALUES
(1, 'Who is known as the father of Artificial Intelligence?', 'Alan Turing', 'John McCarthy', 'Geoffrey Hinton', 'Andrew Ng', 'B', 1),
(1, 'What does GPT stand for?', 'Generative Pre-trained Transformer', 'General Purpose Technology', 'Global Positioning Tracker', 'None of the above', 'A', 2),
(1, 'Which of the following is a type of deep learning architecture?', 'Decision Tree', 'Random Forest', 'Convolutional Neural Network (CNN)', 'K-Means', 'C', 3),
(1, 'What is the main application of NLP?', 'Image Recognition', 'Speech to Text', 'Database Indexing', 'Network Routing', 'B', 4),
(1, 'What is the full form of API?', 'Application Programming Interface', 'Applied Processing Interface', 'Automatic Programming Index', 'Application Process Integration', 'A', 5),
(1, 'Which language is widely used for AI and Machine Learning?', 'Java', 'C++', 'Python', 'PHP', 'C', 6),
(1, 'What is TensorFlow?', 'A web framework', 'A machine learning library', 'An operating system', 'A database', 'B', 7),
(1, 'Which company developed AlphaGo?', 'Google DeepMind', 'OpenAI', 'Microsoft', 'IBM', 'A', 8),
(1, 'What does CSS stand for in web development?', 'Cascading Style Sheets', 'Creative Style System', 'Computer Style Sheets', 'Colorful Style Sheets', 'A', 9),
(1, 'What is a neural network inspired by?', 'Human brain', 'Computer processors', 'Ant colonies', 'Genetic mutations', 'A', 10);

-- Seed Participants
INSERT INTO participants (event_id, name, email, college, phone) VALUES
(1, 'Rahul Kumar', 'rahul@example.com', 'IIT Delhi', '9876543210'),
(1, 'Priya Singh', 'priya@example.com', 'NIT Trichy', '9876543211'),
(1, 'Aman Gupta', 'aman@example.com', 'BITS Pilani', '9876543212'),
(1, 'Rohit Sharma', 'rohit@example.com', 'DTU', '9876543213'),
(1, 'Neha Sharma', 'neha@example.com', 'NSUT', '9876543214');
