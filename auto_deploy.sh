#!/bin/bash

# 鑷姩閮ㄧ讲鑴氭湰 - RestorePhotos 椤圭洰
# 浣跨敤鏂规硶: ./auto_deploy.sh

# 閰嶇疆淇℃伅
SERVER_IP="49.232.38.171"
SERVER_USER="root"
SERVER_DIR="/root/restorephotos"

# 棰滆壊瀹氫箟
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}寮€濮嬮儴缃?RestorePhotos 椤圭洰...${NC}"

# 妫€鏌ュ繀瑕佹枃浠舵槸鍚﹀瓨鍦?check_files() {
    echo -e "${YELLOW}妫€鏌ュ繀瑕佹枃浠?..${NC}"
    local missing=0
    
    for file in Dockerfile docker-compose.yml .env init-db/01-init-db.sql; do
        if [ ! -f "$file" ]; then
            echo -e "${RED}閿欒: 缂哄皯鏂囦欢 $file${NC}"
            missing=1
        fi
    done
    
    if [ $missing -eq 1 ]; then
        echo -e "${RED}璇风‘淇濇墍鏈夊繀瑕佹枃浠堕兘瀛樺湪鍚庡啀灏濊瘯閮ㄧ讲${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}鎵€鏈夊繀瑕佹枃浠舵鏌ラ€氳繃${NC}"
}

# 浼犺緭鏂囦欢鍒版湇鍔″櫒
transfer_files() {
    echo -e "${YELLOW}姝ｅ湪浼犺緭鏂囦欢鍒版湇鍔″櫒 $SERVER_IP...${NC}"
    
    # 鍒涘缓鐩綍锛堝鏋滀笉瀛樺湪锛?    ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "mkdir -p $SERVER_DIR/init-db"
    
    # 浼犺緭鍏抽敭鏂囦欢
    scp -o StrictHostKeyChecking=no Dockerfile docker-compose.yml $SERVER_USER@$SERVER_IP:$SERVER_DIR/
    scp -o StrictHostKeyChecking=no .env $SERVER_USER@$SERVER_IP:$SERVER_DIR/
    scp -o StrictHostKeyChecking=no init-db/01-init-db.sql $SERVER_USER@$SERVER_IP:$SERVER_DIR/init-db/
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}鏂囦欢浼犺緭鎴愬姛${NC}"
    else
        echo -e "${RED}鏂囦欢浼犺緭澶辫触${NC}"
        exit 1
    fi
}

# 鏋勫缓鍜屽惎鍔ㄦ湇鍔?build_and_start() {
    echo -e "${YELLOW}姝ｅ湪鏋勫缓鍜屽惎鍔ㄦ湇鍔?..${NC}"
    
    ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "cd $SERVER_DIR && docker-compose down -v && docker-compose up -d --build"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}鏈嶅姟鏋勫缓鍜屽惎鍔ㄥ懡浠ゆ墽琛屾垚鍔?{NC}"
    else
        echo -e "${RED}鏈嶅姟鏋勫缓鍜屽惎鍔ㄥけ璐?{NC}"
        exit 1
    fi
}

# 绛夊緟鏈嶅姟鍚姩
wait_for_service() {
    echo -e "${YELLOW}绛夊緟鏈嶅姟鍚姩骞跺畬鎴愬垵濮嬪寲...${NC}"
    sleep 15  # 缁欐湇鍔¤冻澶熺殑鍚姩鏃堕棿
}

# 楠岃瘉閮ㄧ讲鐘舵€?verify_deployment() {
    echo -e "${YELLOW}楠岃瘉閮ㄧ讲鐘舵€?..${NC}"
    
    # 妫€鏌ュ鍣ㄧ姸鎬?    echo -e "${YELLOW}妫€鏌ュ鍣ㄨ繍琛岀姸鎬?${NC}"
    ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "cd $SERVER_DIR && docker-compose ps"
    
    # 妫€鏌ョ鍙ｇ洃鍚儏鍐?    echo -e "${YELLOW}妫€鏌ョ鍙ｇ洃鍚儏鍐?${NC}"
    ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "netstat -tulpn | grep -E '3001|5432'"
    
    # 娴嬭瘯鏈嶅姟鍙闂€?    echo -e "${YELLOW}娴嬭瘯鏈嶅姟鍙闂€?${NC}"
    ssh -o StrictHostKeyChecking=no $SERVER_USER@$SERVER_IP "curl -s -I http://localhost:3001 | head -1"
    
    echo -e "${GREEN}閮ㄧ讲楠岃瘉瀹屾垚${NC}"
}

# 涓诲嚱鏁?main() {
    check_files
    transfer_files
    build_and_start
    wait_for_service
    verify_deployment
    
    echo -e "${GREEN}=====================================${NC}"
    echo -e "${GREEN}閮ㄧ讲瀹屾垚!${NC}"
    echo -e "${GREEN}搴旂敤鍦板潃: http://$SERVER_IP:3001${NC}"
    echo -e "${GREEN}=====================================${NC}"
}

# 鎵ц涓诲嚱鏁?main
