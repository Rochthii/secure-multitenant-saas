import { BRAND_NAME_VI } from './constants';

export interface ColorTheme {
    id: string;
    name: string;
    description: string;
    tenantId?: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string; // Map to bgStart
        bgEnd?: string;
        text?: string;
        hero?: string;
        surface?: string;
        opacity?: string;
    };
}

export const BUDDHIST_THEMES: ColorTheme[] = [
    // ── 1. MÀU THEO TENANT (GIỮ NGUYÊN MÀU 100%) ─────────────────────────────
    {
        id: 'chantarangsay-classic',
        tenantId: '55555555-5555-5555-5555-555555555555',
        name: 'Cổ Điển Hổ Phách',
        description: 'Nâu hổ phách ấm áp — nhận diện thương hiệu gốc.',
        colors: {
            primary: '#F59E0B', secondary: '#5C4033', accent: '#FF8C00',
            background: '#FEF9F3', bgEnd: '#FDF5EB', text: '#2C1810',
            hero: '#1A0F09', surface: '#FAFAF7', opacity: '0.05'
        }
    },
    {
        id: 'phu-ly-red',
        tenantId: '22222222-2222-2222-2222-222222222222',
        name: 'Đỏ Kim — Chi Nhánh Phù Ly',
        description: 'Tông đỏ vàng uy nghiêm — nhận diện chi nhánh Phù Ly.',
        colors: {
            primary: '#D4AF37', secondary: '#8B1E1E', accent: '#C59A28',
            background: '#F5F0E6', bgEnd: '#EBE2CD', text: '#3A1F1F',
            hero: '#280F0F', surface: '#F8F5EE', opacity: '0.05'
        }
    },
    {
        id: 'khleang-green',
        tenantId: '33333333-3333-3333-3333-333333333333',
        name: "Xanh Lá — Chi Nhánh Kh'leang",
        description: 'Tông xanh thiên nhiên — nhận diện chi nhánh Kh\'leang.',
        colors: {
            primary: '#2F6F4E', secondary: '#E8C547', accent: '#E8C547',
            background: '#FFFFFF', bgEnd: '#F0F5F2', text: '#132B1E',
            hero: '#0A1F14', surface: '#F4F9F6', opacity: '0.03'
        }
    },
    {
        id: 'ho-phong-purple',
        tenantId: '44444444-4444-4444-4444-444444444444',
        name: 'Tím — Chi Nhánh Hộ Phòng',
        description: 'Tông tím thanh lịch — nhận diện chi nhánh Hộ Phòng.',
        colors: {
            primary: '#5A3E8E', secondary: '#F2D16B', accent: '#F2D16B',
            background: '#F5F0E6', bgEnd: '#EBE2D0', text: '#271744',
            hero: '#150C28', surface: '#F7F4F0', opacity: '0.04'
        }
    },

    // ── 2. PRESET THEO PHONG CÁCH THIẾT KẾ ─────────────────────────────────────
    {
        id: 'modern-moon',
        name: 'Corporate Dark — Xanh Navy & Vàng',
        description: 'Chuyên nghiệp, hiện đại — phù hợp doanh nghiệp công nghệ.',
        colors: {
            primary: '#C8B560', secondary: '#6FB3D3', accent: '#A89040',
            background: '#0D1B2A', bgEnd: '#162032', text: '#E8E4D9',
            hero: '#060E18', surface: '#111D2B'
        }
    },
    {
        id: 'minimal-vedana',
        name: 'Minimal Trắng Tinh — Vàng Trầm',
        description: 'Tối giản tuyệt đối, tập trung vào nội dung.',
        colors: {
            primary: '#B8860B', secondary: '#8A7A6A', accent: '#9A7209',
            background: '#FAFAF8', bgEnd: '#F3F0EA', text: '#1C1C1A',
            hero: '#0E0E0D', surface: '#FFFFFF'
        }
    },
    {
        id: 'lotus-champa',
        name: 'Cam Đất — Ấm Áp & Năng Động',
        description: 'Năng động, sáng tạo — phù hợp thương hiệu trẻ.',
        colors: {
            primary: '#C73B2A', secondary: '#F4A028', accent: '#E8896A',
            background: '#FDF6EE', bgEnd: '#FAF0E2', text: '#2D1A0E',
            hero: '#1A0A05', surface: '#FEF9F2'
        }
    },
    {
        id: 'angkor-prasat',
        name: 'Editorial Tối — Vàng & Nâu Gỗ',
        description: 'Phong cách tạp chí cao cấp, nền tối sang trọng.',
        colors: {
            primary: '#D4A843', secondary: '#7A5C3A', accent: '#4A8C6F',
            background: '#2C1A0A', bgEnd: '#1E1106', text: '#F0E8D0',
            hero: '#120800', surface: '#3A2518'
        }
    },
    {
        id: 'zen-anapanasati',
        name: 'Xanh Thiên Nhiên — Bình Tĩnh & Tin Cậy',
        description: 'Xanh tự nhiên — phù hợp thương hiệu bền vững.',
        colors: {
            primary: '#2D6A4F', secondary: '#74C69D', accent: '#D4A843',
            background: '#F2F7F0', bgEnd: '#E8F2E5', text: '#1B4332',
            hero: '#0D2418', surface: '#FFFFFF'
        }
    },
    {
        id: 'sunrise-mekong',
        name: 'Cam Bình Minh — Năng Lượng Tích Cực',
        description: 'Ấm áp, năng động — phù hợp startup và thương mại.',
        colors: {
            primary: '#E05C1A', secondary: '#F4A028', accent: '#BD4291',
            background: '#FFF8F0', bgEnd: '#FFF0E0', text: '#2A1506',
            hero: '#160A03', surface: '#FFFBF5'
        }
    },
    {
        id: 'festival-bon',
        name: 'Tím Đêm — Phong Cách Tech & Startup',
        description: 'Nền tím tối với điểm nhấn vàng neon — digital first.',
        colors: {
            primary: '#FFD700', secondary: '#FF4D6D', accent: '#39D5A0',
            background: '#12023A', bgEnd: '#1A0550', text: '#FFF8E7',
            hero: '#060118', surface: '#1C0A44'
        }
    },

    // ── 3. PREMIUM ENTERPRISE THEMES ───────────────────────────────────────────
    {
        id: 'neo-glassmorphic',
        name: `Premium: Navy & Gold — ${BRAND_NAME_VI}`,
        description: 'Navy Blue & Gold với hiệu ứng kính mờ — chuẩn Enterprise.',
        colors: {
            primary: '#002B5B', secondary: '#FFD700', accent: '#00D2FF',
            background: '#FFFFFF', bgEnd: '#F8F9FA', text: '#1A202C',
            hero: '#0B1120', surface: 'rgba(255, 255, 255, 0.4)'
        }
    },
    {
        id: 'zen-minimalism',
        name: 'Premium: Xám Chì & Xanh Mint — Chuyên Nghiệp',
        description: 'Trung tính, sang trọng — phù hợp tài chính & tư vấn.',
        colors: {
            primary: '#2C3E50', secondary: '#8E8E93', accent: '#A8C69F',
            background: '#F9F9F9', bgEnd: '#F0F0F0', text: '#1A1A1A',
            hero: '#121212', surface: '#FFFFFF'
        }
    },
    {
        id: 'royal-saffron',
        name: 'Premium: Cam Đậm & Vàng — Nhiệt Huyết',
        description: 'Nồng ấm, mạnh mẽ — phù hợp thương hiệu truyền thống.',
        colors: {
            primary: '#D35400', secondary: '#F39C12', accent: '#4A2311',
            background: '#FFF9E6', bgEnd: '#FFE4B5', text: '#3E1E02',
            hero: '#1F0F01', surface: '#FFF8F0'
        }
    },
    {
        id: 'himalayan-maroon',
        name: 'Premium: Đỏ Đô & Vàng — Uy Quyền',
        description: 'Mạnh mẽ, uy nghiêm — phù hợp tập đoàn & chính phủ.',
        colors: {
            primary: '#800000', secondary: '#FFD700', accent: '#1ABC9C',
            background: '#FDFEFE', bgEnd: '#FCE4EC', text: '#4A0000',
            hero: '#2A0000', surface: '#FFFAFA'
        }
    },
    {
        id: 'lotus-purity',
        name: 'Premium: Hồng Nhạt — Sáng Tạo & Tinh Tế',
        description: 'Thanh lịch, nữ tính — phù hợp thương hiệu lifestyle.',
        colors: {
            primary: '#E91E63', secondary: '#F8BBD0', accent: '#CFD8DC',
            background: '#FFFFFF', bgEnd: '#FFF0F5', text: '#440118',
            hero: '#22000C', surface: '#FFFAFC'
        }
    },
    {
        id: 'vietnamese-earth',
        name: 'Premium: Nâu Đất — Mộc Mạc & Tin Cậy',
        description: 'Giản dị, gần gũi — phù hợp thương hiệu địa phương.',
        colors: {
            primary: '#4D2C19', secondary: '#A67C52', accent: '#E67E22',
            background: '#F4ECE1', bgEnd: '#E6D9C8', text: '#26160C',
            hero: '#130B06', surface: '#F9F5F0'
        }
    },
    {
        id: 'celestial-blue',
        name: 'Premium: Xanh Dương & Vàng — Tin Cậy & Chuyên Môn',
        description: 'Xanh biển sâu — phù hợp y tế, giáo dục, CNTT.',
        colors: {
            primary: '#1A5276', secondary: '#5DADE2', accent: '#D4AC0D',
            background: '#EBF5FB', bgEnd: '#D6EAF8', text: '#0A2535',
            hero: '#05121A', surface: '#F4FAFE'
        }
    },
    {
        id: 'imperial-pagoda',
        name: 'Premium: Đỏ & Vàng — Cung Đình Trang Nghiêm',
        description: 'Cổ điển, sang trọng — phù hợp thương hiệu heritage.',
        colors: {
            primary: '#C0392B', secondary: '#D4AF37', accent: '#1B4F72',
            background: '#FEF9E7', bgEnd: '#FCF3CF', text: '#350905',
            hero: '#1B0402', surface: '#FFFBF0'
        }
    },
    {
        id: 'inner-peace-mint',
        name: 'Premium: Xanh Lá Mint & Tím — Hiện Đại & Tươi Mới',
        description: 'Thư giãn, trẻ trung — phù hợp wellbeing & edutech.',
        colors: {
            primary: '#16A085', secondary: '#A2D9CE', accent: '#6C3483',
            background: '#F4F9F4', bgEnd: '#E8F3E8', text: '#0E2923',
            hero: '#071411', surface: '#FBFFFB'
        }
    },
    {
        id: 'ancient-forest',
        name: 'Premium: Xanh Rừng & Nâu Đất — Bền Vững',
        description: 'Trầm mặc, bền vững — phù hợp thương hiệu xanh.',
        colors: {
            primary: '#1B5E20', secondary: '#795548', accent: '#F1C40F',
            background: '#E8F5E9', bgEnd: '#C8E6C9', text: '#0D2E10',
            hero: '#061708', surface: '#F1F8F1'
        }
    },
    {
        id: 'dharma-wheel',
        name: 'Premium: Cam & Xanh & Đỏ — Đa Sắc Quốc Tế',
        description: 'Sống động, hòa hợp — phù hợp tổ chức quốc tế.',
        colors: {
            primary: '#FF9800', secondary: '#2196F3', accent: '#F44336',
            background: '#FAFAFA', bgEnd: '#F5F5F5', text: '#1C1C1C',
            hero: '#111111', surface: '#FFFFFF'
        }
    },
    {
        id: 'forest-gold-premium',
        name: 'Premium: Xanh & Vàng Hoàng Kim — Đẳng Cấp',
        description: 'Kết hợp xanh rừng già và vàng hoàng gia — bình an và trù phú.',
        colors: {
            primary: '#1B5E20', secondary: '#D4AF37', accent: '#FFD700',
            background: '#FFFFFF', bgEnd: '#F1F8E9', text: '#1A2421',
            hero: '#0A1B0E', surface: '#F8FAF8', opacity: '0.05'
        }
    },
    {
        id: 'modern_tech',
        name: 'SaaS: Neon Cyberpunk Tech — Phá Cách',
        description: 'Tông màu Neon Cyan & Dark Space — khẳng định đẳng cấp SaaS công nghệ.',
        colors: {
            primary: '#00F0FF', secondary: '#8A2BE2', accent: '#FF007F',
            background: '#060B13', bgEnd: '#0D1527', text: '#E2F1FF',
            hero: '#03060B', surface: '#0E1726'
        }
    }
];

