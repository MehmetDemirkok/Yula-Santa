/**
 * ═══════════════════════════════════════════════════════════════════════════
 * Navigation Utilities for next-intl
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * This file exports navigation utilities that are locale-aware.
 * Updated for next-intl v4.x which uses createNavigation instead of 
 * createSharedPathnamesNavigation.
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { createNavigation } from 'next-intl/navigation';
import { locales, localePrefix, defaultLocale } from './config';

export const { Link, redirect, usePathname, useRouter, permanentRedirect } =
    createNavigation({ locales, localePrefix, defaultLocale });
