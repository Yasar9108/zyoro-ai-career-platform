const LOG_TAG = "(retry.util)=>";

async function retryApiCall(apiFunction, maxRetries = 3, initialDelay = 2000) {
  console.debug(
    LOG_TAG,
    "Entered into retryApiCall: " + new Date().toISOString()
  );

  let delay = initialDelay;

  try {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.debug(
          LOG_TAG,
          "Attempt " + attempt + " of " + maxRetries
        );

        return await apiFunction();
      } catch (err) {
        console.debug(LOG_TAG, err);

        const status = err.response?.status || err.status;

        const retryable =
          status === 500 ||
          status === 502 ||
          status === 503 ||
          status === 504 ||
          err.code === "ECONNRESET" ||
          err.code === "ETIMEDOUT";

        if (!retryable) {
          console.debug(LOG_TAG, "Non-retryable error");
          throw err;
        }

        if (attempt === maxRetries) {
          console.debug(LOG_TAG, "Maximum retry attempts reached");
          throw err;
        }

        console.debug(
          LOG_TAG,
          "Retrying after " + delay + " ms"
        );

        await new Promise((resolve) => setTimeout(resolve, delay));

        delay *= 2;
      }
    }
  } catch (err) {
    console.debug(LOG_TAG, err);
    throw err;
  } finally {
    console.debug(
      LOG_TAG,
      "Exited from retryApiCall: " + new Date().toISOString()
    );
  }
}

module.exports = {
  retryApiCall,
};