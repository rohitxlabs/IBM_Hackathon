import { NextRequest, NextResponse } from 'next/server';
import { validateGeminiResponse, sanitizeQuestions } from '@/lib/validation';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

function createPrompt(topic: string): string {
  return `Generate exactly 10 high-quality multiple-choice quiz questions about the topic: ${topic}.

Requirements:
- Exactly 10 questions
- Every question must have exactly 4 options
- Each question must have exactly one correct answer
- Questions should be factually accurate
- Questions should cover different aspects of the topic rather than repeating the same concept
- Mix easy, medium, and difficult questions
- Include a short explanation for every correct answer
- Return ONLY valid JSON
- Do not include markdown
- Do not include \`\`\`json or any other surrounding text

Return this exact structure:
{
  "questions": [
    {
      "id": 1,
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": "...",
      "explanation": "..."
    }
  ]
}`;
}

function extractJsonFromText(text: string): unknown {
  let cleaned = text.trim();

  const fenceRegex = /```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/;
  const fenceMatch = cleaned.match(fenceRegex);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  const jsonStart = cleaned.indexOf('{');
  const jsonEnd = cleaned.lastIndexOf('}');
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
  }

  return JSON.parse(cleaned);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic } = body;

    if (!topic || typeof topic !== 'string' || topic.trim() === '') {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    const prompt = createPrompt(topic.trim());

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', response.status, errorData);
      return NextResponse.json(
        { error: 'Failed to generate quiz. Please check your API key and try again.' },
        { status: 500 }
      );
    }

    const data = await response.json();

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      console.error('No text in Gemini response:', JSON.stringify(data));
      return NextResponse.json(
        { error: 'Invalid response from AI' },
        { status: 500 }
      );
    }

    let parsedData: unknown;
    try {
      parsedData = extractJsonFromText(generatedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      console.error('Raw text:', generatedText);
      return NextResponse.json(
        { error: 'Failed to parse quiz data' },
        { status: 500 }
      );
    }

    const validation = validateGeminiResponse(parsedData);
    if (!validation.isValid) {
      console.error('Validation failed:', validation.error);
      return NextResponse.json(
        { error: validation.error || 'Invalid quiz data' },
        { status: 500 }
      );
    }

    const questions = sanitizeQuestions(parsedData);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Quiz generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
