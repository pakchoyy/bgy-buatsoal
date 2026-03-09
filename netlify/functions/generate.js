// Netlify Function — Gemini Proxy
// API Key disimpan di Netlify Environment Variables (aman!)

exports.handler = async function(event) {
  // Hanya izinkan POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API Key belum diset di Netlify.' }) };
  }

  try {
    const body = JSON.parse(event.body);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: body.contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
            thinkingConfig: { thinkingBudget: 0 }  // matiin thinking → lebih cepat!
          }
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      return { statusCode: 400, body: JSON.stringify({ error: data.error.message }) };
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
