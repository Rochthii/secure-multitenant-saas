import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
    try {
        const { data, error } = await supabase
            .from("dharma_categories")
            .select("id, name, description")
            .order("name", { ascending: true });

        if (error) throw error;

        return NextResponse.json({ success: true, categories: data });
    } catch (error: any) {
        console.error("Get Categories Error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch categories" }, { status: 500 });
    }
}
