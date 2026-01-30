#!/bin/bash

# Script để build, push và deploy ứng dụng

# Cấu hình
IMAGE_NAME="nvtaikma/quizizz-app"
TAG="BE-manager"
FULL_IMAGE_NAME="$IMAGE_NAME:$TAG"

# Màu sắc cho output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Bắt đầu quá trình build và deploy ===${NC}"

# Build Docker image
echo -e "${YELLOW}1. Building Docker image ${FULL_IMAGE_NAME}...${NC}"
docker build -t $FULL_IMAGE_NAME .

if [ $? -ne 0 ]; then
    echo -e "${RED}Lỗi: Không thể build Docker image.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Build Docker image thành công!${NC}"

# Push lên Docker Hub
echo -e "${YELLOW}2. Pushing Docker image ${FULL_IMAGE_NAME} lên Docker Hub...${NC}"
docker push $FULL_IMAGE_NAME

if [ $? -ne 0 ]; then
    echo -e "${RED}Lỗi: Không thể push Docker image lên Docker Hub.${NC}"
    echo -e "${YELLOW}Thử đăng nhập Docker Hub...${NC}"
    docker login
    
    echo -e "${YELLOW}Thử push lại...${NC}"
    docker push $FULL_IMAGE_NAME
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Lỗi: Vẫn không thể push Docker image lên Docker Hub.${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✓ Push Docker image lên Docker Hub thành công!${NC}"

# Deploy lên VPS nếu có thông tin SSH
echo -e "${YELLOW}3. Bạn có muốn deploy lên VPS không? (y/n)${NC}"
read deploy_choice

if [ "$deploy_choice" = "y" ] || [ "$deploy_choice" = "Y" ]; then
    echo -e "${YELLOW}Nhập địa chỉ SSH của VPS (ví dụ: user@ip_address):${NC}"
    read ssh_address
    
    echo -e "${YELLOW}Nhập MongoDB URI (mặc định: mongodb://localhost:27017/google-auth):${NC}"
    read mongodb_uri
    mongodb_uri=${mongodb_uri:-"mongodb://localhost:27017/google-auth"}
    
    if [ -z "$ssh_address" ]; then
        echo -e "${RED}Không có địa chỉ SSH, bỏ qua bước deploy.${NC}"
    else
        echo -e "${YELLOW}Đang deploy lên VPS ${ssh_address}...${NC}"
        
        # Tạo docker-compose tạm thời
        TMP_COMPOSE=$(cat docker-compose.yml | sed "s|MONGODB_URI=mongodb://host.docker.internal:27017/google-auth|MONGODB_URI=${mongodb_uri}|g")
        
        # Tạo script để chạy trên VPS
        deploy_commands="
        mkdir -p ~/be-manager
        cd ~/be-manager
        
        # Tạo hoặc cập nhật docker-compose.yml
        cat > docker-compose.yml << 'EOL'
$TMP_COMPOSE
EOL
        
        # Đảm bảo MongoDB đang chạy (nếu sử dụng MongoDB local)
        echo 'Kiểm tra MongoDB...'
        if command -v mongod &> /dev/null; then
            systemctl status mongod || echo 'MongoDB không chạy trên hệ thống, đảm bảo kết nối MongoDB của bạn đã được cấu hình đúng'
        else
            echo 'MongoDB không được cài đặt trên hệ thống, đảm bảo kết nối MongoDB của bạn đã được cấu hình đúng'
        fi
        
        # Pull image mới nhất
        docker pull $FULL_IMAGE_NAME
        
        # Khởi động lại services
        docker-compose down
        docker-compose up -d
        
        echo 'Deployment completed!'
        "
        
        # Thực thi script trên VPS
        ssh $ssh_address "$deploy_commands"
        
        if [ $? -ne 0 ]; then
            echo -e "${RED}Lỗi: Không thể deploy lên VPS.${NC}"
            exit 1
        fi
        echo -e "${GREEN}✓ Deploy lên VPS thành công!${NC}"
    fi
else
    echo -e "${YELLOW}Bỏ qua bước deploy lên VPS.${NC}"
fi

echo -e "${GREEN}=== Quá trình build và deploy hoàn tất! ===${NC}" 