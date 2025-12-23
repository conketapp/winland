#!/bin/bash

# Deploy script for server using Podman
# This script pulls Docker images from Docker Hub and runs them with Podman

set -e

# Configuration
DOCKER_HUB_USERNAME="${DOCKER_HUB_USERNAME:-your-username}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
BACKEND_PORT="${BACKEND_PORT:-3002}"
ADMIN_PORT="${ADMIN_PORT:-80}"
CTV_PORT="${CTV_PORT:-3000}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting deployment...${NC}"

# Function to check if podman is installed
check_podman() {
    if ! command -v podman &> /dev/null; then
        echo -e "${RED}❌ Podman is not installed. Please install it first.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Podman is installed${NC}"
}

# Function to pull image
pull_image() {
    local image_name=$1
    local full_image="${DOCKER_HUB_USERNAME}/${image_name}:${IMAGE_TAG}"
    
    echo -e "${YELLOW}📥 Pulling ${full_image}...${NC}"
    podman pull "${full_image}" || {
        echo -e "${RED}❌ Failed to pull ${full_image}${NC}"
        exit 1
    }
    echo -e "${GREEN}✅ Successfully pulled ${full_image}${NC}"
}

# Function to stop and remove existing container
stop_container() {
    local container_name=$1
    
    if podman ps -a --format "{{.Names}}" | grep -q "^${container_name}$"; then
        echo -e "${YELLOW}🛑 Stopping existing container ${container_name}...${NC}"
        podman stop "${container_name}" || true
        podman rm "${container_name}" || true
        echo -e "${GREEN}✅ Container ${container_name} stopped and removed${NC}"
    fi
}

# Function to create pod (optional - for networking)
create_pod() {
    local pod_name="winland-pod"
    
    if podman pod exists "${pod_name}"; then
        echo -e "${YELLOW}🛑 Stopping existing pod ${pod_name}...${NC}"
        podman pod stop "${pod_name}" || true
        podman pod rm "${pod_name}" || true
    fi
    
    echo -e "${YELLOW}📦 Creating pod ${pod_name}...${NC}"
    podman pod create --name "${pod_name}" \
        -p "${BACKEND_PORT}:3002" \
        -p "${ADMIN_PORT}:80" \
        -p "${CTV_PORT}:3000" || {
        echo -e "${RED}❌ Failed to create pod${NC}"
        exit 1
    }
    echo -e "${GREEN}✅ Pod ${pod_name} created${NC}"
}

# Function to run backend container
run_backend() {
    local container_name="winland-backend"
    local image_name="winland-backend"
    local full_image="${DOCKER_HUB_USERNAME}/${image_name}:${IMAGE_TAG}"
    
    stop_container "${container_name}"
    
    echo -e "${YELLOW}🚀 Starting backend container...${NC}"
    podman run -d \
        --name "${container_name}" \
        --pod winland-pod \
        -e DATABASE_URL="${DATABASE_URL}" \
        -e BACKEND_PORT="${BACKEND_PORT}" \
        -e JWT_SECRET="${JWT_SECRET}" \
        -e JWT_EXPIRES_IN="${JWT_EXPIRES_IN:-7d}" \
        --restart unless-stopped \
        "${full_image}" || {
        echo -e "${RED}❌ Failed to start backend container${NC}"
        exit 1
    }
    echo -e "${GREEN}✅ Backend container started${NC}"
}

# Function to run admin container
run_admin() {
    local container_name="winland-admin"
    local image_name="winland-admin"
    local full_image="${DOCKER_HUB_USERNAME}/${image_name}:${IMAGE_TAG}"
    
    stop_container "${container_name}"
    
    echo -e "${YELLOW}🚀 Starting admin container...${NC}"
    podman run -d \
        --name "${container_name}" \
        --pod winland-pod \
        --restart unless-stopped \
        "${full_image}" || {
        echo -e "${RED}❌ Failed to start admin container${NC}"
        exit 1
    }
    echo -e "${GREEN}✅ Admin container started${NC}"
}

# Function to run ctv-portal container
run_ctv_portal() {
    local container_name="winland-ctv-portal"
    local image_name="winland-ctv-portal"
    local full_image="${DOCKER_HUB_USERNAME}/${image_name}:${IMAGE_TAG}"
    
    stop_container "${container_name}"
    
    echo -e "${YELLOW}🚀 Starting CTV Portal container...${NC}"
    podman run -d \
        --name "${container_name}" \
        --pod winland-pod \
        -e DATABASE_URL="${DATABASE_URL}" \
        -e NEXTAUTH_SECRET="${NEXTAUTH_SECRET}" \
        -e NEXTAUTH_URL="${NEXTAUTH_URL}" \
        --restart unless-stopped \
        "${full_image}" || {
        echo -e "${RED}❌ Failed to start CTV Portal container${NC}"
        exit 1
    }
    echo -e "${GREEN}✅ CTV Portal container started${NC}"
}

# Main deployment flow
main() {
    check_podman
    
    # Pull images
    pull_image "winland-backend"
    pull_image "winland-admin"
    pull_image "winland-ctv-portal"
    
    # Create pod for networking
    create_pod
    
    # Run containers
    run_backend
    run_admin
    run_ctv_portal
    
    echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
    echo -e "${GREEN}📊 Container status:${NC}"
    podman ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

# Run main function
main

