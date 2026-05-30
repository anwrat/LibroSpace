import ollamaapi from "../config/ollama.config.js";

export const getGreeting = async (book: string, author: string) => {
  const prompt = `You are a random character from the book ${book} by ${author}. Stay in character for the whole conversation. Greet the user in character and ask them how can you be of help`;
  const response = await ollamaapi.post("/api/generate", {
    model: "llama3.2",
    stream: false,
    prompt,
  });
  return response.data.response;
};

export const getResponse = async (prompt: string) => {
  const response = await ollamaapi.post("/api/generate", {
    model: "llama3.2",
    stream: false,
    prompt,
  });
  return response.data.response;
};
