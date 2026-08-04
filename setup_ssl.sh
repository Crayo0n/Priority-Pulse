#!/bin/bash
# setup_ssl.sh
# Genera un certificado SSL autofirmado para pruebas y lo coloca en la carpeta haproxy
echo "Generando certificado SSL autofirmado (cert.pem) para HAProxy con SAN..."

cd haproxy || exit 1

# Crear archivo de configuración temporal con SAN
cat > san.cnf <<EOF
[req]
default_bits       = 2048
distinguished_name = req_distinguished_name
x509_extensions    = v3_req
prompt             = no

[req_distinguished_name]
C  = MX
ST = Queretaro
L  = Queretaro
O  = PriorityPulse
CN = server-local.tail26b2e6.ts.net

[v3_req]
subjectAltName = @alt_names

[alt_names]
DNS.1 = server-local.tail26b2e6.ts.net
IP.1 = 100.127.235.68
DNS.2 = localhost
EOF

openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert_only.pem -days 365 -nodes -config san.cnf

cat cert_only.pem key.pem > cert.pem
rm key.pem cert_only.pem san.cnf

echo "==========================================================="
echo "Certificado generado exitosamente en: haproxy/cert.pem"
echo "==========================================================="

echo "Reiniciando el contenedor de HAProxy para aplicar el certificado..."
cd ..
docker compose restart haproxy
echo "HAProxy reiniciado exitosamente."
