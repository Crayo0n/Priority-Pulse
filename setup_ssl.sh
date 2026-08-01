#!/bin/bash
# setup_ssl.sh
# Genera un certificado SSL autofirmado para pruebas y lo coloca en la carpeta haproxy
echo "Generando certificado SSL autofirmado (cert.pem) para HAProxy..."

cd haproxy || exit 1
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert_only.pem -days 365 -nodes -subj "/C=MX/ST=Queretaro/L=Queretaro/O=PriorityPulse/CN=localhost"
cat cert_only.pem key.pem > cert.pem
rm key.pem cert_only.pem

echo "==========================================================="
echo "Certificado generado exitosamente en: haproxy/cert.pem"
echo "==========================================================="
