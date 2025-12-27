#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# Yılbaşı Temasını AÇ
# ═══════════════════════════════════════════════════════════════════════════
# Bu script yılbaşı temasını tekrar aktif eder.
# Kullanım: npm run theme:on
# ═══════════════════════════════════════════════════════════════════════════

CONFIG_FILE="components/NewYearTheme/config.ts"

if [ -f "$CONFIG_FILE" ]; then
    # ENABLE_NEW_YEAR_THEME = false → true
    sed -i '' 's/export const ENABLE_NEW_YEAR_THEME = false;/export const ENABLE_NEW_YEAR_THEME = true;/g' "$CONFIG_FILE"
    echo "✅ Yılbaşı teması AÇILDI!"
    echo "📁 Değiştirilen dosya: $CONFIG_FILE"
    echo ""
    echo "Kapatmak için: npm run theme:off"
else
    echo "❌ Hata: $CONFIG_FILE bulunamadı!"
    exit 1
fi
