const axios = require("axios");
const Groq = require("groq-sdk");

const LOG_TAG = "(ai-fallback.service)=>";


// ============================================================
// Environment Variables
// ============================================================

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY;

const GROQ_API_KEY =
  process.env.GROQ_API_KEY;

const OPENROUTER_API_KEY =
  process.env.OPENROUTER_API_KEY;


// ============================================================
// Groq Client
// ============================================================

const groqClient = new Groq({
  apiKey: GROQ_API_KEY,
});


// ============================================================
// Helper: Create Provider Error
// ============================================================

function createProviderError(
  provider,
  message,
  status
) {

  const error = new Error(
    `${provider} error: ${message}`
  );

  error.provider = provider;
  error.status = status || 500;

  return error;
}


// ============================================================
// 1. Gemini
// ============================================================

async function callGemini(prompt) {

  console.debug(
    LOG_TAG,
    " Trying Gemini..."
  );

  try {

    if (!GEMINI_API_KEY) {
      throw createProviderError(
        "Gemini",
        "API key is missing.",
        500
      );
    }


    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",

      {
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
          temperature: 0.2,
        },
      },

      {
        params: {
          key: GEMINI_API_KEY,
        },

        headers: {
          "Content-Type": "application/json",
        },

        timeout: 60000,
      }
    );


    const content =
      response.data
        ?.candidates?.[0]
        ?.content?.parts?.[0]
        ?.text;


    if (!content || !content.trim()) {

      throw createProviderError(
        "Gemini",
        "Empty response received.",
        502
      );

    }


    console.debug(
      LOG_TAG,
      " Gemini response received successfully."
    );


    return content;

  } catch (err) {

    if (err.provider === "Gemini") {
      throw err;
    }


    const status =
      err.response?.status ||
      err.status ||
      500;


    const message =
      err.response?.data?.error?.message ||
      err.message ||
      "Unknown Gemini error";


    throw createProviderError(
      "Gemini",
      message,
      status
    );
  }
}


// ============================================================
// 2. Groq
// ============================================================

async function callGroq(prompt) {

  console.debug(
    LOG_TAG,
    " Trying Groq..."
  );

  try {

    if (!GROQ_API_KEY) {

      throw createProviderError(
        "Groq",
        "API key is missing.",
        500
      );

    }


    const completion =
      await groqClient.chat.completions.create({

        model:
          "llama-3.3-70b-versatile",

        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],

        temperature: 0.2,
      });


    const content =
      completion
        ?.choices?.[0]
        ?.message?.content;


    if (!content || !content.trim()) {

      throw createProviderError(
        "Groq",
        "Empty response received.",
        502
      );

    }


    console.debug(
      LOG_TAG,
      " Groq response received successfully."
    );


    return content;

  } catch (err) {

    if (err.provider === "Groq") {
      throw err;
    }


    const status =
      err.status ||
      err.response?.status ||
      500;


    const message =
      err.error?.message ||
      err.response?.data?.error?.message ||
      err.message ||
      "Unknown Groq error";


    throw createProviderError(
      "Groq",
      message,
      status
    );
  }
}


// ============================================================
// 3. OpenRouter
// ============================================================

async function callOpenRouter(prompt) {

  console.debug(
    LOG_TAG,
    " Trying OpenRouter..."
  );

  try {

    if (!OPENROUTER_API_KEY) {

      throw createProviderError(
        "OpenRouter",
        "API key is missing.",
        500
      );

    }


    const response = await axios.post(

      "https://openrouter.ai/api/v1/chat/completions",

      {
        // Automatically chooses an eligible free model
        model: "openrouter/free",

        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],

        temperature: 0.2,
      },

      {
        headers: {

          Authorization:
            `Bearer ${OPENROUTER_API_KEY}`,

          "Content-Type":
            "application/json",

        },

        timeout: 60000,
      }
    );


    const content =
      response.data
        ?.choices?.[0]
        ?.message?.content;


    if (!content || !content.trim()) {

      throw createProviderError(
        "OpenRouter",
        "Empty response received.",
        502
      );

    }


    console.debug(
      LOG_TAG,
      " OpenRouter response received successfully."
    );


    return content;

  } catch (err) {

    if (err.provider === "OpenRouter") {
      throw err;
    }


    const status =
      err.response?.status ||
      err.status ||
      500;


    const message =
      err.response?.data?.error?.message ||
      err.message ||
      "Unknown OpenRouter error";


    throw createProviderError(
      "OpenRouter",
      message,
      status
    );
  }
}


// ============================================================
// Provider Order
// ============================================================

const providers = [

  {
    name: "Gemini",
    call: callGemini,
  },

  {
    name: "Groq",
    call: callGroq,
  },

  {
    name: "OpenRouter",
    call: callOpenRouter,
  },

];


// ============================================================
// Generate With Automatic Fallback
// ============================================================

async function generateWithFallback(prompt) {

  console.debug(
    LOG_TAG,
    " Entered into generateWithFallback: " +
      new Date().toISOString()
  );


  if (
    !prompt ||
    typeof prompt !== "string" ||
    !prompt.trim()
  ) {

    throw new Error(
      "Prompt is required."
    );

  }


  let lastError = null;


  for (const provider of providers) {

    try {

      console.debug(
        LOG_TAG,
        ` Sending request to ${provider.name}`
      );


      const response =
        await provider.call(prompt);


      console.debug(
        LOG_TAG,
        ` ${provider.name} completed successfully.`
      );


      console.debug(
        LOG_TAG,
        " Exited from generateWithFallback: " +
          new Date().toISOString()
      );


      return response;


    } catch (err) {

      lastError = err;


      console.warn(
        LOG_TAG,
        `${provider.name} failed.`,
        `Status: ${err.status || "unknown"}`,
        `Message: ${err.message}`
      );


      if (err.status === 429) {

        console.warn(
          LOG_TAG,
          `${provider.name} rate limit reached. Trying next provider...`
        );

      } else {

        console.warn(
          LOG_TAG,
          `${provider.name} unavailable. Trying next provider...`
        );

      }

    }

  }


  // ==========================================================
  // All Providers Failed
  // ==========================================================

  console.error(
    LOG_TAG,
    " All AI providers failed."
  );


  const finalError = new Error(
    `All AI providers are currently unavailable. Last error: ${
      lastError?.message || "Unknown error"
    }`
  );


  finalError.status =
    lastError?.status || 503;


  throw finalError;
}


// ============================================================
// Exports
// ============================================================

module.exports = {
  generateWithFallback,
};