import React from 'react';
import { Metadata } from 'next';
import { TamBaoPageNav } from '@/components/tam-bao/TamBaoPageNav';
import { cn } from '@/lib/utils';

const Container = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={cn('max-w-4xl mx-auto px-4 sm:px-5 md:px-6 lg:px-8', className)}>
        {children}
    </div>
);

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Ý Nghĩa Tam Bảo | Phật · Pháp · Tăng',
        description: 'Tìm hiểu ý nghĩa Tam Bảo trong truyền thống Phật giáo Nam Tông: Phật Bảo, Pháp Bảo, Tăng Bảo — ba ngôi nương tựa tối thượng.',
    };
}

export default async function TamBaoPage() {
    return (
        <main className="min-h-screen bg-[#FAF8F5] pb-24">
            {/* Minimal Hero */}
            <section className="bg-[#FAF8F5] pt-28 pb-20 sm:pt-36 sm:pb-24 border-b border-amber-900/5">
                <Container className="text-center">
                    <p className="text-amber-700 font-serif italic tracking-[0.2em] sm:tracking-[0.3em] text-xs sm:text-sm mb-6">
                        — Nương tựa ba ngôi báu —
                    </p>
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-black text-slate-900 tracking-tight mb-8">
                        TAM BẢO NAM TÔNG
                    </h1>
                    <div className="w-px h-16 bg-amber-700/20 mx-auto mb-8"></div>
                    <p className="text-slate-600 text-lg sm:text-xl max-w-2xl mx-auto font-serif leading-relaxed px-4">
                        "Con về nương tựa Phật, nương tựa Pháp, nương tựa Tăng — ba ngôi quý báu là bến đỗ cho kẻ lữ hành tìm về ánh sáng chân lý giữa biển đời vô thường."
                    </p>
                </Container>
            </section>

            <TamBaoPageNav />

            {/* 1. Phật Bảo */}
            <section id="phat-bao" className="scroll-mt-24 py-16 sm:py-24">
                <Container>
                    <div className="text-center mb-12">
                        <span className="text-amber-700 font-bold tracking-[0.3em] text-xs uppercase block mb-3">Buddha Ratana</span>
                        <h2 className="text-4xl md:text-5xl font-serif font-black text-slate-900">PHẬT BẢO</h2>
                    </div>
                    
                    <div className="prose prose-lg prose-amber mx-auto text-slate-700 font-serif leading-relaxed text-center sm:text-justify max-w-3xl">
                        <p className="text-xl md:text-2xl leading-normal text-slate-800 text-center mb-10">
                            Đức Thế Tôn — bậc Chánh Đẳng Chánh Giác, đạo sư vô thượng đã tự mình chứng ngộ chân lý tuyệt đối. Ngài là hiện thân của trí tuệ viên mãn và từ bi vô lượng, thắp sáng ngọn đuốc Chánh pháp cho nhân thiên thoát khỏi vô minh.
                        </p>
                        
                        <div className="bg-white border text-left border-neutral-200 p-8 sm:p-12 mt-12 mb-12 relative">
                            <h3 className="text-center font-bold text-slate-900 tracking-widest uppercase text-sm mb-8">Tôn Kính Phật Bảo</h3>
                            <div className="flex flex-col gap-6 text-base sm:text-lg">
                                <p className="flex gap-4">
                                    <span className="text-amber-600 shrink-0 font-bold">·</span>
                                    Bậc Toàn Giác đã đoạn tận gốc rễ tham, sân, si; không còn lậu hoặc.
                                </p>
                                <p className="flex gap-4">
                                    <span className="text-amber-600 shrink-0 font-bold">·</span>
                                    Ánh sáng của Đức Thế Tôn xóa tan bóng tối vô minh che lấp tâm thức chúng sinh.
                                </p>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <div className="w-full max-w-md mx-auto flex justify-center py-4 opacity-30">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mx-2"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mx-2"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mx-2"></span>
            </div>

            {/* 2. Pháp Bảo */}
            <section id="phap-bao" className="scroll-mt-24 py-16 sm:py-24">
                <Container>
                    <div className="text-center mb-12">
                        <span className="text-amber-700 font-bold tracking-[0.3em] text-xs uppercase block mb-3">Dhamma Ratana</span>
                        <h2 className="text-4xl md:text-5xl font-serif font-black text-slate-900">PHÁP BẢO</h2>
                    </div>

                    <div className="prose prose-lg prose-amber mx-auto text-slate-700 font-serif leading-relaxed text-center sm:text-justify max-w-3xl">
                        <p className="text-xl md:text-2xl leading-normal text-slate-800 text-center mb-10">
                            Pháp Bảo là giáo lý giải thoát do Đức Thế Tôn khéo thuyết — thiết thực hiện tiền, vượt ngoài thời gian, đến để mà thấy. Trong truyền thống Nam Tông, Pháp bảo được gìn giữ chân nguyên qua Tam Tạng (Tipiṭaka).
                        </p>

                        <blockquote className="text-xl text-center italic text-amber-900/80 my-12 border-none">
                            "Svākkhāto Bhagavatā dhammo — Pháp của Thế Tôn được khéo giảng, thiết thực hiện tiền, không có thời gian, đến để mà thấy, có khả năng hướng thượng."
                        </blockquote>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-12">
                            <div className="border border-neutral-200 bg-white p-8 text-center">
                                <h4 className="font-bold text-slate-900 text-lg uppercase tracking-wider mb-2">Bát Chánh Đạo</h4>
                                <p className="text-sm font-sans tracking-widest text-amber-700/70 mb-4">Ariya aṭṭhaṅgika magga</p>
                                <p className="text-sm text-slate-500">Con đường tám phương diện diệt khổ.</p>
                            </div>
                            <div className="border border-neutral-200 bg-white p-8 text-center">
                                <h4 className="font-bold text-slate-900 text-lg uppercase tracking-wider mb-2">Tứ Diệu Đế</h4>
                                <p className="text-sm font-sans tracking-widest text-amber-700/70 mb-4">Cattāri ariyasaccāni</p>
                                <p className="text-sm text-slate-500">Bốn chân lý tối thượng hiển lộ thực tại.</p>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            <div className="w-full max-w-md mx-auto flex justify-center py-4 opacity-30">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mx-2"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mx-2"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mx-2"></span>
            </div>

            {/* 3. Tăng Bảo */}
            <section id="tang-bao" className="scroll-mt-24 py-16 sm:py-24">
                <Container>
                    <div className="text-center mb-12">
                        <span className="text-amber-700 font-bold tracking-[0.3em] text-xs uppercase block mb-3">Sangha Ratana</span>
                        <h2 className="text-4xl md:text-5xl font-serif font-black text-slate-900">TĂNG BẢO</h2>
                    </div>

                    <div className="prose prose-lg prose-amber mx-auto text-slate-700 font-serif leading-relaxed max-w-3xl">
                        <p className="text-xl md:text-2xl leading-normal text-slate-800 text-center mb-12">
                            Tăng-già là đoàn thể Thánh chúng thanh tịnh, thừa hành giáo pháp của Đức Thế Tôn — ruộng phước tối thắng, mạng mạch gìn giữ và truyền thừa Chánh pháp giữa thế gian.
                        </p>

                        <div className="space-y-12 border-t border-neutral-200 pt-12">
                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-start sm:items-center">
                                <h3 className="font-black text-slate-900 text-xl uppercase tracking-widest w-full sm:w-1/3 shrink-0 m-0">Giới (Sīla)</h3>
                                <p className="m-0 text-slate-600 text-lg">Chư Tăng trì giới tinh nghiêm, làm gương mẫu cho thiện nam tín nữ, khiến đạo phong trang nghiêm.</p>
                            </div>
                            <div className="w-full h-px bg-neutral-100"></div>
                            
                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-start sm:items-center">
                                <h3 className="font-black text-slate-900 text-xl uppercase tracking-widest w-full sm:w-1/3 shrink-0 m-0">Định (Samādhi)</h3>
                                <p className="m-0 text-slate-600 text-lg">An trú trong chánh niệm, tịnh hóa thân tâm qua thiền định, làm nền tảng phát sinh tuệ giác.</p>
                            </div>
                            <div className="w-full h-px bg-neutral-100"></div>

                            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-start sm:items-center">
                                <h3 className="font-black text-slate-900 text-xl uppercase tracking-widest w-full sm:w-1/3 shrink-0 m-0">Tuệ (Paññā)</h3>
                                <p className="m-0 text-slate-600 text-lg">Nghiên tầm Tam tạng, thấu triệt bản thể vô ngã và quá trình duyên khởi, dẫn đến con đường giải thoát.</p>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>

            {/* 4. Qui y — Minimal Conclusion */}
            <section id="qui-y" className="scroll-mt-24 py-20 mt-12 bg-slate-900 text-white text-center">
                <Container className="max-w-3xl">
                    <span className="block w-12 h-px bg-amber-500 mx-auto mb-8"></span>
                    <h2 className="text-3xl md:text-4xl font-serif font-light tracking-wide mb-8">
                        Nương tựa bến đỗ bình yên
                    </h2>
                    <p className="text-slate-300 font-serif text-lg md:text-xl leading-relaxed opacity-90 mb-12 italic">
                        "Quy y Tam Bảo là bước đầu của người con Phật: hướng tâm về Đức Thế Tôn, Chánh pháp và chư Tăng, để được soi đường, nuôi dưỡng tuệ giác và hộ trì trên lộ trình tỉnh thức."
                    </p>
                    <p className="font-sans text-[10px] md:text-sm font-medium tracking-[0.2em] md:tracking-[0.4em] uppercase text-amber-500 flex flex-col gap-3">
                        <span>Buddham saranam gacchāmi</span>
                        <span>Dhammam saranam gacchāmi</span>
                        <span>Sangham saranam gacchāmi</span>
                    </p>
                </Container>
            </section>
        </main>
    );
}
