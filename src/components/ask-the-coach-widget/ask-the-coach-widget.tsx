import React, { useState, useRef, useEffect, FormEvent } from "react";

const WIDGET_API_ENDPOINT =
  "https://izmmadmdxoxzpmiodauk.supabase.co/functions/v1/ask-the-coach";
const DUMMY_USER_ID = "c4e9fc02-44ec-4400-b29b-f9c14464725e";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

export default function AskTheCoachWidget() {
  const [storyText, setStoryText] = useState("");
  const [includeStory, setIncludeStory] = useState(false);
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  // ref for auto-scrolling
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);

    // append user question to chat
    setChat((c) => [...c, { role: "user", text: question }]);

    try {
      const res = await fetch(WIDGET_API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_token: "widget-session-001",
          user_question: question,
          story_text: includeStory ? storyText : "",
          include_story_context: includeStory,
          user_id: DUMMY_USER_ID,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Unexpected error");
      }
      const data = await res.json();

      // append assistant answer to chat
      setChat((c) => [
        ...c,
        { role: "assistant", text: data.answer || "[No response]" },
      ]);
    } catch (err: any) {
      setChat((c) => [
        ...c,
        { role: "assistant", text: `Error: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
      setQuestion("");
    }
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", maxWidth: 700, margin: "auto" }}>
      {/* ─── HEADER ───────────────────────────────────────────── */}
      <div
        style={{
          background: "#040f37",
          color: "#fff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          padding: "12px 16px",
          borderRadius: "4px 4px 0 0",
        }}
      >
        <img
          src="https://auth.storyteacher.app/storage/v1/object/public/public-assets//STLogosm.jpg"
          alt="StoryTeacher Logo"
          style={{ height: 40, position: "absolute", left: 16 }}
        />
        <h2 style={{ margin: 0, flex: 1, textAlign: "center" }}>
          Ask the StoryTeacher Widget
        </h2>
      </div>

      {/* ─── OUTER CONTAINER ─────────────────────────────────── */}
      <div
        style={{
          border: "1px solid #ccc",
          borderTop: "none",
          borderRadius: "0 0 4px 4px",
          padding: 16,
          background: "#fff",
        }}
      >
        {/* ── OPTIONAL STORY BOX ───────────────────────────── */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontWeight: "bold", display: "block", marginBottom: 4 }}>
            (Optional) Insert a Story
          </label>
          <div style={{ fontSize: 14, color: "#555", marginBottom: 8 }}>
            If you want to ask the StoryTeacher for help with a specific story, paste it here:
          </div>
          <textarea
            value={storyText}
            onChange={(e) => setStoryText(e.target.value)}
            rows={5}
            placeholder="Paste your story text…"
            style={{
              width: "100%",
              border: "1px solid #ddd",
              borderRadius: 4,
              padding: 8,
              fontSize: 14,
              resize: "vertical",
            }}
          />
          <div style={{ marginTop: 8 }}>
            <label style={{ fontSize: 14 }}>
              <input
                type="checkbox"
                checked={includeStory}
                onChange={(e) => setIncludeStory(e.target.checked)}
                style={{ marginRight: 6 }}
              />
              Include story context in my questions
            </label>
          </div>
        </div>

        {/* ── CHAT WINDOW ───────────────────────────────────── */}
        <div
          style={{
            border: "1px solid #222",
            borderRadius: 8,
            background: "#f9f9f9",
            padding: 12,
            minHeight: 180,
            maxHeight: 360,
            overflowY: "auto",
          }}
        >
          {chat.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  background: msg.role === "user" ? "#d1e7dd" : "#e6e6e6",
                  padding: "10px 14px",
                  borderRadius: 6,
                  maxWidth: "75%",
                  whiteSpace: "pre-wrap",
                  fontSize: 14,
                  lineHeight: 1.4,
                }}
              >
                {msg.role === "assistant" && (
                  <div style={{ fontWeight: "bold", marginBottom: 4, color: "#b3500a" }}>
                    BuildTheStory AI Storyteacher
                  </div>
                )}
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* ── INPUT / SUBMIT ─────────────────────────────────── */}
        <form onSubmit={handleSubmit} style={{ display: "flex", marginTop: 16 }}>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question…"
            style={{
              flex: 1,
              padding: 10,
              fontSize: 14,
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
            disabled={loading}
            required
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              marginLeft: 8,
              padding: "0 20px",
              background: "#777",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            {loading ? "Thinking…" : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
