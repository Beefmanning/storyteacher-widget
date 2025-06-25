import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import AskTheCoachWidget from './components/ask-the-coach-widget/ask-the-coach-widget';

const WIDGET_API_ENDPOINT = "https://izmmadmdxoxzpmiodauk.supabase.co/functions/v1/ask-the-coach";

const DUMMY_USER_ID = 'c4e9fc02-44ec-4400-b29b-f9c14464725e'; //widget identity


function StoryTeacherWidget() {
  const [storyText, setStoryText] = useState("");
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!question.trim()) return;

    const newEntry = { role: "user", content: question };
    const updatedChat = [...chat, newEntry];
    setChat(updatedChat);
    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch(WIDGET_API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          story: storyText,
          messages: updatedChat,
          user_id: DUMMY_USER_ID,
        }),
      });

      const data = await response.json();

      if (data?.choices?.[0]?.message) {
        setChat([...updatedChat, data.choices[0].message]);
      } else {
        setChat([...updatedChat, { role: "assistant", content: "Sorry, no response received." }]);
      }
    } catch (err) {
      setChat([...updatedChat, { role: "assistant", content: "Error contacting StoryTeacher API." }]);
    }

    setLoading(false);
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: 20, maxWidth: 500 }}>
      <h2>StoryTeacher Widget</h2>

      <label>
        <strong>Paste your story:</strong>
        <textarea
          style={{ width: "100%", height: 100, marginBottom: 10 }}
          value={storyText}
          onChange={(e) => setStoryText(e.target.value)}
        />
      </label>

      <div style={{ marginBottom: 10 }}>
        {chat.map((msg, i) => (
          <div key={i} style={{ marginBottom: 6 }}>
            <strong>{msg.role === "user" ? "You" : "StoryTeacher"}:</strong> {msg.content}
          </div>
        ))}
        {loading && <em>StoryTeacher is thinking...</em>}
      </div>

      <input
        type="text"
        placeholder="Ask the StoryTeacher..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        style={{ width: "100%", marginBottom: 8 }}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
      />
      <button onClick={handleSubmit} disabled={loading}>
        Submit
      </button>
    </div>
  );
}

const container = document.getElementById("root");
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <AskTheCoachWidget
      endpoint={WIDGET_API_ENDPOINT}
      userId={DUMMY_USER_ID}
    />
  </React.StrictMode>
);




