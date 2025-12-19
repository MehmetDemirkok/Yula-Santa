// AdSense Configuration
// This file contains all the ad-related configuration

/**
 * Ad Slot IDs
 * Replace these with your actual ad slot IDs from Google AdSense
 * You'll get these IDs after creating ad units in your AdSense account
 */
export const AD_SLOTS = {
    // Banner ad for top/bottom of pages
    BANNER_TOP: process.env.NEXT_PUBLIC_AD_SLOT_BANNER_TOP || '1234567890',
    BANNER_BOTTOM: process.env.NEXT_PUBLIC_AD_SLOT_BANNER_BOTTOM || '1234567891',

    // Rectangle/Square ad for sidebars
    RECTANGLE: process.env.NEXT_PUBLIC_AD_SLOT_RECTANGLE || '2345678901',

    // In-content/In-feed ad
    IN_ARTICLE: process.env.NEXT_PUBLIC_AD_SLOT_IN_ARTICLE || '3456789012',

    // Auto ad that adjusts to available space
    AUTO: process.env.NEXT_PUBLIC_AD_SLOT_AUTO || '4567890123',
};

/**
 * Ad Display Configuration
 */
export const AD_CONFIG = {
    // Whether to show ads (can be disabled for testing)
    enabled: process.env.NODE_ENV === 'production',

    // Show placeholder ads in development
    showPlaceholders: process.env.NODE_ENV === 'development',

    // Minimum screen width for showing sidebar ads
    minWidthForSidebar: 1024,
};

/**
 * AdSense Publisher ID
 * Format: ca-pub-XXXXXXXXXXXXXXXX
 */
export const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-XXXXXXXXXXXXXXXX';
