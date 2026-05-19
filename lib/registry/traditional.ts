import { HeroCarouselWrapper } from '@/components/sections/HeroCarouselWrapper';
import { HomeIntroSection } from '@/components/sections/HomeIntroSection';
import { FeatureMosaicSection } from '@/components/sections/FeatureMosaicSection';
import { FeatureMosaicSectionAlt1 } from '@/components/sections/FeatureMosaicSectionAlt1';
import { FeatureMosaicSectionAlt2 } from '@/components/sections/FeatureMosaicSectionAlt2';
import { FeatureMosaicSectionAlt3 } from '@/components/sections/FeatureMosaicSectionAlt3';
import { FeatureMosaicSectionAlt4 } from '@/components/sections/FeatureMosaicSectionAlt4';
import { FeatureMosaicSectionAlt5 } from '@/components/sections/FeatureMosaicSectionAlt5';
import { FeatureMosaicSectionAlt6 } from '@/components/sections/FeatureMosaicSectionAlt6';
import { FeatureMosaicSectionAlt7 } from '@/components/sections/FeatureMosaicSectionAlt7';
import { TripleGemSectionAlt1 } from '@/components/sections/TripleGemSectionAlt1';
import { TripleGemSectionAlt2 } from '@/components/sections/TripleGemSectionAlt2';
import { TripleGemSectionAlt3 } from '@/components/sections/TripleGemSectionAlt3';
import { TripleGemSectionAlt4 } from '@/components/sections/TripleGemSectionAlt4';
import { TripleGemSectionAlt5 } from '@/components/sections/TripleGemSectionAlt5';
import { PhapAmPreviewSection } from '@/components/sections/PhapAmPreviewSection';
import { LatestNewsSectionClient } from '@/components/sections/LatestNewsSectionClient';
import { KhmerCalendarSection } from '@/components/sections/KhmerCalendarSection';
import { FacebookFeedSection } from '@/components/sections/FacebookFeedSection';
import { TransactionCTASection } from '@/components/sections/DonationCTASection';
import { DailyDharmaQuoteSection } from '@/components/sections/DailyDharmaQuoteSection';
import { DailyDharmaQuoteMinimal } from '@/components/sections/DailyDharmaQuoteMinimal';
import { DailyDharmaQuoteCard } from '@/components/sections/DailyDharmaQuoteCard';
import { DailyDharmaQuoteSplit } from '@/components/sections/DailyDharmaQuoteSplit';
import { CulturePreviewSection } from '@/components/sections/CulturePreviewSection';
import { CulturePreviewSectionAlt1 } from '@/components/sections/CulturePreviewSectionAlt1';
import { CulturePreviewSectionAlt2 } from '@/components/sections/CulturePreviewSectionAlt2';


