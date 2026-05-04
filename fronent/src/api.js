export async function uploadFiles(rfp, response, chunkSizeTokens, overlapTokens, topKChunks) {
  const formData = new FormData();

  if (typeof rfp === "string") {
    formData.append("rfp_text", rfp); // Add text data if it's provided
  } else {
    formData.append("rfp", rfp); // Otherwise add the file
  }

  if (typeof response === "string") {
    formData.append("response_text", response); // Add response text
  } else {
    formData.append("response", response); // Otherwise add the file
  }

  formData.append("chunk_size_tokens", chunkSizeTokens);
  formData.append("overlap_tokens", overlapTokens);
  formData.append("top_k_chunks", topKChunks);

  const res = await fetch("http://127.0.0.1:8000/review", {
    method: "POST",
    body: formData
  });

  console.log("HTTP Status:", res.status);

  const text = await res.text();

  console.log("Raw Backend Response:", text);

  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error("Backend returned invalid JSON: " + text);
  }
}
