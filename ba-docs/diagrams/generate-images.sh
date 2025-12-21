#!/bin/bash

# Script để generate hình ảnh từ PlantUML files
# Yêu cầu: Cài đặt PlantUML

echo "🚀 Bắt đầu generate hình ảnh từ PlantUML..."

# Di chuyển đến thư mục diagrams
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Kiểm tra PlantUML có được cài đặt chưa
PLANTUML_CMD=""
if command -v plantuml &> /dev/null; then
    PLANTUML_CMD="plantuml"
    echo "✅ Tìm thấy PlantUML command"
elif [ -f "/opt/homebrew/bin/plantuml" ]; then
    PLANTUML_CMD="/opt/homebrew/bin/plantuml"
    echo "✅ Tìm thấy PlantUML tại /opt/homebrew/bin/plantuml"
elif command -v java &> /dev/null && [ -f "plantuml.jar" ]; then
    PLANTUML_CMD="java -jar plantuml.jar"
    echo "✅ Sử dụng plantuml.jar"
else
    echo "❌ Chưa cài đặt PlantUML!"
    echo "📦 Cài đặt bằng một trong các cách sau:"
    echo "   1. brew install plantuml (macOS)"
    echo "   2. npm install -g node-plantuml (sau đó dùng: puml generate)"
    echo "   3. Download plantuml.jar từ http://plantuml.com/download"
    exit 1
fi

# Tìm tất cả file .puml
FILES=$(find . -maxdepth 1 -name "*.puml" -type f)

if [ -z "$FILES" ]; then
    echo "❌ Không tìm thấy file .puml nào!"
    exit 1
fi

echo "📄 Tìm thấy $(echo "$FILES" | wc -l) file .puml"
echo ""

# Generate hình ảnh cho mỗi file
COUNT=0
FAILED=0
for file in $FILES; do
    filename=$(basename "$file" .puml)
    echo -n "📄 Đang xử lý: $filename.puml ... "
    
    # Generate PNG
    if $PLANTUML_CMD -tpng "$file" -o . 2>/dev/null; then
        if [ -f "${filename}.png" ]; then
            echo "✅"
            COUNT=$((COUNT + 1))
        else
            echo "⚠️  (file không được tạo)"
            FAILED=$((FAILED + 1))
        fi
    else
        echo "❌ (lỗi)"
        FAILED=$((FAILED + 1))
    fi
done

echo ""
if [ $FAILED -eq 0 ]; then
    echo "✨ Hoàn thành! Đã tạo $COUNT hình ảnh."
else
    echo "⚠️  Đã tạo $COUNT hình ảnh, $FAILED file lỗi."
fi
echo "📍 Vị trí: $(pwd)"
