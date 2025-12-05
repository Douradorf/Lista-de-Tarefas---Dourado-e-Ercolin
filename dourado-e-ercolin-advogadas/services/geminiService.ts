import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
// Note: In a real production app, this would be proxied through a backend.
// For this demo, we assume the key is in the env.
const apiKey = process.env.API_KEY || ''; 
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const suggestTasks = async (listTitle: string): Promise<{ description: string; assigneeRole: string }[]> => {
  if (!ai) {
    console.warn("API Key not found for Gemini.");
    return [];
  }

  try {
    const prompt = `
      Você é um assistente executivo jurídico experiente para o escritório "Dourado & Ercolin Advogadas".
      Dada a lista de tarefas com o título: "${listTitle}", sugira 3 a 5 tarefas essenciais, acionáveis e profissionais que deveriam estar nesta lista.
      Para cada tarefa, sugira também um cargo ou perfil genérico responsável (ex: Advogado Júnior, Estagiário, Secretária).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              description: {
                type: Type.STRING,
                description: 'A descrição detalhada da tarefa (mínimo 50 caracteres)',
              },
              assigneeRole: {
                type: Type.STRING,
                description: 'O cargo sugerido para realizar a tarefa',
              }
            },
            required: ['description', 'assigneeRole'],
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    
    return JSON.parse(jsonText);

  } catch (error) {
    console.error("Error generating tasks with Gemini:", error);
    return [];
  }
};