#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# Yılbaşı Temasını KAPAT
# ═══════════════════════════════════════════════════════════════════════════
# Bu script yılbaşı temasını devre dışı bırakır.
# Kullanım: npm run theme:off
# ═══════════════════════════════════════════════════════════════════════════

CONFIG_FILE="components/NewYearTheme/config.ts"

if [ -f "$CONFIG_FILE" ]; then
    # ENABLE_NEW_YEAR_THEME = true → false
    sed -i '' 's/export const ENABLE_NEW_YEAR_THEME = true;/export const ENABLE_NEW_YEAR_THEME = false;/g' "$CONFIG_FILE"
    echo "✅ Yılbaşı teması KAPATILDI!"
    echo "📁 Değiştirilen dosya: $CONFIG_FILE"
    echo ""
    echo "Tekrar açmak için: npm run theme:on"
else
    echo "❌ Hata: $CONFIG_FILE bulunamadı!"
    exit 1
fi