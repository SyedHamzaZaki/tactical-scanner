import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const dataUrl = `data:${mimeType};base64,${imageBase64}`;

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: [
            {
              role: "system",
              content: `You are a military-grade OSINT (Open Source Intelligence) image analysis AI. Analyze the uploaded image and return a tactical threat assessment report. You MUST respond ONLY with a valid JSON object — no markdown, no explanation, no code fences.

The JSON object must have exactly these fields:
{
  "targetId": "A plausible alphanumeric target ID like TGT-4821 or OP-7193",
  "classification": "What the object/subject in the image is (be specific and accurate, e.g. 'Commercial Airliner - Boeing 737', 'Domestic Cat - Tabby', 'Urban Landscape - Residential', 'Military Vehicle - M1 Abrams Tank')",
  "threatLevel": "One of: CRITICAL, HIGH, MEDIUM, LOW, MINIMAL — be realistic. A flower is MINIMAL, a cat is LOW, a kitchen knife is LOW, a military vehicle is HIGH, an armed person is CRITICAL",
  "threatColor": "The hex color for the threat level: CRITICAL=#ff0000, HIGH=#ff4400, MEDIUM=#ff8800, LOW=#44cc00, MINIMAL=#00ff00",
  "confidence": "A percentage string like 87% representing analysis confidence",
  "description": "A 1-2 sentence tactical description of what you observe in the image",
  "signatures": [
    {"name": "GPS", "status": "ACTIVE or INACTIVE or N/A", "color": "#00ff00 for ACTIVE, #ff0000 for INACTIVE, #888888 for N/A"},
    {"name": "RF EMISSION", "status": "DETECTED or NOT DETECTED or N/A", "color": "#ff0000 for DETECTED, #00ff00 for NOT DETECTED, #888888 for N/A"},
    {"name": "THERMAL", "status": "DETECTED or NOT DETECTED or N/A", "color": "#ff0000 for DETECTED, #00ff00 for NOT DETECTED, #888888 for N/A"},
    {"name": "NETWORK", "status": "ACTIVE or INACTIVE or N/A", "color": "#00ff00 for ACTIVE, #ff0000 for INACTIVE, #888888 for N/A"}
  ],
  "origin": "Likely origin, manufacturer, country or organization (e.g. 'DJI, China' for a drone, 'Apple Inc, USA' for a phone, 'Pakistan' for local items, 'Unknown' if unsure)",
  "potential": "A description of the potential risk, capabilities, utility, or hazard level (e.g., 'Domestic companion animal, negligible risk of physical harm' or 'Electronic reconnaissance drone, potential threat for optical mapping')",
  "safetyRadius": "A standoff safety boundary, e.g. '30 meters' or '0 meters - Safe for close proximity'",
  "radarCrossSection": "A plausible radar signature calculation, e.g., '0.12 m²' or 'N/A' for organic entities",
  "recommendations": "A short 1-sentence tactical recommendation"
}

Be accurate and realistic with the threat level. Most everyday objects should be LOW or MINIMAL. Only truly dangerous items should be HIGH or CRITICAL.`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this image and provide the tactical threat assessment as a JSON object.",
                },
                {
                  type: "image_url",
                  image_url: {
                     url: dataUrl,
                  },
                },
              ],
            },
          ],
          temperature: 0.3,
          max_completion_tokens: 1024,
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error("Groq API error:", errText);
      return NextResponse.json(
        { error: `Groq API error: ${groqResponse.status}` },
        { status: groqResponse.status }
      );
    }

    const data = await groqResponse.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "Empty response from Groq" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error("Analysis error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Analysis failed: ${message}` },
      { status: 500 }
    );
  }
}
