import React from 'react';
import { TraditionalFooter } from './footers/traditional-footer';
import { MinimalFooter } from './footers/minimal-footer';
import { ModernFooter } from './footers/modern-footer';
import { LotusFooter } from './footers/lotus-footer';
import { AngkorFooter } from './footers/angkor-footer';
import { ZenFooter } from './footers/zen-footer';
import { SunriseFooter } from './footers/sunrise-footer';
import { FestivalFooter } from './footers/festival-footer';
import { McAaronFooter } from './footers/mcaaron-footer';
import { TheraFooter } from './footers/thera-footer';
import { InkFooter } from './footers/ink-footer';
import { CorporateFooter } from './footers/corporate-footer';

export function Footer({ settings = {}, layoutStyle = 'traditional', domain, isCompany, hasProjects, modulesConfig }: { 
    settings?: Record<string, string>, 
    layoutStyle?: string, 
    domain?: string, 
    isCompany?: boolean,
    hasProjects?: boolean,
    modulesConfig?: Record<string, boolean>
}) {
    const props = { settings, domain, isCompany, hasProjects, modulesConfig };

    switch (layoutStyle) {
        case 'corporate': return <CorporateFooter {...props} />;
        case 'mcaaron': return <McAaronFooter {...props} />;
        case 'minimal': return <MinimalFooter {...props} />;
        case 'modern': return <ModernFooter {...props} />;
        case 'lotus': return <LotusFooter {...props} />;
        case 'angkor': return <AngkorFooter {...props} />;
        case 'zen': return <ZenFooter {...props} />;
        case 'sunrise': return <SunriseFooter {...props} />;
        case 'festival': return <FestivalFooter {...props} />;
        case 'theravada': return <TheraFooter {...props} />;
        case 'ink': return <InkFooter {...props} />;
        case 'traditional':
        default:
            return <TraditionalFooter {...props} />;
    }
}
