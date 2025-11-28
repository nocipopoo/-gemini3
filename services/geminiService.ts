import { GoogleGenAI } from "@google/genai";
import { CoverFormData, PLATFORMS } from "../types";

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const generateCover = async (
  apiKey: string,
  data: CoverFormData
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });
  const platformConfig = PLATFORMS.find(p => p.id === data.platform)!;

  // Construct a highly detailed prompt for 3.0 Pro
  let promptText = `Task: Create a viral video cover (thumbnail) for ${platformConfig.name}.
  
  Details:
  - Aspect Ratio Target: ${platformConfig.ratio}
  - Main Title Text (Must be legible and prominent in Chinese): "${data.mainTitle}"
  - Subtitle Text (Smaller): "${data.subTitle}"
  - Style Tags: ${data.styleTags.join(', ')}
  - Custom Instructions: ${data.customPrompt}
  
  Requirements:
  1. QUALITY: Photorealistic, 4K resolution, high detail. Avoid "waxy" or "oily" AI artifacts.
  2. COMPOSITION: Optimize for ${platformConfig.name} UI overlays. Keep text in the safe zone.
  3. TEXT: The Chinese text MUST be correct and artistically integrated into the image.
  4. VIBE: High click-through rate, energetic, professional.
  `;

  const parts: any[] = [];

  if (data.subjectImage) {
    const base64Subject = await fileToBase64(data.subjectImage);
    parts.push({
      inlineData: {
        data: base64Subject,
        mimeType: data.subjectImage.type
      }
    });
    promptText += `\n- Reference Image 1 (Subject): Use the person/object in this image as the main subject. Maintain likeness.`;
  }

  if (data.styleRefImage) {
    const base64Style = await fileToBase64(data.styleRefImage);
    parts.push({
      inlineData: {
        data: base64Style,
        mimeType: data.styleRefImage.type
      }
    });
    promptText += `\n- Reference Image 2 (Style): Copy the color palette, layout, and lighting style of this image.`;
  }

  parts.push({ text: promptText });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: parts
      },
      config: {
        imageConfig: {
            // Mapping ratios to closest supported enum or string
            // Note: 3.0 Pro Image Preview supports standard ratios. 
            // We pass the prompt instruction for specific framing, 
            // but use the closest config for generation dimensions if available.
            // Valid values: "1:1", "3:4", "4:3", "9:16", "16:9"
            aspectRatio: platformConfig.ratio
        }
      }
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated.");
  } catch (error) {
    console.error("Generation error:", error);
    throw error;
  }
};

export const editGeneratedImage = async (
  apiKey: string,
  originalImageBase64: string,
  editInstruction: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });

  // For editing, we pass the image back and ask for changes.
  // Using gemini-3-pro-image-preview for best quality text editing.
  
  const parts = [
    {
      inlineData: {
        data: originalImageBase64.split(',')[1], // Remove prefix if present
        mimeType: 'image/png'
      }
    },
    {
      text: `Edit this image based on the following instruction. Maintain high 4K quality and text legibility. 
      Instruction: ${editInstruction}`
    }
  ];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: parts
      },
       // No aspect ratio needed for edit, it usually preserves or infers from input
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image returned from edit.");
  } catch (error) {
    console.error("Edit error:", error);
    throw error;
  }
};
