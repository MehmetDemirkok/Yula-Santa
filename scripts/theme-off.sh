#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# Yılbaşı Temasını KAPAT
# ═══════════════════════════════════════════════════════════════════════════
# Bu script yılbaşı temasını devre dışı bırakır.
# Kullanım: npm run theme:off
# ═══════════════════════════════════════════════════════════════════════════

CONFIG_FILE="components/NewYearTheme/config.ts"

if [ -f "$CONFIG_FILE" ]; then
    # THEME_OVERRIDE = * → "off"
    sed -i '' 's/export const THEME_OVERRIDE: ThemeOverride = "[a-z]*";/export const THEME_OVERRIDE: ThemeOverride = "off";/g' "$CONFIG_FILE"
    echo "✅ Yılbaşı teması KAPATILDI!"
    echo "📁 Değiştirilen dosya: $CONFIG_FILE"
    echo ""
    echo "Tekrar açmak için: npm run theme:on"
else
    echo "❌ Hata: $CONFIG_FILE bulunamadı!"
    exit 1
fi