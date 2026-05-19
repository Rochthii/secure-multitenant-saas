import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listDocs() {
  const { data, error } = await supabase
    .from("dharma_document_chunks")
    .select('*')
    .limit(1);

  if (error) {
    console.error("Error:", error);
  } else if (data.length > 0) {
    console.log("Keys:", Object.keys(data[0]));
    console.log("Content:", data[0].content_text || data[0].chunk_text);
  }
}

listDocs().catch(console.error);
