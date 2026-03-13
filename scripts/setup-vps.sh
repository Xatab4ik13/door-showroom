#!/bin/bash
# Первоначальная настройка VPS для rusdoors.su
# Запустить: sudo bash setup-vps.sh

set -e

echo "=== 1. Обновление системы ==="
apt update && apt upgrade -y

echo "=== 2. Установка Docker ==="
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

echo "=== 3. Установка Docker Compose ==="
apt install -y docker-compose-plugin

echo "=== 4. Установка Git ==="
apt install -y git

echo "=== 5. Создание директории проекта ==="
mkdir -p /opt/rusdoors
cd /opt/rusdoors

echo "=== 6. Клонирование репозитория ==="
echo "Выполните вручную:"
echo "  cd /opt/rusdoors"
echo "  git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git ."
echo ""
echo "=== 7. Создайте .env файл ==="
echo "  cp backend/.env.example .env"
echo "  nano .env  # заполните реальные значения"
echo ""
echo "=== 8. Получение SSL сертификата ==="
echo "  # Сначала запустите без SSL:"
echo "  docker compose up -d nginx"
echo "  # Получите сертификат:"
echo "  docker compose run --rm certbot certonly --webroot -w /var/www/certbot -d rusdoors.su -d www.rusdoors.su"
echo "  # Перезапустите:"
echo "  docker compose restart nginx"
echo ""
echo "=== 9. Запуск всех сервисов ==="
echo "  docker compose up -d"
echo ""
echo "=== Готово! ==="
