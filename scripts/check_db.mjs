import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDB() {
  const { count, error } = await supabase
    .from("dharma_embeddings")
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Total documents in dharma_documents:", count);
  }
}

checkDB().catch(console.error);
