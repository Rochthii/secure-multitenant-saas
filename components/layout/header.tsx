'use client';

import React from 'react';
import type { CategoryNode, PageNode } from '@/lib/cache/queries';
import { TraditionalHeader } from './headers/traditional-header';
import { MinimalHeader } from './headers/minimal-header';
import { ModernHeader } from './headers/modern-header';
import { LotusHeader } from './headers/lotus-header';
import { AngkorHeader } from './headers/angkor-header';
import { ZenHeader } from './headers/zen-header';
import { SunriseHeader } from './headers/sunrise-header';
import { FestivalHeader } from './headers/festival-header';
import { McAaronHeader } from './headers/mcaaron-header';
import { TheraHeader } from './headers/thera-header';
import { InkHeader } from './headers/ink-header';
import { CorporateHeader } from './headers/corporate-header';
import { BlockConfig } from '@/lib/types/layout-blocks';

export type HeaderProps = {
    settings?: Record<string, string>;
    categoriesTree?: { news: CategoryNode[], dharma: CategoryNode[], documents: CategoryNode[], transactions?: CategoryNode[] };
    pagesTree?: PageNode[];
    aboutSectionsTree?: CategoryNode[];
    layoutStyle?: string;
    layoutBlocks?: BlockConfig[];
    domain?: string;
    modulesConfig?: Record<string, boolean>;
    isCompany?: boolean;
    hasProjects?: boolean;
    /** Cấu hình bật/tắt từng mục trên Header. Key: 'home'|'about'|'news'|'dharma'|'documents'|'transaction'|'contact' */
    navVisibility?: Record<string, boolean>;
};

export function Header({ settings = {}, categoriesTree, pagesTree, aboutSectionsTree, layoutStyle = 'traditional', layoutBlocks = [], domain, modulesConfig, isCompany, hasProjects, navVisibility = {} }: HeaderProps) {
    const props = { 
        settings, 
        categoriesTree, 
        pagesTree, 
        aboutSectionsTree, 
        layoutBlocks: layoutBlocks || [], 
        domain, 
        modulesConfig, 
        isCompany, 
        hasProjects, 
        navVisibility: navVisibility || {} 
    };

    switch (layoutStyle) {
        case 'corporate': return <CorporateHeader {...props} />;
        case 'mcaaron': return <McAaronHeader {...props} />;
        case 'minimal': return <MinimalHeader {...props} />;
        case 'modern': return <ModernHeader {...props} />;
        case 'lotus': return <LotusHeader {...props} />;
        case 'angkor': return <AngkorHeader {...props} />;
        case 'zen': return <ZenHeader {...props} />;
        case 'sunrise': return <SunriseHeader {...props} />;
        case 'festival': return <FestivalHeader {...props} />;
        case 'theravada': return <TheraHeader {...props} />;
        case 'ink': return <InkHeader {...props} />;
        case 'traditional':
        default:
            return <TraditionalHeader {...props} />;
    }
}