export const TRADITIONAL_REGISTRY: Record<string, any> = {
    'traditional_hero': { name: 'Hero Truyền Thống', description: 'Carousel trượt ngang kinh điển', category: 'hero', group: 'HERO', icon: '🎬', component: HeroCarouselWrapper, requiredData: ['heroSlides'] },
    'traditional_intro': { name: 'Giới Thiệu Truyền Thống', description: 'Ảnh trái, text phải cổ điển', category: 'about', group: 'INTRO', icon: '🏛', component: HomeIntroSection, requiredData: ['introSection'] },
    'traditional_mosaic': { name: 'Sư Trụ Trì Mosaic', description: 'Layout lưới ảnh cho tiểu sử', category: 'about', group: 'INTRO', icon: '🏛', component: FeatureMosaicSection, requiredData: ['abbotSection', 'introSection', 'architectureSection', 'settings'] },
    'traditional_mosaic_alt1': { name: 'Giới Thiệu Bất Đối Xứng', description: 'Ảnh xếp lệch + vòng tròn sư trụ trì nổi', category: 'about', group: 'INTRO', icon: '🌅', component: FeatureMosaicSectionAlt1, requiredData: ['aboutSections', 'abbotSection', 'introSection', 'architectureSection', 'settings'] },
    'traditional_mosaic_alt2': { name: 'Di Sản Tam Bảo (Panorama)', description: 'Ảnh toàn cảnh trên + 2 thẻ ngang dưới', category: 'about', group: 'INTRO', icon: '🪷', component: FeatureMosaicSectionAlt2, requiredData: ['aboutSections', 'abbotSection', 'introSection', 'architectureSection', 'settings'] },
    'traditional_mosaic_alt3': { name: 'Tổ Đình — Biên Tập Tối (Dark Editorial)', description: 'Nền tối, thẻ kính chồng lên ảnh — phong cách tạp chí thiền định', category: 'about', group: 'INTRO', icon: '🕯️', component: FeatureMosaicSectionAlt3, requiredData: ['aboutSections', 'abbotSection', 'introSection', 'architectureSection', 'settings'] },
    'traditional_mosaic_alt4': { name: 'Ba Trụ Cột Tổ Đình (Zen Columns)', description: '3 cột đứng toàn màn hình, nội dung hiện ra khi hover — phong cách Zen', category: 'about', group: 'INTRO', icon: '⛩️', component: FeatureMosaicSectionAlt4, requiredData: ['aboutSections', 'abbotSection', 'introSection', 'architectureSection', 'settings'] },
    'traditional_mosaic_alt5': { name: 'Dòng Thời Gian Parallax', description: 'Kể chuyện theo chiều dọc với hiệu ứng cuộn và parallax', category: 'about', group: 'INTRO', icon: '📜', component: FeatureMosaicSectionAlt5, requiredData: ['aboutSections', 'abbotSection', 'introSection', 'architectureSection', 'settings'] },
    'traditional_mosaic_alt6': { name: 'Thẻ Nổi Abstract', description: 'Thẻ bo tròn lớn, đổ bóng mềm trên nền họa tiết abstract', category: 'about', group: 'INTRO', icon: '🎨', component: FeatureMosaicSectionAlt6, requiredData: ['aboutSections', 'abbotSection', 'introSection', 'architectureSection', 'settings'] },
    'traditional_mosaic_alt7': { name: 'Split Screen Minimalist', description: 'Bố cục 50/50, typography khổ lớn và ảnh nghệ thuật', category: 'about', group: 'INTRO', icon: '🌓', component: FeatureMosaicSectionAlt7, requiredData: ['aboutSections', 'abbotSection', 'introSection', 'architectureSection', 'settings'] },
    'traditional_news': { name: 'Tin Tức Truyền Thống', description: 'Lưới tin tức 3 cột chuẩn', category: 'news', group: 'NEWS', icon: '📰', component: LatestNewsSectionClient, requiredData: ['locale', 'news', 'upcomingEvents'] },
    'traditional_dharma': { name: 'Dharma Truyền Thống', description: 'Xem trước bài giảng Dharma', category: 'dharma', group: 'DHARMA', icon: '📿', component: PhapAmPreviewSection, requiredData: ['dharmaTalks'] },
    'traditional_events': { name: 'Lịch Sự Kiện Truyền Thống', description: 'Card ngày tháng năm cơ bản', category: 'events', group: 'EVENTS', icon: '📅', component: KhmerCalendarSection, requiredData: ['calendarEvents', 'upcomingEvents', 'nextMajorFestival'] },
    'traditional_cta': { name: 'Quyên Góp CTA', description: 'Banner kêu gọi thanh toán tiêu chuẩn', category: 'quotes', group: 'QUOTE_BANNER', icon: '🎯', component: TransactionCTASection },
    'traditional_dharma_quote': { name: 'Lời Phật Dạy', description: 'Câu trích dẫn tâm linh mỗi ngày', category: 'quotes', group: 'QUOTE_BANNER', icon: '💬', component: DailyDharmaQuoteSection },
    'traditional_dharma_quote_minimal': { name: 'Lời Phật Dạy (Tối Giản)', description: 'Chữ lớn giữa nền trắng, thanh mảnh', category: 'quotes', group: 'QUOTE_BANNER', icon: '📝', component: DailyDharmaQuoteMinimal },
    'traditional_dharma_quote_card': { name: 'Lời Phật Dạy (Thẻ)', description: 'Nội dung gọn gàng trong khối card hiện đại', category: 'quotes', group: 'QUOTE_BANNER', icon: '📇', component: DailyDharmaQuoteCard },
    'traditional_dharma_quote_split': { name: 'Lời Phật Dạy (Split)', description: 'Bố cục tạp chí chia ngang 30/70', category: 'quotes', group: 'QUOTE_BANNER', icon: '📖', component: DailyDharmaQuoteSplit },
    'traditional_culture_bento': { name: 'Văn Hoá — Sacred Editorial', description: 'Layout Bento cao cấp, phong cách tạp chí nghệ thuật', category: 'about', group: 'INTRO', icon: '🏛', component: CulturePreviewSection },
    'traditional_culture_manuscript': { name: 'Văn Hoá — Golden Manuscript', description: 'Phong cách lá bối, chữ Pali cổ và nền giấy cũ', category: 'about', group: 'INTRO', icon: '📜', component: CulturePreviewSectionAlt1 },
    'traditional_culture_masonry': { name: 'Văn Hoá — Masonry Skyline', description: 'Cột đứng hiện đại, vươn cao như đỉnh tháp chi nhánh', category: 'about', group: 'INTRO', icon: '📐', component: CulturePreviewSectionAlt2 },

    'facebook_feed': { name: 'Facebook Feed', description: 'Tích hợp iframe bài đăng FB', category: 'social', group: 'SOCIAL', icon: '📘', component: FacebookFeedSection, requiredData: ['settings'] },
    'traditional_facebook_feed': { name: 'Facebook Feed (Legacy)', description: 'Tự động ánh xạ từ ID cũ', category: 'social', group: 'LEGACY', icon: '⚠️', component: FacebookFeedSection, requiredData: ['settings'] },
    // --- TRIPLE GEM (TAM BẢO) SECTIONS ---
    'triple_gem_alt1': {
        name: 'Tam Bảo — Classic Triptych',
        description: 'Bố cục 3 cột cổ điển giới thiệu Phật - Pháp - Tăng.',
        category: 'spiritual',
        group: 'TRIPLE_GEM',
        component: TripleGemSectionAlt1,
        icon: '📜',
    },
    'triple_gem_alt2': {
        name: 'Tam Bảo — Mandala Flow',
        description: 'Bố cục vòng tròn huyền ảo, kết nối tâm linh.',
        category: 'spiritual',
        group: 'TRIPLE_GEM',
        component: TripleGemSectionAlt2,
        icon: '☸️',
    },
    'triple_gem_alt3': {
        name: 'Tam Bảo — Sacred Scrolls',
        description: 'Giao diện kinh lá bối cổ xưa, hoài niệm.',
        category: 'spiritual',
        group: 'TRIPLE_GEM',
        component: TripleGemSectionAlt3,
        icon: '📜',
    },
    'triple_gem_alt4': {
        name: 'Tam Bảo — Vertical Immersive',
        description: 'Trải nghiệm cuộn dọc toàn màn hình đầy ấn tượng.',
        category: 'spiritual',
        group: 'TRIPLE_GEM',
        component: TripleGemSectionAlt4,
        icon: '📐',
    },
    'triple_gem_alt5': {
        name: 'Tam Bảo — Bento Modern',
        description: 'Bố cục Bento hiện đại, linh hoạt nội dung.',
        category: 'spiritual',
        group: 'TRIPLE_GEM',
        component: TripleGemSectionAlt5,
        icon: '🍱',
    },
};

