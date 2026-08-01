#!/bin/bash
# setup_firewall.sh
# Configura UFW y Fail2ban para proteger el servidor Ubuntu
echo "Iniciando configuración de Firewall (UFW) y Fail2ban..."

# Actualizar repos e instalar paquetes
sudo apt update
sudo apt install -y ufw fail2ban

# Resetear reglas previas de UFW
sudo ufw --force reset

# Establecer políticas por defecto
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Abrir puertos esenciales
echo "Abriendo puertos 22 (SSH), 80 (HTTP), y 443 (HTTPS)..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Opcional: Puerto de Tailscale
sudo ufw allow 41641/udp

sudo ufw allow in on tailscale0

# Habilitar el Firewall (forzado para no requerir confirmación interactiva)
sudo ufw --force enable

# Iniciar y habilitar Fail2ban para arranque automático
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

echo "==========================================================="
echo "Firewall (UFW) y Fail2ban configurados y activados."
echo "Puedes comprobar el estado con: sudo ufw status verbose"
echo "==========================================================="
