// netlify/functions/intel.js
// POST { college, state } → returns { items: [...] }
// Uses Claude's knowledge — no web search tool required.

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { statusCode: 500, headers, body: JSON.stringify({ error: 'ANTHROPIC_API_KEY not set' }) };

  let college, collegeState;
  try {
    const body = JSON.parse(event.body || '{}');
    college = body.college;
    collegeState = body.state || '';
  } catch(e) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  if (!college) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing field: college' }) };

  const prompt = `You are a college intelligence analyst helping college counselors stay informed about developments at US colleges and universities.

Provide 3-4 significant, factual intelligence items about ${college}${collegeState ? ' in ' + collegeState : ''}. Draw on everything you know about this institution.

Cover areas such as: leadership changes (president/provost/dean), admissions trends and policy changes (test-optional status, acceptance rate trends, Early Decision policies), tuition and financial aid, endowment size and trends, US News or other rankings, academic reputation and notable programs, campus culture and student life, athletics, research strengths, any notable controversies or challenges, accreditation, and anything else a college counselor advising families should know.

Focus on information that would genuinely help a college counselor advise a family considering this school.

Respond ONLY with a raw JSON array. No markdown, no explanation, no text before or after. Start with [ and end with ].

[{"headline":"Concise headline under 12 words","summary":"2-3 sentences explaining what this means and why it matters to prospective students and families.","sentiment":"positive | negative | neutral","category":"Admissions | Leadership | Financials | Rankings | Campus Life | Academics | Athletics | Research | Controversy | Policy","sources":["Source or basis for this information"],"confidence":"high | medium | speculative","date":"approximate timeframe e.g. 2024-2025"}]`;

  let anthropicResponse;
  try {
    anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
  } catch(e) {
    return { statusCode: 502, headers, body: JSON.stringify({ error: 'Failed to reach Anthropic: ' + e.message }) };
  }

  let anthropicData;
  try {
    anthropicData = await anthropicResponse.json();
  } catch(e) {
    return { statusCode: 502, headers, body: JSON.stringify({ error: 'Anthropic returned non-JSON' }) };
  }

  if (!anthropicResponse.ok) {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({
        error: 'Anthropic error ' + anthropicResponse.status,
        detail: anthropicData
      })
    };
  }

  // Extract text from response
  let text = '';
  if (Array.isArray(anthropicData.content)) {
    for (const block of anthropicData.content) {
      if (block.type === 'text') text += block.text;
    }
  }

  text = text.trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/, '')
    .replace(/\s*```$/, '')
    .trim();

  const start = text.indexOf('[');
  const end   = text.lastIndexOf(']');

  if (start === -1 || end === -1) {
    return { statusCode: 200, headers, body: JSON.stringify({ items: [] }) };
  }

  let items;
  try {
    items = JSON.parse(text.slice(start, end + 1));
  } catch(e) {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: 'JSON parse failed: ' + e.message, raw: text.slice(0, 200) })
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ items: Array.isArray(items) ? items : [] }),
  };
};
