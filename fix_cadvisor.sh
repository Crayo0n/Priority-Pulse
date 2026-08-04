sed -i '/cadvisor_private/a\    privileged: true\n    pid: "host"' docker-compose.yml
sed -i '/- \/dev\/disk\/:\/dev\/disk:ro/a\      - \/sys\/fs\/cgroup:\/sys\/fs\/cgroup:ro' docker-compose.yml
docker compose up -d cadvisor