export const LEGACY_ALIASES: Record<string, any> = {
    'traditional_dharma_talks': { ...TRADITIONAL_REGISTRY['traditional_dharma'], group: 'LEGACY' },
    'traditional_latest_news': { ...TRADITIONAL_REGISTRY['traditional_news'], group: 'LEGACY' },
    'traditional_phap_am': { ...TRADITIONAL_REGISTRY['traditional_dharma'], group: 'LEGACY' },
    'traditional_news_grid': { ...TRADITIONAL_REGISTRY['traditional_news'], group: 'LEGACY' },
    'latest_news': { ...TRADITIONAL_REGISTRY['traditional_news'], group: 'LEGACY' },
    'dharma_talks': { ...TRADITIONAL_REGISTRY['traditional_dharma'], group: 'LEGACY' },
    'transaction_cta': { ...TRADITIONAL_REGISTRY['traditional_cta'], group: 'LEGACY' },
    'khmer_calendar': { ...TRADITIONAL_REGISTRY['traditional_events'], group: 'LEGACY' },
    'dharma_quote': { ...TRADITIONAL_REGISTRY['traditional_dharma_quote'], group: 'LEGACY' },
    'intro': { ...TRADITIONAL_REGISTRY['traditional_intro'], group: 'LEGACY' },
    'culture_preview': { ...TRADITIONAL_REGISTRY['traditional_culture_bento'], group: 'LEGACY' },

    'traditional_transaction_cta': { ...TRADITIONAL_REGISTRY['traditional_cta'], group: 'LEGACY' },
    'traditional_feature_mosaic': { ...TRADITIONAL_REGISTRY['traditional_mosaic'], group: 'LEGACY' },
};
