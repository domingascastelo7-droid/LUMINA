
import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private getClient() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async describeMedia(mediaUrl: string, mediaType: string) {
    const ai = this.getClient();
    
    try {
      let contentPart;
      if (mediaType === 'image' && mediaUrl.startsWith('data:')) {
        const base64Data = mediaUrl.split(',')[1];
        contentPart = { inlineData: { data: base64Data, mimeType: 'image/jpeg' } };
      } else {
        contentPart = { text: `Analise este conteúdo de ${mediaType}.` };
      }

      const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { text: "Você é um curador de arte digital. Descreva esta mídia para uma galeria de Smart TV de luxo em Português. Seja poético, breve (máx 2 frases) e profissional." },
            contentPart
          ]
        }
      });
      return result.text || "Uma peça excepcional da sua coleção digital.";
    } catch (error) {
      console.error("Gemini Insight Error:", error);
      return "Conteúdo integrado à sua biblioteca inteligente Lumina.";
    }
  }

  async generateAiThumbnail(frameBase64: string, title: string): Promise<string | null> {
    const ai = this.getClient();
    
    try {
      const visionResult = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { text: `Crie um prompt visual cinematográfico baseado neste frame do vídeo '${title}'. O objetivo é gerar uma capa de filme minimalista e dramática.` },
            { inlineData: { data: frameBase64, mimeType: 'image/jpeg' } }
          ]
        }
      });

      const prompt = visionResult.text || `Cinematic minimalist movie poster for ${title}, 4k, studio lighting.`;

      const imageResult = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `${prompt} High-end TV interface style, 16:9 aspect ratio.` }]
        },
        config: {
          imageConfig: { aspectRatio: "16:9" }
        }
      });

      for (const part of imageResult.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return null;
    } catch (error) {
      console.error("AI Visual Generation Error:", error);
      return null;
    }
  }
}

export const gemini = new GeminiService();
