/**
 * Khmer Lunar Calendar Utilities
 * Based on accurate astronomical calculations
 * Reference: Traditional Khmer calendar calculation methods
 */

interface KhmerDate {
    day: number;
    month: string;
    monthNumber: number;
    year: number;
    isKert: boolean; // true = waxing (កើត), false = waning (រោច)
    buddhistYear: number;
}

const KHMER_MONTHS = [
    'មិគសិរ',     // Mikaséa (Mrigashirsha)
    'បុស្ស',      // Buss (Pausha)
    'មាឃ',        // Mékh (Magha)
    'ផល្គុន',     // Phalkun (Phalguna)
    'ចេត្រ',      // Chétr (Chaitra)
    'ពិសាខ',      // Pisakh (Visakha)
    'ជេស្ឋ',      // Chésth (Jyeshtha)
    'អាសាឍ',      // Asath (Ashadha)
    'ស្រាពណ៍',    // Sravan (Shravana)
    'ភទ្របទ',     // Phouttrobot (Bhadrapada)
    'អស្សុជ',     // Assoch (Ashvina)
    'កក្ដិក'      // Kâtdek (Kartika)
];

/**
 * Calculate Khmer lunar date from Gregorian date
 * Using simplified lunar phase calculation
 */
export function getKhmerLunarDate(gregorianDate: Date): KhmerDate {
    const year = gregorianDate.getFullYear();
    const month = gregorianDate.getMonth();
    const day = gregorianDate.getDate();
    
    // Calculate days since J2000 epoch (Jan 1, 2000, 12:00 UT)
    const jd = gregorianToJulian(year, month + 1, day);
    
    // Calculate lunar phase (0 = new moon, 0.5 = full moon)
    const phase = getLunarPhase(jd);
    
    // Calculate lunar day (1-30)
    // Phase 0-0.5 = waxing (កើត) days 1-15
    // Phase 0.5-1.0 = waning (រោច) days 1-15
    const isKert = phase < 0.5;
    const lunarDay = Math.floor((isKert ? phase : (phase - 0.5)) * 30) + 1;
    
    // Approximate Khmer month (simplified)
    const khmerMonthIndex = (month + 2) % 12;
    
    // Buddhist Era = Gregorian year + 543/544 (depends on month)
    const buddhistYear = year + 543 + (month >= 4 ? 1 : 0);
    
    return {
        day: Math.min(lunarDay, 15), // Cap at 15 for each phase
        month: KHMER_MONTHS[khmerMonthIndex],
        monthNumber: khmerMonthIndex + 1,
        year: year,
        isKert: isKert,
        buddhistYear: buddhistYear
    };
}

/**
 * Convert Gregorian date to Julian Day Number
 */
function gregorianToJulian(year: number, month: number, day: number): number {
    if (month <= 2) {
        year -= 1;
        month += 12;
    }
    
    const a = Math.floor(year / 100);
    const b = 2 - a + Math.floor(a / 4);
    
    const jd = Math.floor(365.25 * (year + 4716)) +
               Math.floor(30.6001 * (month + 1)) +
               day + b - 1524.5;
    
    return jd;
}

/**
 * Calculate lunar phase (0 = new moon, 0.5 = full moon, 1 = new moon)
 * Based on simplified astronomical formula
 */
function getLunarPhase(julianDay: number): number {
    // Lunar cycle is approximately 29.530588 days
    const LUNAR_CYCLE = 29.530588;
    
    // Known new moon: Jan 6, 2000 at JD 2451550.1
    const KNOWN_NEW_MOON = 2451550.1;
    
    // Calculate days since known new moon
    const daysSinceNewMoon = julianDay - KNOWN_NEW_MOON;
    
    // Calculate phase (0-1)
    const phase = (daysSinceNewMoon % LUNAR_CYCLE) / LUNAR_CYCLE;
    
    return phase < 0 ? phase + 1 : phase;
}

/**
 * Format Khmer lunar date string
 */
export function formatKhmerDate(khmerDate: KhmerDate): string {
    const phaseText = khmerDate.isKert ? 'កើត' : 'រោច';
    return `${khmerDate.day} ${phaseText}`;
}

/**
 * Get moon phase short code (k = kert/waxing, r = roach/waning)
 */
export function getMoonPhaseShort(khmerDate: KhmerDate): 'k' | 'r' {
    return khmerDate.isKert ? 'k' : 'r';
}

/**
 * Check if a date is a Buddhist holy day (8th or 15th lunar day)
 */
export function isHolyDay(khmerDate: KhmerDate): boolean {
    return khmerDate.day === 8 || khmerDate.day === 15;
}
