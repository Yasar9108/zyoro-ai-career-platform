// const { GoogleGenerativeAI } = require("@google/generative-ai");
// const LOG_TAG = "(gemini.service)=>";
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({
//   model: "gemini-2.5-flash",
// });

// async function analyzeResume(resumeText, targetRole) {
//   try {
//     console.debug(LOG_TAG, "Sending resume to Gemini");

//     const prompt = `
//             You are an expert ATS (Applicant Tracking System) Resume Analyzer with deep knowledge of recruiting standards, 
//              keyword matching, and resume parsing systems used by companies today.

//            ## TASK.
//             Analyze the resume below against the target role : ${targetRole}

//             Resume:
//             ${resumeText}

//            Return ONLY valid JSON.

//            {
//               "atsScore": 0,
//                "summary": "",
//                "skills": [],
//                "missingSkills": [],
//                 "suggestions": []
//              }
                

//             Rules:
//                - ATS Score should be between 0 and 100.
//                - skills must contain only detected technical skills.
//                - missingSkills must contain important missing skills for the role.
//                - suggestions should contain actionable improvements.
//                - Do not return markdown.
//                 - Do not explain anything.
//                 - Return JSON only.
//             `;

//     const result = await model.generateContent(prompt);

//     const response = await result.response;

//     const text = response.text();

//     console.debug(LOG_TAG, "Gemini response received");
//     const cleaned = text
//       .replace(/```json/g, "")
//       .replace(/```/g, "")
//       .trim();

//     return JSON.parse(cleaned);
//   } catch (err) {
//     console.error(LOG_TAG, err);
//     throw err;
//   }
// }

// async function optimizeResume(
//     resumeText,
//     targetRole,
//     suggestions,
//     missingSkills
// ) {

//     console.debug(
//         LOG_TAG,
//         " Entered into optimizeResume: " + new Date().toISOString()
//     );

//     try {

//         const prompt = `
//            You are an expert ATS Resume Writer.

//           Optimize the following resume for the target role.
 
//           Rules:

//            - Never invent information.
//            - Never invent companies.
//            - Never invent projects.
//            - Never invent education.
//            - Never invent certifications.
//            - Never invent dates.
//            - Improve grammar.
//            - Improve ATS keywords.
//            -  Improve readability.
//            - Rewrite existing bullet points professionally.
//            - Keep every factual detail unchanged.
//            - Return ONLY valid JSON.
//            - No markdown.
//            - No explanation.

//            Target Role: 
//             ${targetRole}

//           ATS Suggestions:
//            ${suggestions.join("\n")}

//          Missing Skills:
//           ${missingSkills.join("\n")}

//         Resume:
//           ${resumeText}

//          Return EXACTLY this JSON:

//         {
//         "personalInfo": {
//         "name": "",
//        "email": "",
//        "phone": "",
//        "location": "",
//        "linkedin": "",
//        "github": ""
//       },

//   "summary": "",

//   "skills": [],

//   "experience": [
//     {
//       "company": "",
//       "role": "",
//       "duration": "",
//       "description": []
//     }
//   ],

//   "projects": [
//     {
//       "title": "",
//       "description": []
//     }
//   ],

//   "education": [
//     {
//       "degree": "",
//       "college": "",
//       "year": ""
//     }
//   ],

//   "certifications": []
// }
// `;
//         const result = await model.generateContent(prompt);

//         const response = await result.response;

//         const text = response.text();

//         const cleanedResponse = text
//             .replace(/```json/g, "")
//             .replace(/```/g, "")
//             .trim();

//         const optimizedResume = JSON.parse(cleanedResponse);

//         if (
//             !optimizedResume.summary ||
//             !Array.isArray(optimizedResume.skills)
//         ) {
//             throw new Error("Invalid Gemini response.");
//         }

//         console.debug(
//             LOG_TAG,
//             " Exited from optimizeResume: " + new Date().toISOString()
//         );

//         return optimizedResume;

//     } catch (err) {
//         console.debug(LOG_TAG, err);
//         throw err;
//     }
// }

// async function generateInterviewQuestions(
//   resumeText,
//   targetRole,
//   companyType,
//   exprienceLevel,
//   companyName,
// ) {
//   try {
//     console.debug(
//       LOG_TAG,
//       "Entered into generateInterviewQuestions method: " +
//         new Date().toISOString()
//     );
//     console.debug(LOG_TAG, " sending gemini response: ");
//     const prompt = `
//         You are an expert technical interviewer.

//         Generate a professional interview preparation guide based on the following details.

//         Candidate Resume:
//         ${resumeText}

//         Target Role:
//         ${targetRole}

//         Company Type:
//         ${companyType}

//         Years of Experience:
//         ${exprienceLevel}

//         Target Company:
//        ${companyName || "Not Provided"}

//        Instructions:

//       - Generate exactly 10 interview questions.
//       - Questions must match the target role, experience level, company type, and resume.
//       - If a company name is provided, make the interview style similar to commonly reported interviews for that company.
//       - If no company name is provided, generate questions suitable for the selected company type.
//       - Include beginner, intermediate, and scenario-based questions where appropriate.
//       - Questions should reference the candidate's projects and technical skills whenever possible.
//       - Generate concise but complete expected answers.
//       - Do not repeat questions.
//       - Return ONLY valid JSON.
//       - Do not include markdown.
//       - Do not include explanations.

//       Return JSON in the following format:

//      {
//       "title": "",
//       "questions": [
//          {
//             "questionNumber": 1,
//             "question": "",
//             "expectedAnswer": ""
//           }
//         ]
//       }
//     `;
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = response.text();
//     console.debug(LOG_TAG, "Gemini response received");
//     const cleaned = text
//       .replace(/```json/g, "")
//       .replace(/```/g, "")
//       .trim();
//     return JSON.parse(cleaned);
//   } catch (err) {
//     console.error(LOG_TAG, err);
//     throw err;
//   }
//   console.debug(
//     LOG_TAG,
//     " Exited from generateInterviewQuestions method:  " +
//       new Date().toISOString()
//   );
// }

// async function calculateJobMatch(resumeText, jobs) {
//   console.debug(
//     LOG_TAG,
//     "Entered into calculateJobMatch: " + new Date().toISOString());

//   try {
//     console.debug(
//       LOG_TAG,
//       "Generating Gemini response: " + new Date().toISOString()
//     );

//     const prompt = `
//           You are an expert AI career advisor and ATS evaluator.

//           Resume:
//                 ${resumeText}

//           Available Jobs:
//                 ${JSON.stringify(jobs)}

//           Task:

//           Compare the resume against every job.

//           For each job calculate:

//           1. Match Score (0-100)
//           2. Matching Skills
//           3. Missing Skills
//           4. Short reason (1-2 sentences)
//           5. Whether the job should be automatically selected.

//           Rules:

//          - If Match Score >= 90 then selected should be true.
//          - Otherwise selected should be false.
//          - Do NOT invent company names, job titles, apply URLs, or locations.
//          - If company name is missing or empty, selected must be false.
//          - If job title is missing or empty, selected must be false.
//          - If applyUrl is missing or empty, selected must be false.
//          - Do not recommend incomplete job listings.
//          - Use only the information provided.

//         Return ONLY valid JSON.

//         Expected format:

//       [
//         {
//           "jobTitle": "",
//           "company": "",
//           "location": "",
//           "salaryMin": 0,
//           "salaryMax": 0,
//           "applyUrl": "",
//           "matchScore": 95,
//           "matchingSkills": [],
//           "missingSkills": [],
//           "reason": "",
//           "selected": true
//         }
//       ]
//      `;

//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = response.text();

//     console.debug(LOG_TAG, "Gemini response generated");

//     const cleaned = text
//       .replace(/```json/g, "")
//       .replace(/```/g, "")
//       .trim();

//     return JSON.parse(cleaned);
//   } catch (err) {
//     console.error(LOG_TAG, err);
//     throw err;
//   }
// }

// module.exports = {
//   analyzeResume,
//   generateInterviewQuestions,
//   calculateJobMatch,
//   optimizeResume
// };
// const { GoogleGenerativeAI } = require("@google/generative-ai");
// const LOG_TAG = "(gemini.service)=>";
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const groqAi = require("groq-ai")(process.env.GROQ_API_KEY);
// const oprenRouter = require("openrouter")(process.env.OPENROUTER_API_KEY);
// const model = genAI.getGenerativeModel({
//   model: "gemini-2.5-flash",
// });

// // ==========================
// // Helper: strip markdown fences + parse
// // ==========================
// function cleanAndParse(rawText, fnName) {
//   const cleaned = rawText
//     .replace(/```json/g, "")
//     .replace(/```/g, "")
//     .trim();

//   try {
//     return JSON.parse(cleaned);
//   } catch (err) {
//     console.error(LOG_TAG, `${fnName} failed to parse JSON:`, cleaned);
//     throw new Error(`Gemini returned invalid JSON in ${fnName}`);
//   }
// }

// // ==========================
// // 1. Analyze Resume (ATS scoring)
// // ==========================
// async function analyzeResume(resumeText, targetRole) {
//   try {
//     console.debug(LOG_TAG, "Sending resume to Gemini");

//     const prompt = `
// You are a senior technical recruiter and ATS (Applicant Tracking System) specialist
// who has screened over 10,000 resumes for ${targetRole} roles. You know exactly what
// keyword-matching ATS engines (Workday, Greenhouse, Taleo) look for, and what makes a
// human recruiter reject a resume in the first 6 seconds.

// ## TASK
// Score the resume below against the target role: ${targetRole}

// Think through this in four dimensions before scoring. Each dimension is worth up to
// 25 points, and the four scores sum to the final atsScore:

// 1. keywordMatch (0-25): Does the resume contain the hard skills, tools, and
//    terminology a real ${targetRole} job description would ATS-scan for? Penalize
//    generic buzzwords with no technical backing.
// 2. quantifiedImpact (0-25): Do bullet points show measurable outcomes (%, $, time
//    saved, scale, users, performance)? Penalize vague duties-only phrasing like
//    "responsible for" or "worked on".
// 3. structureAndClarity (0-25): Is there a clear summary, consistent formatting,
//    reverse-chronological order, and no missing dates/sections? Penalize walls of
//    text, inconsistent tense, or missing context (no company size/industry).
// 4. roleRelevance (0-25): Does the overall narrative (titles, projects, progression)
//    actually align with ${targetRole}, or does it read as a mismatch requiring a
//    career pivot story?

// Resume:
// ${resumeText}

// ## OUTPUT
// Return ONLY valid JSON, no markdown, no explanation, in exactly this shape:

// {
//   "atsScore": 0,
//   "scoreBreakdown": {
//     "keywordMatch": 0,
//     "quantifiedImpact": 0,
//     "structureAndClarity": 0,
//     "roleRelevance": 0
//   },
//   "summary": "",
//   "strengths": [],
//   "skills": [],
//   "missingSkills": [],
//   "suggestions": []
// }

// Rules:
// - atsScore must equal the sum of the four scoreBreakdown values.
// - skills must contain only technical/tool/platform skills actually evidenced in the
//   resume text — never infer skills that aren't demonstrated. Cap at the 11-12 most
//   relevant to ${targetRole} if the resume evidences more than that; do not pad if
//   fewer are evidenced.
// - missingSkills must be specific and role-relevant (e.g. "Kubernetes" not
//   "cloud stuff"), ranked with the most impactful gap first. Maximum 5-6 — only
//   include genuine, high-impact gaps; return fewer if fewer truly apply, never pad
//   to reach the max.
// - strengths should be 2-4 concrete things the resume already does well.
// - suggestions must be EXACTLY the 3 most important, highest-impact fixes — not
//   more. Each must be specific and actionable, referencing the actual bullet or
//   section to fix, not generic advice like "add more skills". Rank highest-impact
//   first. Do not return more than 3 even if more issues exist.
// - summary is a 2-3 sentence recruiter-style read of the candidate, not a rewrite
//   of their own summary.
// - Do not return markdown.
// - Do not explain anything outside the JSON.
// - Return JSON only.
// `;

//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = response.text();

//     console.debug(LOG_TAG, "Gemini response received");
//     return cleanAndParse(text, "analyzeResume");
//   } catch (err) {
//     console.error(LOG_TAG, err);
//     throw err;
//   }
// }

// // ==========================
// // 2. Optimize Resume (rewrite based on analysis)
// // ==========================
// async function optimizeResume(
//   resumeText,
//   targetRole,
//   suggestions,
//   missingSkills
// ) {
//   console.debug(
//     LOG_TAG,
//     " Entered into optimizeResume: " + new Date().toISOString()
//   );

//   try {
//  const prompt = `
// You are a professional resume writer who has helped candidates land offers at
// top-tier companies for ${targetRole} roles. You write resumes that pass ATS
// keyword scans AND survive a 6-second human skim.

// ## HARD CONSTRAINTS (never violate)
// - Never invent companies, job titles, employers, projects, degrees, schools,
//   certifications, or dates that are not present in the original resume.
// - Never invent metrics or numbers that aren't implied by the original text. If the
//   original has no number for a bullet, strengthen the language instead of
//   fabricating a statistic.
// - Keep every factual detail (employers, dates, degrees) unchanged.

// ## SELECTION — do this before writing anything
// Do not rewrite every bullet in the original resume. For each role/project, first
// identify which original points are the most STANDOUT — the ones that show scale,
// ownership, a hard result, unique tech, or leadership — and discard the rest
// (routine tasks, restated job description, low-signal bullets).
// - Experience: keep only the 4-5 strongest points per role, max.
// - Projects: keep only the 2-3 strongest points per project, max.
// - If a role/project genuinely has fewer than that worth keeping, output fewer —
//   never pad weak bullets just to hit the count.
// - Project "Tools Used": list only 3-6 technologies that were actually core to
//   that project — not every tool incidentally touched (skip trivial ones like
//   Git, VS Code, generic OS).
// - Technical Skills section (overall): 8-15 skills total, prioritized by
//   relevance to ${targetRole}. Do not pad with generic/low-signal skills just to
//   hit a count, and do not exceed 15 even if the original resume lists more.

// ## WRITING CRAFT (apply these to every bullet)
// - Rewrite each bullet in the pattern: [Strong action verb] + [what you did] +
//   [measurable/observable outcome or scope]. Vary the action verb — do not reuse
//   the same verb twice across the resume.
// - Eliminate "responsible for", "duties included", "worked on", "helped with" —
//   replace with what was actually accomplished.
// - Where the original resume implies scale, ownership, or impact but doesn't state
//   it explicitly, make it explicit (e.g. "built a dashboard" → "built a dashboard
//   used by the 12-person analytics team" only if team size is stated or clearly
//   implied elsewhere in the resume — otherwise leave unquantified but still active).
// - Naturally weave in relevant missing skills ONLY where the candidate's existing
//   experience plausibly involved them (e.g. if they used "Kubernetes-adjacent"
//   tools like Docker, you may mention container orchestration context) — never
//   claim a missing skill as hands-on experience if the original resume gives no
//   basis for it.
// - Keep each bullet to a single line of impact — no run-on bullets combining three
//   unrelated accomplishments.
// - Write the summary as 2-3 punchy sentences: who they are, their strongest
//   technical/domain edge, and the value they bring to a ${targetRole} — no
//   first-person pronouns, no clichés like "results-driven team player".

// ## CONTEXT FOR THIS REWRITE
// Target Role:
// ${targetRole}

// ATS Suggestions to address:
// ${suggestions.join("\n")}

// Missing Skills to weave in where truthful:
// ${missingSkills.join("\n")}

// Original Resume:
// ${resumeText}

// ## OUTPUT
// Return ONLY valid JSON, no markdown, no explanation, in exactly this shape:

// {
//   "personalInfo": {
//     "name": "",
//     "email": "",
//     "phone": "",
//     "location": "",
//     "linkedin": "",
//     "github": ""
//   },
//   "summary": "",
//   "skills": [],
//   "experience": [
//     {
//       "company": "",
//       "role": "",
//       "duration": "",
//       "description": []
//     }
//   ],
//   "projects": [
//     {
//       "title": "",
//       "description": []
//     }
//   ],
//   "education": [
//     {
//       "degree": "",
//       "college": "",
//       "year": ""
//     }
//   ],
//   "certifications": []
// }

// Rules:
// - Return ONLY valid JSON.
// - No markdown.
// - No explanation.
// `;
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = response.text();

//     const optimizedResume = cleanAndParse(text, "optimizeResume");

//     if (!optimizedResume.summary || !Array.isArray(optimizedResume.skills)) {
//       throw new Error("Invalid Gemini response.");
//     }

//     console.debug(
//       LOG_TAG,
//       " Exited from optimizeResume: " + new Date().toISOString()
//     );

//     return optimizedResume;
//   } catch (err) {
//     console.debug(LOG_TAG, err);
//     throw err;
//   }
// }

// // ==========================
// // 3. Generate Interview Questions
// // ==========================
// async function generateInterviewQuestions(
//   resumeText,
//   targetRole,
//   companyType,
//   exprienceLevel,
//   companyName
// ) {
//   try {
//     console.debug(
//       LOG_TAG,
//       "Entered into generateInterviewQuestions method: " +
//         new Date().toISOString()
//     );
//     console.debug(LOG_TAG, " sending gemini response: ");

//     const prompt = `
// You are a panel interviewer who has personally conducted interviews for
// ${targetRole} roles at ${companyType} companies${
//       companyName ? ` and specifically at ${companyName}` : ""
//     }.

// ## TASK
// Build a realistic interview preparation guide tailored to this exact candidate.

// Candidate Resume:
// ${resumeText}

// Target Role:
// ${targetRole}

// Company Type:
// ${companyType}

// Years of Experience:
// ${exprienceLevel}

// Target Company:
// ${companyName || "Not Provided"}

// ## QUESTION DESIGN RULES
// - Generate exactly 10 questions.
// - Distribute across categories: at least 3 technical (grounded in the candidate's
//   actual stack/projects), at least 2 behavioral (using their real experience as
//   the anchor), at least 2 scenario/problem-solving (realistic on-the-job
//   situations for this role and seniority), and the remainder mixed based on what's
//   most relevant to ${targetRole} at this experience level.
// - Match difficulty to ${exprienceLevel} — don't ask junior-level questions to a
//   senior candidate or system-design questions to someone with no scale experience.
// - Reference specific projects, technologies, or claims from the resume by name
//   wherever possible — generic questions that could apply to any candidate are a
//   failure mode to avoid.
// - If companyName is provided, calibrate tone and question style to that company's
//   publicly known interview culture (e.g. more system design for infra-heavy
//   companies, more behavioral/leadership-principle style for companies known for
//   structured behavioral rounds). If not provided, use ${companyType} norms.
// - Do not repeat questions or ask near-duplicates.
// - Each expectedAnswer should be a concise model answer (3-5 sentences) showing
//   what a strong response covers — not a full essay.

// ## OUTPUT
// Return ONLY valid JSON, no markdown, no explanation, in exactly this shape:

// {
//   "title": "",
//   "questions": [
//     {
//       "questionNumber": 1,
//       "category": "",
//       "difficulty": "",
//       "question": "",
//       "expectedAnswer": ""
//     }
//   ]
// }

// Rules:
// - category must be one of: "technical", "behavioral", "scenario".
// - difficulty must be one of: "easy", "medium", "hard".
// - Return ONLY valid JSON.
// - Do not include markdown.
// - Do not include explanations.
// `;

//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = response.text();

//     console.debug(LOG_TAG, "Gemini response received");
//     const parsed = cleanAndParse(text, "generateInterviewQuestions");

//     console.debug(
//       LOG_TAG,
//       " Exited from generateInterviewQuestions method:  " +
//         new Date().toISOString()
//     );

//     return parsed;
//   } catch (err) {
//     console.error(LOG_TAG, err);
//     throw err;
//   }
// }

// // ==========================
// // 4. Calculate Job Match
// // ==========================
// async function calculateJobMatch(resumeText, jobs) {
//   console.debug(
//     LOG_TAG,
//     "Entered into calculateJobMatch: " + new Date().toISOString()
//   );

//   try {
//     console.debug(
//       LOG_TAG,
//       "Generating Gemini response: " + new Date().toISOString()
//     );

//     const prompt = `
// You are an expert AI career advisor and ATS evaluator who screens candidates
// against job listings the same way a recruiting pipeline algorithm would.

// Resume:
// ${resumeText}

// Available Jobs:
// ${JSON.stringify(jobs)}

// ## SCORING RUBRIC (apply consistently to every job)
// For each job, weigh the match as:
// - 50%: required/core skill overlap between resume and job (count real overlaps,
//   don't assume adjacency — e.g. "React" experience does not count as "Vue" match).
// - 25%: seniority/experience-level fit (years of experience and scope of past
//   roles vs what the listing implies).
// - 15%: domain/industry relevance (has the candidate worked in a similar domain,
//   or on directly transferable problems).
// - 10%: title/trajectory fit (does this job represent a logical next step given
//   their resume, not a lateral mismatch or big unexplained jump).

// Combine these into a single matchScore (0-100). Be honest and differentiate
// scores across jobs — do not cluster every job around 70-80 as a default.

// ## SELECTION RULE
// - If matchScore >= 90, selected must be true.
// - Otherwise selected must be false.
// - If companyName is missing or empty, selected must be false.
// - If jobTitle is missing or empty, selected must be false.
// - If applyUrl is missing or empty, selected must be false.
// - Do not recommend incomplete job listings regardless of score.
// - Do NOT invent company names, job titles, apply URLs, or locations — use only
//   what's provided in Available Jobs.

// ## OUTPUT
// Return ONLY valid JSON, no markdown, no explanation, in exactly this shape:

// [
//   {
//     "jobTitle": "",
//     "company": "",
//     "location": "",
//     "salaryMin": 0,
//     "salaryMax": 0,
//     "applyUrl": "",
//     "matchScore": 0,
//     "matchingSkills": [],
//     "missingSkills": [],
//     "reason": "",
//     "selected": true
//   }
// ]

// Rules:
// - reason must cite specific skills/experience, not generic phrasing (e.g. "Strong
//   match on React and Node.js; lacks the 5+ years of team-lead experience the
//   listing requires" — not "good overall fit").
// - Return ONLY valid JSON.
// `;

//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = response.text();

//     console.debug(LOG_TAG, "Gemini response generated");
//     return cleanAndParse(text, "calculateJobMatch");
//   } catch (err) {
//     console.error(LOG_TAG, err);
//     throw err;
//   }
// }

// module.exports = {
//   analyzeResume,
//   generateInterviewQuestions,
//   calculateJobMatch,
//   optimizeResume,
// };
const { generateWithFallback } = require("./ai-fallback.service");

const {
  buildAnalyzeResumePrompt,
  buildOptimizeResumePrompt,
  buildInterviewQuestionsPrompt,
  buildJobMatchPrompt,
  buildStartInterviewPrompt,
  buildEvaluateInterviewAnswerPrompt,
  buildInterviewReportPrompt
} = require("./ai_prompt.service");

const LOG_TAG = "(ai.service)=>";


// ============================================================
// Helper: Clean AI response and parse JSON
// ============================================================

function cleanAndParse(rawText, functionName) {

  if (!rawText || typeof rawText !== "string") {
    throw new Error(
      `AI provider returned empty response in ${functionName}`
    );
  }

  const cleanedResponse = rawText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {

    return JSON.parse(cleanedResponse);

  } catch (err) {

    console.error(
      LOG_TAG,
      `${functionName} failed to parse AI JSON response:`,
      cleanedResponse
    );

    throw new Error(
      `AI provider returned invalid JSON in ${functionName}`
    );
  }
}


// ============================================================
// 1. Analyze Resume
// ============================================================

async function analyzeResume(
  resumeText,
  targetRole
) {

  console.debug(
    LOG_TAG,
    " Entered into analyzeResume: " +
      new Date().toISOString()
  );

  try {

    if (!resumeText) {
      throw new Error(
        "Resume text is required for analysis."
      );
    }

    if (!targetRole) {
      throw new Error(
        "Target role is required for resume analysis."
      );
    }


    // Build prompt
    const prompt = buildAnalyzeResumePrompt(
      resumeText,
      targetRole
    );


    // Gemini -> Groq -> OpenRouter
    const text = await generateWithFallback(prompt);


    // Convert AI response into JSON
    const analysis = cleanAndParse(
      text,
      "analyzeResume"
    );


    // Basic validation
    if (
      typeof analysis.atsScore !== "number" ||
      !analysis.summary ||
      !Array.isArray(analysis.skills) ||
      !Array.isArray(analysis.missingSkills) ||
      !Array.isArray(analysis.suggestions)
    ) {

      throw new Error(
        "Invalid resume analysis response structure."
      );

    }


    console.debug(
      LOG_TAG,
      " Exited from analyzeResume: " +
        new Date().toISOString()
    );


    return analysis;

  } catch (err) {

    console.error(
      LOG_TAG,
      " analyzeResume error:",
      err
    );

    throw err;
  }
}


// ============================================================
// 2. Optimize Resume
// ============================================================

async function optimizeResume(
  resumeText,
  targetRole,
  suggestions = [],
  missingSkills = []
) {

  console.debug(
    LOG_TAG,
    " Entered into optimizeResume: " +
      new Date().toISOString()
  );

  try {

    if (!resumeText) {
      throw new Error(
        "Resume text is required for optimization."
      );
    }

    if (!targetRole) {
      throw new Error(
        "Target role is required for resume optimization."
      );
    }


    // Safety in case DB values are missing
    const safeSuggestions =
      Array.isArray(suggestions)
        ? suggestions
        : [];

    const safeMissingSkills =
      Array.isArray(missingSkills)
        ? missingSkills
        : [];


    // Build prompt
    const prompt = buildOptimizeResumePrompt(
      resumeText,
      targetRole,
      safeSuggestions,
      safeMissingSkills
    );


    // Gemini -> Groq -> OpenRouter
    const text = await generateWithFallback(prompt);


    // Parse response
    const optimizedResume = cleanAndParse(
      text,
      "optimizeResume"
    );


    // Validate important fields
    if (
      !optimizedResume.summary ||
      !Array.isArray(optimizedResume.skills)
    ) {

      throw new Error(
        "Invalid optimized resume response structure."
      );

    }


    // Optional structure validation
    if (
      optimizedResume.experience &&
      !Array.isArray(optimizedResume.experience)
    ) {

      throw new Error(
        "Invalid experience structure returned by AI."
      );

    }


    if (
      optimizedResume.projects &&
      !Array.isArray(optimizedResume.projects)
    ) {

      throw new Error(
        "Invalid projects structure returned by AI."
      );

    }


    if (
      optimizedResume.education &&
      !Array.isArray(optimizedResume.education)
    ) {

      throw new Error(
        "Invalid education structure returned by AI."
      );

    }


    if (
      optimizedResume.certifications &&
      !Array.isArray(optimizedResume.certifications)
    ) {

      throw new Error(
        "Invalid certifications structure returned by AI."
      );

    }


    console.debug(
      LOG_TAG,
      " Exited from optimizeResume: " +
        new Date().toISOString()
    );


    return optimizedResume;

  } catch (err) {

    console.error(
      LOG_TAG,
      " optimizeResume error:",
      err
    );

    throw err;
  }
}


// ============================================================
// 3. Generate Interview Questions
// ============================================================

async function generateInterviewQuestions(
  resumeText,
  targetRole,
  companyType,
  experienceLevel,
  companyName
) {

  console.debug(
    LOG_TAG,
    " Entered into generateInterviewQuestions: " +
      new Date().toISOString()
  );

  try {

    if (!resumeText) {
      throw new Error(
        "Resume text is required for interview preparation."
      );
    }

    if (!targetRole) {
      throw new Error(
        "Target role is required for interview preparation."
      );
    }


    // Build prompt
    const prompt =
      buildInterviewQuestionsPrompt(
        resumeText,
        targetRole,
        companyType,
        experienceLevel,
        companyName
      );


    // Gemini -> Groq -> OpenRouter
    const text =
      await generateWithFallback(prompt);


    // Parse AI response
    const interviewQuestions =
      cleanAndParse(
        text,
        "generateInterviewQuestions"
      );


    // Basic validation — every other function here checks shape before
    // returning; this guards against a malformed/empty questions array
    // reaching the frontend or PDF generator undetected.
    if (
      !interviewQuestions.title ||
      !Array.isArray(interviewQuestions.questions) ||
      interviewQuestions.questions.length === 0
    ) {

      throw new Error(
        "Invalid interview questions response structure."
      );

    }


    console.debug(
      LOG_TAG,
      " Exited from generateInterviewQuestions: " +
        new Date().toISOString()
    );


    return interviewQuestions;

  } catch (err) {

    console.error(
      LOG_TAG,
      " generateInterviewQuestions error:",
      err
    );

    throw err;
  }
}


// ============================================================
// 4. Calculate Job Match
// ============================================================

async function calculateJobMatch(
  resumeText,
  jobs
) {

  console.debug(
    LOG_TAG,
    " Entered into calculateJobMatch: " +
      new Date().toISOString()
  );

  try {

    if (!resumeText) {
      throw new Error(
        "Resume text is required for job matching."
      );
    }

    if (
      !jobs ||
      !Array.isArray(jobs) ||
      jobs.length === 0
    ) {

      throw new Error(
        "Jobs are required for job matching."
      );

    }


    // Build prompt
    const prompt =
      buildJobMatchPrompt(
        resumeText,
        jobs
      );


    // Gemini -> Groq -> OpenRouter
    const text =
      await generateWithFallback(prompt);


    // Parse AI response
    const matchResult =
      cleanAndParse(
        text,
        "calculateJobMatch"
      );


    // The prompt asks for a JSON array — guard against the AI wrapping it
    // in an object instead, which would break any .map()/.forEach() the
    // caller does on this result with a confusing error far from here.
    if (!Array.isArray(matchResult)) {

      throw new Error(
        "Invalid job match response structure — expected an array."
      );

    }


    console.debug(
      LOG_TAG,
      " Exited from calculateJobMatch: " +
        new Date().toISOString()
    );


    return matchResult;

  } catch (err) {

    console.error(
      LOG_TAG,
      " calculateJobMatch error:",
      err
    );

    throw err;
  }
}

// ============================================================
// 5. Start Face-to-Face Interview
// ============================================================

async function startFaceToFaceInterview(
  resumeText,
  targetRole,
  targetCompany,
  experienceLevel,
  interviewType,
  difficulty,
  language
) {

  console.debug(
    LOG_TAG, " Entered into startFaceToFaceInterview: " + new Date().toISOString());

  try {

    if (!resumeText) {
      throw new Error(
        "Resume text is required to start interview."
      );
    }

    if (!targetRole) {
      throw new Error(
        "Target role is required to start interview."
      );
    }

    if (!experienceLevel) {
      throw new Error(
        "Experience level is required to start interview."
      );
    }

    const prompt = buildStartInterviewPrompt(
      resumeText,
      targetRole,
      targetCompany,
      experienceLevel,
      interviewType,
      difficulty,
      language
    );

    const text = await generateWithFallback(prompt);

    const result = cleanAndParse(text,"startFaceToFaceInterview");

    if (!result.question) {
      throw new Error(
        "AI did not return the first interview question."
      );
    }

    console.debug(
      LOG_TAG,
      " Exited from startFaceToFaceInterview: " +   new Date().toISOString()
    );

    return result;

  } catch (err) {

    console.error( LOG_TAG," startFaceToFaceInterview error:",err);

    throw err;
  }
}

// ============================================================
// 6. Evaluate Answer + Generate Next Question
// ============================================================

async function evaluateInterviewAnswer(
  resumeText,
  targetRole,
  targetCompany,
  experienceLevel,
  interviewType,
  currentDifficulty,
  conversations,
  currentQuestion,
  candidateAnswer,
  language
) {

  console.debug(
    LOG_TAG,
    " Entered into evaluateInterviewAnswer: " +
      new Date().toISOString()
  );

  try {

    if (!candidateAnswer) {
      throw new Error(
        "Candidate answer is required."
      );
    }

    if (!currentQuestion) {
      throw new Error(
        "Current interview question is required."
      );
    }

    const safeConversations =
      Array.isArray(conversations)
        ? conversations
        : [];

    const prompt =
      buildEvaluateInterviewAnswerPrompt(
        resumeText,
        targetRole,
        targetCompany,
        experienceLevel,
        interviewType,
        currentDifficulty,
        safeConversations,
        currentQuestion,
        candidateAnswer,
        language
      );

    const text =
      await generateWithFallback(prompt);

    const result =
      cleanAndParse(
        text,
        "evaluateInterviewAnswer"
      );

    if (
      typeof result.technicalScore !== "number" ||
      typeof result.communicationScore !== "number" ||
      !result.feedback ||
      !result.nextQuestion ||
      !result.nextDifficulty
    ) {

      throw new Error(
        "Invalid interview evaluation response structure."
      );
    }

    console.debug(
      LOG_TAG,
      " Exited from evaluateInterviewAnswer: " +
        new Date().toISOString()
    );

    return result;

  } catch (err) {

    console.error(
      LOG_TAG,
      " evaluateInterviewAnswer error:",
      err
    );

    throw err;
  }
}

// ============================================================
// 7. Generate Face-to-Face Interview Report
// ============================================================

async function generateInterviewReport(
  resumeText,
  targetRole,
  targetCompany,
  experienceLevel,
  interviewType,
  conversations
) {

  console.debug(
    LOG_TAG,
    " Entered into generateInterviewReport: " +
      new Date().toISOString()
  );

  try {

    if (
      !conversations ||
      !Array.isArray(conversations) ||
      conversations.length === 0
    ) {

      throw new Error(
        "Interview conversations are required."
      );
    }

    const prompt =
      buildInterviewReportPrompt(
        resumeText,
        targetRole,
        targetCompany,
        experienceLevel,
        interviewType,
        conversations
      );

    const text =
      await generateWithFallback(prompt);

    const report =
      cleanAndParse(
        text,
        "generateInterviewReport"
      );

    if (
      typeof report.overallScore !== "number" ||
      typeof report.technicalScore !== "number" ||
      typeof report.communicationScore !== "number" ||
      !Array.isArray(report.strengths) ||
      !Array.isArray(report.weaknesses) ||
      !Array.isArray(report.topicsToImprove) ||
      !report.finalFeedback
    ) {

      throw new Error(
        "Invalid interview report response structure."
      );
    }

    console.debug(
      LOG_TAG,
      " Exited from generateInterviewReport: " +
        new Date().toISOString()
    );

    return report;

  } catch (err) {

    console.error(
      LOG_TAG,
      " generateInterviewReport error:",
      err
    );

    throw err;
  }
}


// ============================================================
// Exports
// ============================================================

module.exports = {

  analyzeResume,

  optimizeResume,

  generateInterviewQuestions,

  calculateJobMatch,

  startFaceToFaceInterview,

  evaluateInterviewAnswer,

  generateInterviewReport


};