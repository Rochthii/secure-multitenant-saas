import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type PolicyView = 'tos' | 'privacy';

interface DharmaPolicyOverlayProps {
    isOpen: boolean;
    view: PolicyView;
    onClose: () => void;
}

export default function DharmaPolicyOverlay({ isOpen, view, onClose }: DharmaPolicyOverlayProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 overflow-hidden">
                {/* Backdrop Layer - Increased opacity and blur to isolate from background */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-stone-900/90 backdrop-blur-md"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-3xl h-[85vh] md:h-[80vh] bg-[#FAF4EB] rounded-2xl shadow-2xl overflow-hidden border border-stone-300 flex flex-col z-10"
                    style={{ backgroundColor: '#FAF4EB', opacity: 1 }} // STRICT SOLID BACKGROUND
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 md:p-6 border-b border-stone-200 bg-[#FEF9F3] shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                                {view === 'tos' ? <FileText className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                            </div>
                            <div>
                                <h2 className="font-playfair text-xl font-bold text-stone-900">
                                    {view === 'tos' ? 'Điều khoản Dịch vụ' : 'Chính sách Bảo mật'}
                                </h2>
                                <p className="text-[10px] text-stone-500 uppercase tracking-widest mt-0.5 font-bold">Dharma Portal AI</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:bg-stone-200 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content Body - Explicitly ensuring scrollability */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 text-stone-900 text-[15px] leading-relaxed scroll-smooth overscroll-contain">
                        {view === 'tos' && (
                            <>
                                <p className="italic text-stone-500">Cập nhật lần cuối: Tháng 4, 2026</p>
                                
                                <section>
                                    <h3 className="text-lg font-bold text-stone-800 font-playfair mb-2">1. Chấp thuận điều khoản</h3>
                                    <p>Bằng việc truy cập và sử dụng Dharma Portal ("Cổng thông tin"), bạn đồng ý tuân thủ các Điều khoản Dịch vụ này. Cổng thông tin được thiết kế nhằm mục đích hỗ trợ tra cứu, học tập và đàm đạo giáo lý Phật giáo thông qua Trí Tuệ Nhân Tạo (AI).</p>
                                </section>

                                <section>
                                    <h3 className="text-lg font-bold text-stone-800 font-playfair mb-2">2. Bản chất của AI và Miễn trừ trách nhiệm</h3>
                                    <p className="mb-2"><strong>Không thay thế Chánh Pháp:</strong> Trí tuệ nhân tạo (RAG AI) được huấn luyện từ các bộ kinh điển, nhưng ngôn ngữ tổng hợp có thể tồn tại sai sót. Hệ thống không đại diện cho tiếng nói chính thức của Giáo hội hay bất kỳ vị Tôn túc nào.</p>
                                    <p>Học viên có trách nhiệm tự kiểm chứng các thông tin quan trọng với Kinh điển gốc hoặc thỉnh giáo chư Tăng Ni. Đội ngũ phát triển từ chối mọi trách nhiệm pháp lý đối với việc áp dụng sai lệch nội dung do hệ thống cung cấp.</p>
                                </section>

                                <section>
                                    <h3 className="text-lg font-bold text-stone-800 font-playfair mb-2">3. Quy định Tôn trọng và Trang nghiêm</h3>
                                    <p>Người dùng phải giữ thái độ hòa nhã, tôn trọng khi đặt câu hỏi. Các hành vi sau bị cấm tuyệt đối và sẽ dẫn đến việc khóa tài khoản vĩnh viễn:</p>
                                    <ul className="list-disc pl-5 mt-2 space-y-1 text-stone-600 font-medium">
                                        <li>Sử dụng ngôn từ xúc phạm, phỉ báng Tam Bảo.</li>
                                        <li>Cố tình "Jailbreak" (phá vỡ rào cản hệ thống) để tạo ra nội dung sai lệch, gây tranh cãi tôn giáo.</li>
                                        <li>Sử dụng hệ thống để tuyên truyền mê tín dị đoan, phi Pháp, phi Luật.</li>
                                    </ul>
                                </section>

                                <section>
                                    <h3 className="text-lg font-bold text-stone-800 font-playfair mb-2">4. Hệ thống Trắc nghiệm (Human-in-the-Loop)</h3>
                                    <p>Các câu hỏi trắc nghiệm được sinh tự động bởi AI và đều trải qua trạng thái "Đang chờ Duyệt". Chỉ những nội dung đã được Ban Tu Thư phê duyệt mới được chuyển thành tư liệu học tập chính thức.</p>
                                </section>

                                <section>
                                    <h3 className="text-lg font-bold text-stone-800 font-playfair mb-2">5. Sở hữu Trí tuệ</h3>
                                    <p>Mã nguồn, thuật toán tìm kiếm vector, và cấu trúc hệ thống là tài sản của Đội ngũ phát triển độc quyền. Các bộ Kinh điển được số hóa thuộc quản lý của các dịch giả và nhà xuất bản gốc. Không sao chép cấu trúc phần mềm dưới bất kỳ hình thức nào.</p>
                                </section>
                            </>
                        )}

                        {view === 'privacy' && (
                            <>
                                <p className="italic text-stone-500">Cập nhật lần cuối: Tháng 4, 2026</p>
                                
                                <section>
                                    <h3 className="text-lg font-bold text-stone-800 font-playfair mb-2">1. Thu thập thông tin</h3>
                                    <p>Hệ thống tôn trọng tuyệt đối quyền riêng tư và sự tĩnh lặng của người dùng. Chúng tôi chỉ thu thập số lượng thông tin tối thiểu cần thiết để vận hành:</p>
                                    <ul className="list-disc pl-5 mt-2 space-y-1 text-stone-600 font-medium">
                                        <li><strong>Thông tin Định danh:</strong> Tên hiển thị (Pháp danh/Họ tên), Email (nếu bạn lập tài khoản).</li>
                                        <li><strong>Dữ liệu Tương tác:</strong> Lịch sử trò chuyện (Dharma Chat) và Lịch sử thi trắc nghiệm. Những dữ liệu này được lưu trữ ẩn danh hoặc gắn với ID mã hóa.</li>
                                    </ul>
                                </section>

                                <section>
                                    <h3 className="text-lg font-bold text-stone-800 font-playfair mb-2">2. Sử dụng thông tin</h3>
                                    <p>Thông tin thu thập được chỉ dùng cho các mục đích:</p>
                                    <ul className="list-disc pl-5 mt-2 space-y-1 text-stone-600 font-medium">
                                        <li>Hiển thị lại lịch sử học tập cá nhân cho chính bạn.</li>
                                        <li>Tối ưu hóa độ chính xác của Trí Tuệ Nhân Tạo (thông qua hệ thống Feedback).</li>
                                        <li>Phân tích tổng hợp (không định danh) về các chủ đề Phật học được quan tâm nhất.</li>
                                    </ul>
                                    <p className="mt-2 text-stone-900 font-bold underline decoration-amber-500 decoration-2">Chúng tôi KHÔNG bán hay chia sẻ dữ liệu cho bên thứ ba vì mục đích quảng cáo hoặc bất kỳ mục đích thương mại nào.</p>
                                </section>

                                <section>
                                    <h3 className="text-lg font-bold text-stone-800 font-playfair mb-2">3. Bảo mật Dữ liệu</h3>
                                    <p>Dữ liệu được lưu trữ trên hạ tầng điện toán đám mây bảo mật cao, có mã hóa đường truyền (SSL/TLS). Các chuẩn Role-Based Access Control (RBAC) được áp dụng để đảm bảo chỉ có bạn mới xem được thông tin của mình.</p>
                                </section>

                                <section>
                                    <h3 className="text-lg font-bold text-stone-800 font-playfair mb-2">4. Quyền của Đạo Hữu</h3>
                                    <p>Bạn có toàn quyền truy cập, chỉnh sửa hoặc yêu cầu xóa vĩnh viễn toàn bộ dữ liệu (bao gồm cả tài khoản và lịch sử vấn đáp) bằng cách sử dụng các tính năng trong phần Cài Đặt Tài Khoản.</p>
                                </section>
                            </>
                        )}
                        
                        <div className="h-4"></div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-stone-200 bg-[#FAF4EB] shrink-0 text-center flex justify-end">
                        <Button 
                            className="bg-stone-800 hover:bg-stone-900 text-white px-8 rounded-xl font-bold tracking-wide"
                            onClick={onClose}
                        >
                            Đã Hiểu & Đóng
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
