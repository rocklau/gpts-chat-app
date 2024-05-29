import OpenAI from "openai";

export const models_name: string[] = [];
export const models_client: { [key: string]: OpenAI } = {};

export const models_conf = [
  {
    model: "llama3",
    baseURL: "http://127.0.0.1:11434/v1",
    apiKey: "ollama",
  },
  {
    model: "phi3",
    baseURL: "http://127.0.0.1:11434/v1",
    apiKey: "phi3",
  },
];

models_conf.forEach((provider) => {
  models_name.push(provider.model);
  models_client[provider.model] = new OpenAI({
    baseURL: provider.baseURL,
    apiKey: provider.apiKey,
  });
});
