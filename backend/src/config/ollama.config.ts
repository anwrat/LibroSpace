import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const ollamaapi = axios.create({
  baseURL: `http://localhost:${process.env.OLLAMA_PORT}`,
});

export default ollamaapi;
