import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          backgroundColor: "#0c0815",
          padding: "80px",
          backgroundImage:
            "radial-gradient(ellipse at 20% 50%, rgba(88, 28, 135, 0.4) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(59, 130, 246, 0.25) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)",
        }}
      >
        {/* TUSK wordmark */}
        <div
          style={{
            display: "flex",
            fontSize: 120,
            fontWeight: 900,
            background: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 25%, #6366f1 50%, #3b82f6 75%, #a78bfa 100%)",
            backgroundClip: "text",
            color: "transparent",
            letterSpacing: "-4px",
            lineHeight: 1,
            marginBottom: "32px",
          }}
        >
          TUSK
        </div>

        {/* Subtitle */}
        <div
          style={{
            display: "flex",
            fontSize: 32,
            color: "#e2e0f0",
            lineHeight: 1.4,
            maxWidth: "800px",
            marginBottom: "40px",
          }}
        >
          Submit a topic, 2 AI models debate it, you get a structured conclusion
        </div>

        {/* Model names badge */}
        <div
          style={{
            display: "flex",
            fontSize: 18,
            color: "#a78bfa",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "8px 20px",
            border: "1px solid rgba(139, 92, 246, 0.3)",
            borderRadius: "100px",
            background: "rgba(139, 92, 246, 0.1)",
          }}
        >
          Gemini 2.0 Flash vs Grok 3 Mini
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
