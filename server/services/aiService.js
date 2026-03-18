const axios = require('axios');

// Using the verified free model or from .env
const DEFAULT_MODEL = process.env.AI_MODEL || "google/gemma-3-27b-it:free";

const callAI = async (prompt) => {
  try {
    const baseURL = process.env.AI_BASE_URL || "https://openrouter.ai/api/v1";
    const response = await axios.post(`${baseURL}/chat/completions`, {
      model: DEFAULT_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a senior full-stack mentor. Be direct, technical, and analytical. Respond ONLY with valid JSON."
        },
        { role: "user", content: prompt }
      ]
    }, {
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "X-Title": "SIPP AI Engine"
      },
      timeout: 25000 
    });

    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      throw new Error('No choices in OpenRouter response');
    }

    let text = response.data.choices[0].message.content;
    
    // Support potential thinking tags and markdown
    text = text.replace(/<think>[\s\S]*?<\/think>/g, ""); // Remove thinking blocks if present
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    // Find first { and last }
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      text = text.substring(firstBrace, lastBrace + 1);
    }

    return JSON.parse(text);
  } catch (error) {
    if (error.response) {
      console.error(`Status ${error.response.status}:`, error.response.data);
    } else {
      console.error(`AI Logic Error: ${error.message}`);
    }
    throw error;
  }
};

const generateCheckinFeedback = async (student, checkin) => {
  const prompt = `Student: ${student.name} (${student.skillLevel}, ${student.techStack})
Today's Check-in:
Learned: ${checkin.learned}
Built: ${checkin.built}
Problem: ${checkin.problem}

As their mentor, provide an assessment in JSON:
{
  "feedback": "string (Mentor diagnostic on their day's progress)",
  "suggestion": "string (A specific technical fix or improvement for their problem)",
  "nextTask": "string (Tailored technical task for tomorrow)",
  "weaknessTags": ["string"]
}`;

  try {
    const res = await callAI(prompt);
    return {
      feedback: res.feedback || "You've shown good initiative today. Keeping up the daily build habit is crucial.",
      suggestion: res.suggestion || "Consider looking into design patterns that could optimize your implementation.",
      nextTask: res.nextTask || "Integrate a unit test for the feature you built today.",
      weaknessTags: res.weaknessTags || ["consistency"]
    };
  } catch (err) {
    return {
      feedback: "Great work checking in! You're building a strong habit. Continuous builds are the fastest way to progress.",
      suggestion: "Try to document your debugging process for today's blocker.",
      nextTask: "Re-examine today's problem with a fresh perspective and search for relevant documentation.",
      weaknessTags: ["problem-solving", "consistency"]
    };
  }
};

const generateWeeklyReview = async (student, answers) => {
  const prompt = `Weekly Performance Review for ${student.name}.
Accomplishments: ${answers.completed}
Blockers encountered: ${answers.incomplete}
Proposed improvements: ${answers.improvement}

Diagnose their week and build a roadmap in JSON:
{ 
  "feedbackSummary": "Detailed multi-sentence appraisal of their weekly trajectory.", 
  "weaknessAnalysis": ["3-5 lowercase technical weakness tags"], 
  "nextWeekRoadmap": ["4 items for next week's focus"] 
}`;

  try {
    const res = await callAI(prompt);
    return {
      feedbackSummary: res.feedbackSummary || "A productive week of growth. You've balanced your theoretical learning with practical feature implementation effectively.",
      weaknessAnalysis: res.weaknessAnalysis || ["consistency", "pacing"],
      nextWeekRoadmap: res.nextWeekRoadmap || ["Optimize current features", "Review core architecture", "Set daily mini-milestones", "Implement error handling"]
    };
  } catch (err) {
    return {
      feedbackSummary: "A week of solid effort and persistence. You've faced significant blockers and demonstrated the tenacity required for senior-level development.",
      weaknessAnalysis: ["debugging-depth", "consistency"],
      nextWeekRoadmap: ["Start with high-risk tasks first", "Dedicate time for deep research", "Refactor complex functions", "Integrate automated checks"]
    };
  }
};

const generateDailyTasks = async (student, lastCheckin = null) => {
  let context = "";
  if (lastCheckin) {
    context = `
Recent Context:
Learning Goal: ${lastCheckin.learned}
Current Project: ${lastCheckin.built}
Biggest Blocker: ${lastCheckin.problem}
`;
  }

  const prompt = `Student: ${student.name} (${student.skillLevel}, ${student.techStack})
${context}
Generate 3 mission-critical technical goals for today in JSON:
{ 
  "concept": "Conceptual depth task related to their goal or blocker", 
  "feature": "Functional implementation task related to their project", 
  "debug": "Performance or bug resolution task for their blocker" 
}`;

  try {
    const res = await callAI(prompt);
    return {
      concept: res.concept || "Master advanced asynchronous flow control",
      feature: res.feature || "Implement a robust data layer for your project",
      debug: res.debug || "Profile memory usage and optimize rendering cycles"
    };
  } catch (err) {
    return {
      concept: "Deep dive into your stack's core library/framework",
      feature: "Build a reusable utility service for global state",
      debug: "Resolve any pending console warnings or hydration issues"
    };
  }
};

module.exports = {
  generateCheckinFeedback,
  generateWeeklyReview,
  generateDailyTasks
};
