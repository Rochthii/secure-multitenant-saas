import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const key = process.env.GEMINI_API_KEY;

async function testGemini() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${key}`;
  
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: "xin chào" }] }]
    })
  });

  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Body:", text.substring(0, 500));
}

testGemini().catch(console.error);
