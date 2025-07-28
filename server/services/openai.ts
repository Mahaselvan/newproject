import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ExplanationEvaluation {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  concepts: string[];
  clarity: number;
  accuracy: number;
  completeness: number;
}

export async function evaluateExplanation(
  explanationText: string,
  topicTitle: string,
  feedbackMode: 'baby' | 'troll' | 'socratic' | 'teacher'
): Promise<ExplanationEvaluation> {
  const modePrompts = {
    baby: "You are a very encouraging, gentle AI tutor who gives simple, positive feedback. Use encouraging words and focus on what the student did well. Keep language simple and supportive.",
    troll: "You are a challenging AI tutor who asks tough questions and points out weaknesses. Be provocative but constructive. Challenge the student to think deeper.",
    socratic: "You are a Socratic method AI tutor. Ask probing questions that help the student discover gaps in their understanding. Guide them to insights through questions.",
    teacher: "You are a professional, experienced teacher who provides detailed, structured feedback. Be thorough and educational in your evaluation."
  };

  const prompt = `${modePrompts[feedbackMode]}

Please evaluate this student explanation of "${topicTitle}":

"${explanationText}"

Provide a comprehensive evaluation in JSON format with:
- score: Overall score from 0-100
- feedback: Detailed feedback based on the selected mode
- strengths: Array of what the student did well
- improvements: Array of areas for improvement
- concepts: Array of key concepts the student demonstrated understanding of
- clarity: Score 0-100 for how clearly the explanation was communicated
- accuracy: Score 0-100 for factual correctness
- completeness: Score 0-100 for how complete the explanation was

Consider the explanation's accuracy, clarity, completeness, and pedagogical value.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert AI tutor evaluating student explanations. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const evaluation = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      score: Math.max(0, Math.min(100, evaluation.score || 0)),
      feedback: evaluation.feedback || "No feedback provided",
      strengths: evaluation.strengths || [],
      improvements: evaluation.improvements || [],
      concepts: evaluation.concepts || [],
      clarity: Math.max(0, Math.min(100, evaluation.clarity || 0)),
      accuracy: Math.max(0, Math.min(100, evaluation.accuracy || 0)),
      completeness: Math.max(0, Math.min(100, evaluation.completeness || 0)),
    };
  } catch (error) {
    console.error('OpenAI evaluation error:', error);
    throw new Error("Failed to evaluate explanation: " + (error as Error).message);
  }
}

export async function transcribeAudio(audioBuffer: Buffer): Promise<{ text: string }> {
  try {
    // Create a temporary file for the audio
    const tempFile = new File([audioBuffer], "audio.webm", { type: "audio/webm" });
    
    const transcription = await openai.audio.transcriptions.create({
      file: tempFile,
      model: "whisper-1",
    });

    return {
      text: transcription.text || "",
    };
  } catch (error) {
    console.error('Whisper transcription error:', error);
    throw new Error("Failed to transcribe audio: " + (error as Error).message);
  }
}

export async function generateReportInsights(userData: any): Promise<string> {
  const prompt = `Analyze this student's learning data and provide insights:

Data: ${JSON.stringify(userData)}

Generate a personalized report focusing on:
- Learning progress and growth
- Strengths and areas for improvement  
- Specific recommendations for continued learning
- Motivational feedback

Keep it encouraging and actionable.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an educational AI that creates personalized learning reports."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
    });

    return response.choices[0].message.content || "No insights generated";
  } catch (error) {
    console.error('Report insights error:', error);
    throw new Error("Failed to generate insights: " + (error as Error).message);
  }
}
