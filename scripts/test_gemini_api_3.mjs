import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const key = process.env.GEMINI_API_KEY;

async function testGemini() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${key}`;
  
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: "dục ái" }] }]
    })
  });

  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Raw Response Body:");
  console.log(JSON.stringify(text)); // Print string representation with \n visible
}

testGemini().catch(console.error);
