import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message, history, context } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const messages = [
      {
        role: "system",
        content: `You are the Tactical OSINT Intelligence Assistant. You are connected to a target signature scanner.
The current active target context is:
- Target ID: ${context.targetId}
- Classification: ${context.classification}
- Threat Level: ${context.threatLevel}
- Confidence: ${context.confidence}
- Origin: ${context.origin}
- Tactical Description: ${context.description}
- Electronic Signatures: ${JSON.stringify(context.signatures)}
- Recommendation: ${context.recommendations}

Answer the analyst's queries concisely, strictly using a military/classified OSINT analyst tone. Keep responses within 2-4 sentences. Do not use generic chat pleasantries. Be highly operational and factual.`,
      },
      ...history,
      { role: "user", content: message },
    ];

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages,
          temperature: 0.5,
          max_tokens: 300,
        }),
      }
    );

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error("Groq Chat API error:", errText);
      return NextResponse.json(
        { error: `Groq Chat API error: ${groqResponse.status}` },
        { status: groqResponse.status }
      );
    }

    const data = await groqResponse.json();
    const content = data.choices?.[0]?.message?.content;

    return NextResponse.json({ reply: content });
  } catch (error: unknown) {
    console.error("Chat route error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Chat failed: ${message}` },
      { status: 500 }
    );
  }
}
