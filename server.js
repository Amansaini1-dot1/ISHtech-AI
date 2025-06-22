const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

app.post('/generate', async (req, res) => {
  const { input } = req.body;

  if (!input) return res.status(400).json({ error: 'Missing input' });

  try {
    const prompt = `You are a startup strategy expert. Given this idea: "${input}", generate:\n\n1. Cost & time estimate\n2. Customer persona\n3. Marketing strategy\n4. Competitor insights\n\nRespond in JSON:\n{\n  "cost": "...",\n  "persona": "...",\n  "marketing": "...",\n  "competitors": "..."}`;

    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });

    const text = completion.data.choices[0].message.content;

    try {
      const json = JSON.parse(text);
      res.json(json);
    } catch {
      res.json({ fullText: text });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'GPT-4 error' });
  }
});

app.get("/", (req, res) => {
  res.send("✅ GPT-4 backend is live. Use POST /generate");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("✅ Server is running on port 3000");
});
