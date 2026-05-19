import { BuddhistSpinner } from '@/components/ui/buddhist-spinner';

/**
 * Next.js route-level loading state — hiển thị khi navigate giữa các trang.
 * Giao diện Phật giáo Nam tông: background ấm, bánh xe Pháp vàng.
 */
export default function Loading() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center bg-ivory">

            {/* Radial warm glow */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_50%_40%_at_50%_50%,rgba(201,150,12,0.07),transparent)]" />

            <BuddhistSpinner
                size="lg"
                withText
                text="Đang tải..."
                color="gold"
            />

            {/* Pali decorative script */}
            <p className="mt-6 text-gold-primary/40 text-xs tracking-[0.4em] uppercase select-none">
                སྤྱི་འདུས་  ·  Namo Buddhaya
            </p>
        </div>
    );
}
