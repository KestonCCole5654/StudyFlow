// @ts-ignore
// deno-lint-ignore no-explicit-any
// @ts-nocheck
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

// @ts-ignore
const GEMINI_API_KEY = Deno.env.get('VITE_GEMINI_API_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { video_url } = await req.json()

    if (!video_url) {
      return new Response(JSON.stringify({ error: 'video_url is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const videoId = new URL(video_url).searchParams.get('v');
    let transcriptText = '';
    let usedFallback = false;
    let videoTitle = '';
    let videoDescription = '';

    // Try to fetch transcript
    const transcriptRes = await fetch(`https://youtube-transcript-api.vercel.app/api/transcript/${videoId}`);
    if (transcriptRes.ok) {
      const transcript = await transcriptRes.json(); // [{text: "...", ...}, ...]
      if (transcript && transcript.length > 0) {
        transcriptText = transcript.map(item => item.text).join(' ');
      }
    }

    // If transcript is missing, fallback to title/description
    if (!transcriptText) {
      // Fetch video details from YouTube Data API (if key is set)
      const YOUTUBE_API_KEY = Deno.env.get('VITE_YOUTUBE_API_KEY');
      if (YOUTUBE_API_KEY) {
        const detailsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`);
        if (detailsRes.ok) {
          const detailsData = await detailsRes.json();
          if (detailsData.items && detailsData.items.length > 0) {
            videoTitle = detailsData.items[0].snippet.title || '';
            videoDescription = detailsData.items[0].snippet.description || '';
          }
        }
      }
      if (!videoTitle && !videoDescription) {
        videoTitle = 'YouTube Video';
        videoDescription = 'No transcript or description available.';
      }
      usedFallback = true;
    }

    let questionPrompt = '';
    if (!usedFallback) {
      questionPrompt = `
        Based on the following transcript, please generate a quiz with multiple-choice questions.
        The quiz should have between 5 to 10 questions.
        Each question must have exactly 4 possible answers, and one of them must be the correct one.
        Return the quiz in JSON format. The JSON object should have a single key "quiz" which is an array of question objects.
        Each question object should have the following structure:
        {
          "question": "The question text",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "answer": "The correct option text"
        }

        Transcript:
        """
        ${transcriptText.substring(0, 14000)}
        """
      `;
    } else {
      questionPrompt = `
You are an educational quiz generator. Based only on the following YouTube video title and description, generate 5 multiple-choice questions. Each question must have 4 options and specify the correct answer. Respond ONLY with valid JSON in this format:

{
  "quiz": [
    {
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "answer": "Correct option text"
    }
  ]
}

Title: ${videoTitle}
Description: ${videoDescription}
`;
    }

    // Gemini API call
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: questionPrompt }] }]
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text();
      return new Response(JSON.stringify({ error: 'Failed to generate quiz from Gemini.', details: errorBody }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: geminiResponse.status,
      });
    }

    const geminiData = await geminiResponse.json();
    let geminiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    // Remove markdown code block if present
    geminiText = geminiText.replace(/```json|```/g, '').trim();
    let quizContent;
    try {
      quizContent = JSON.parse(geminiText);
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Gemini did not return valid JSON.', raw: geminiText }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ quiz: quizContent.quiz }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
}) 