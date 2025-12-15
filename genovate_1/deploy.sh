
#!/bin/bash

# This script is designed to be run on the Google Compute Engine VM from within the unzipped project directory.
# It prepares the frontend to connect to the backend using the VM's public IP
# and then launches the application using Docker Compose.

# Exit immediately if a command exits with a non-zero status.
set -e

# Check if the static IP address is provided as an argument
if [ -z "$1" ]; then
  echo "Error: No static IP address provided."
  echo "Usage: ./deploy.sh <your-static-ip-address>"
  exit 1
fi

STATIC_IP=$1
BACKEND_URL="http://${STATIC_IP}:8000"
FRONTEND_API_SERVICE_FILE="services/apiService.ts"
PLACEHOLDER_URL="http://127.0.0.1:8000"

echo "--- Starting Deployment ---"

# 1. Configure Frontend
echo "[1/3] Configuring frontend to connect to backend at: ${BACKEND_URL}"

# Check if the apiService.ts file exists
if [ ! -f "$FRONTEND_API_SERVICE_FILE" ]; then
    echo "Error: Frontend API service file not found at ${FRONTEND_API_SERVICE_FILE}"
    exit 1
fi

# Use sed to replace the placeholder URL with the actual public IP.
# The `|| [[ $? == 1 ]]` part handles cases where sed exits with 1 if no replacement is made.
sed -i "s|${PLACEHOLDER_URL}|${BACKEND_URL}|g" "$FRONTEND_API_SERVICE_FILE" || [[ $? == 1 ]]
# Also update the server status hook
sed -i "s|${PLACEHOLDER_URL}|${BACKEND_URL}|g" "hooks/useServerStatus.ts" || [[ $? == 1 ]]

echo "Frontend configuration complete."

# 2. Build and Run Docker Containers
echo "[2/3] Building and launching Docker containers in detached mode..."
sudo /usr/local/bin/docker-compose up --build -d

# 3. Final Confirmation
echo "[3/3] Deployment script finished."
echo ""
echo "----------------------------------------------------"
echo "✅ Application has been deployed!"
echo "You can now access it at: http://${STATIC_IP}"
echo "To view logs, run: sudo /usr/local/bin/docker-compose logs -f"
echo "To stop the application, run: sudo /usr/local/bin/docker-compose down"
echo "----------------------------------------------------"
echo ""
