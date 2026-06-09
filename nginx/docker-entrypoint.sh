#!/bin/sh
# Entry script for Nginx with SSL certificate generation

set -e

CERT_DIR="/etc/nginx/certs"
CERT_FILE="$CERT_DIR/certificate.crt"
KEY_FILE="$CERT_DIR/private.key"

# Create dirs if they don't exist
mkdir -p "$CERT_DIR"

# Generate certs if they don't exist
if [ ! -f "$CERT_FILE" ] || [ ! -f "$KEY_FILE" ]; then
    echo "Generating self-signed SSL certificates..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout "$KEY_FILE" \
      -out "$CERT_FILE" \
      -subj "/C=ES/ST=Madrid/L=Madrid/O=42/CN=localhost" \
      -batch
    echo "Certificates generated in $CERT_DIR"
else
    echo "Certificates found"
fi

# Initiate Nginx
echo "Initiating Nginx..."
exec nginx -g "daemon off;"