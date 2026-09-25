const pool = require('../config/db');

const getQuestions = async (req, res) => {
  try {
    const { eventId } = req.params;
    const [rows] = await pool.query('SELECT * FROM questions WHERE event_id = ? ORDER BY order_num ASC, created_at ASC', [eventId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const addQuestion = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { question_text, option_a, option_b, option_c, option_d, correct_option, marks, negative_marks, time_limit } = req.body;
    let image_url = null;
    if (req.file) {
      image_url = `/uploads/questions/${req.file.filename}`;
    }
    
    // Check if event belongs to admin
    const [events] = await pool.query('SELECT id FROM events WHERE id = ? AND admin_id = ?', [eventId, req.admin.id]);
    if (events.length === 0) return res.status(403).json({ message: 'Unauthorized' });

    const [result] = await pool.query(
      `INSERT INTO questions (event_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, negative_marks, time_limit, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [eventId, question_text, option_a, option_b, option_c, option_d, correct_option, marks || 10, negative_marks || 0, time_limit || 30, image_url]
    );

    res.status(201).json({ id: result.insertId, message: 'Question added' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const generateQuestionsWithAI = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { prompt, count = 5, marks = 10, negativeMarks = 0, timeLimit = 30 } = req.body;
    
    const [events] = await pool.query('SELECT id FROM events WHERE id = ? AND admin_id = ?', [eventId, req.admin.id]);
    if (events.length === 0) return res.status(403).json({ message: 'Unauthorized' });

    if (!process.env.OPENAI_API_KEY) {
      return res.status(400).json({ message: 'OPENAI_API_KEY not configured on server' });
    }

    const { OpenAI } = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const systemInstruction = `You are a quiz question generator. Generate exactly ${count} multiple choice questions about the following topic or instructions: "${prompt}". 
Output strictly as a JSON object containing a "questions" array.
Each object in the "questions" array must have these exact keys:
"question_text": The question string.
"option_a": First option string.
"option_b": Second option string.
"option_c": Third option string.
"option_d": Fourth option string.
"correct_option": The correct option strictly as one of: "A", "B", "C", "D".`;

    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: systemInstruction }],
        response_format: { type: "json_object" }
    });
    
    let rawText = response.choices[0].message.content.trim();
    let questionsArray;
    try {
      const parsed = JSON.parse(rawText);
      questionsArray = parsed.questions || Object.values(parsed)[0];
    } catch (e) {
      throw new Error("AI returned invalid JSON: " + rawText);
    }

    let inserted = 0;
    for (let q of questionsArray) {
      await pool.query(
        `INSERT INTO questions (event_id, question_text, option_a, option_b, option_c, option_d, correct_option, marks, negative_marks, time_limit)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [eventId, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option, marks, negativeMarks, timeLimit]
      );
      inserted++;
    }

    res.json({ message: `Successfully generated and added ${inserted} questions!`, inserted });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ message: 'Failed to generate questions. Ensure your prompt is clear and API key is valid.', error: error.message });
  }
};

module.exports = { getQuestions, addQuestion, generateQuestionsWithAI };
