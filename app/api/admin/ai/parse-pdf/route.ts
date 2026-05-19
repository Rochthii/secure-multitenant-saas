import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(req: Request) {
    const guard = await requireAdmin();
    if (guard.error) return guard.error;

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "Missing file" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // pdf-parse v2: Constructor nhận { data: Buffer, ... }
        // getText() trả về object { text, pages }
        const { PDFParse } = (await import("pdf-parse")) as any;

        if (!PDFParse) {
            throw new Error("Không thể tải thư viện pdf-parse. Vui lòng liên hệ kỹ thuật viên.");
        }

        const parser = new PDFParse({ data: buffer });
        const data = await parser.getText();

        let text: string = "";
        let pageCount = 0;

        // pdf-parse v2: data.pages là array[{text, num}], data.text là joined string
        if (typeof data.text === "string") {
            text = data.text;
            pageCount = data.pages?.length || 0;
        } else if (Array.isArray(data.pages)) {
            // fallback: join thủ công nếu text rỗng
            text = data.pages.map((p: any) => p.text || "").join("\n\n");
            pageCount = data.pages.length;
        }

        // Làm sạch text
        text = text
            .replace(/\r\n/g, "\n")
            .replace(/\n{3,}/g, "\n\n")
            .trim();

        if (!text || text.length < 10) {
            return NextResponse.json(
                { error: "Không thể đọc nội dung PDF. File có thể bị scan-image hoặc được bảo vệ bằng mật khẩu." },
                { status: 422 }
            );
        }

        await parser.destroy().catch(() => {});

        return NextResponse.json({
            success: true,
            text,
            pages: pageCount,
        });

    } catch (error: any) {
        console.error("[parse-pdf] Error:", error);

        // Phân loại lỗi để UI hiển thị thông báo rõ ràng hơn
        const isPasswordProtected = error.message?.includes("password") || error.name === "PasswordException";
        const isCorrupted = error.message?.includes("Invalid PDF") || error.name === "InvalidPDFException";

        let userMessage = "Không thể xử lý file PDF. Vui lòng kiểm tra lại định dạng file.";
        if (isPasswordProtected) userMessage = "File PDF được bảo vệ bằng mật khẩu. Vui lòng gỡ mật khẩu trước khi nạp.";
        else if (isCorrupted) userMessage = "File PDF bị hỏng hoặc không hợp lệ. Vui lòng thử file khác.";

        return NextResponse.json({ error: userMessage }, { status: 500 });
    }
}
