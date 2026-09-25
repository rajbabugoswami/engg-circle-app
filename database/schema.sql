

CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    quiz_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE,
    start_time TIME,
    duration INT DEFAULT 0, -- Total quiz duration in minutes (0 means no limit)
    default_time INT DEFAULT 30, -- Default time per question in seconds
    max_participants INT DEFAULT 1000,
    marks_per_q INT DEFAULT 10,
    negative_marks INT DEFAULT 0,
    organizer_name VARCHAR(255),
    institute_name VARCHAR(255),
    certificate_rank_limit INT DEFAULT 3,
    cert_generation_enabled BOOLEAN DEFAULT TRUE,
    auto_email_enabled BOOLEAN DEFAULT TRUE,
    cert_template_url VARCHAR(255),
    cert_template_config JSON,
    is_active BOOLEAN DEFAULT FALSE,
    status ENUM('PENDING', 'LIVE', 'COMPLETED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    question_text TEXT NOT NULL,
    image_url VARCHAR(255),
    option_a VARCHAR(255) NOT NULL,
    option_b VARCHAR(255) NOT NULL,
    option_c VARCHAR(255),
    option_d VARCHAR(255),
    correct_option ENUM('A', 'B', 'C', 'D') NOT NULL,
    marks INT DEFAULT 10,
    negative_marks INT DEFAULT 0,
    time_limit INT DEFAULT 30, -- seconds
    order_num INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    college VARCHAR(255),
    course VARCHAR(255),
    year VARCHAR(50),
    roll_number VARCHAR(100),
    phone VARCHAR(50),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    score INT DEFAULT 0,
    rank_pos INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    UNIQUE KEY event_email (event_id, email),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    participant_id INT NOT NULL,
    question_id INT NOT NULL,
    selected_option ENUM('A', 'B', 'C', 'D', 'NONE') DEFAULT 'NONE',
    is_correct BOOLEAN DEFAULT FALSE,
    time_taken INT DEFAULT 0, -- time taken in seconds
    marks_obtained INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY participant_question (participant_id, question_id),
    FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS certificates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    certificate_id VARCHAR(100) NOT NULL UNIQUE,
    participant_id INT NOT NULL,
    event_id INT NOT NULL,
    pdf_url VARCHAR(255),
    qr_url VARCHAR(255),
    status ENUM('PENDING', 'GENERATED', 'FAILED') DEFAULT 'PENDING',
    email_status ENUM('PENDING', 'SENT', 'FAILED') DEFAULT 'PENDING',
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS presentations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    slide_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);
