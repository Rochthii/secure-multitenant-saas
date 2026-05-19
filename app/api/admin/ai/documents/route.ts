import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('dharma_documents' as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      documents: data,
      total: data.length
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing document ID' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('dharma_documents' as any)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { id } = body;

    if (!id) {
        return NextResponse.json({ error: 'Missing document ID' }, { status: 400 });
    }

    // Xóa tất cả embeddings trước (Cascade)
    // Lưu ý: Nếu DB đã setup ON DELETE CASCADE thì chỉ cần xóa document
    // Ở đây ta xóa chủ động cho an toàn
    const { error: embedError } = await supabase
        .from('dharma_embeddings' as any)
        .delete()
        .eq('document_id', id);

    if (embedError) throw embedError;

    // Xóa document
    const { error: docError } = await supabase
        .from('dharma_documents' as any)
        .delete()
        .eq('id', id);

    if (docError) throw docError;

    return NextResponse.json({ success: true, message: 'Đã xóa tài liệu và dữ liệu vector liên quan' });
  } catch (error: any) {
    console.error('[API] DELETE Document Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
