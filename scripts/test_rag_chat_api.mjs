import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function test() {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/rag-chat`;
  console.log("Testing RAG Chat API:", url);
  
  // Hỏi một câu chung chung để xem RAG có hoạt động không
  const query = "lịch sự phật giáo nam tông tại việt nam";
  console.log(`User Query: "${query}"\n`);
  
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${key}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query, session_id: "45825849-33e9-490e-b201-060bf0983cb8", tenant_id: "GLOBAL", tradition_id: "GENERAL" })
  });

  if (!res.ok) {
     console.error("API Error:", res.status, await res.text());
     return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let done = false;
  let fullText = "";
  let citations = [];
  let buffer = "";

  while (!done) {
     const { value, done: readerDone } = await reader.read();
     done = readerDone;
     if (value) {
        const chunkStr = decoder.decode(value, { stream: true });
        const lines = chunkStr.split("\n");
        for (const line of lines) {
           const trimmed = line.trim();
           if (trimmed.startsWith("data: ")) {
               const dataStr = trimmed.substring(6).trim();
               if (dataStr === "[DONE]") continue;
               try {
                   const data = JSON.parse(dataStr);
                   if (data.text) fullText += data.text;
                   if (data.citations) citations = data.citations;
               } catch(e) {
                   // This is a partial chunk, accumulate it
                   buffer += dataStr;
               }
           } else if (trimmed !== "" && buffer.length > 0) {
               buffer += trimmed;
               try {
                   const data = JSON.parse(buffer);
                   if (data.text) fullText += data.text;
                   if (data.citations) citations = data.citations;
                   buffer = ""; // reset buffer on success
               } catch(e) {}
           }
        }
     }
  }

  console.log("--- AI RESPONSE ---");
  console.log(fullText);
  console.log("\n--- CITATIONS RETURNED ---");
  console.log(JSON.stringify(citations, null, 2));
}

test().catch(console.error);
