import time
import docker
from prometheus_client import start_http_server, Gauge

# Configuración
PORT = 8000
TARGET_SERVICES = ['flask1', 'flask2', 'api1', 'api2', 'postgres']

# Definición de Métricas
cpu_gauge = Gauge('container_cpu_usage_percent', 'CPU usage percent', ['name'])
mem_gauge = Gauge('container_memory_usage_bytes', 'Memory usage bytes', ['name'])
net_rx_gauge = Gauge('container_network_receive_bytes_total', 'Network receive bytes', ['name'])
net_tx_gauge = Gauge('container_network_transmit_bytes_total', 'Network transmit bytes', ['name'])

def get_service_name(container):
    """Extrae el nombre del servicio desde las etiquetas de Docker Compose o usa el nombre del contenedor."""
    labels = container.labels
    if 'com.docker.compose.service' in labels:
        return labels['com.docker.compose.service']
    # Fallback si no tiene etiqueta de compose (quitando la barra inicial)
    return container.name.strip('/')

def calculate_cpu_percent(stats):
    """Calcula el porcentaje de CPU basado en los stats de Docker."""
    try:
        cpu_delta = stats['cpu_stats']['cpu_usage']['total_usage'] - stats['precpu_stats']['cpu_usage']['total_usage']
        system_cpu_delta = stats['cpu_stats']['system_cpu_usage'] - stats['precpu_stats'].get('system_cpu_usage', 0)
        
        number_cpus = stats['cpu_stats'].get('online_cpus', 1)
        
        if system_cpu_delta > 0.0 and cpu_delta > 0.0:
            return (cpu_delta / system_cpu_delta) * number_cpus * 100.0
    except KeyError:
        return 0.0
    return 0.0

def collect_metrics(client):
    try:
        containers = client.containers.list()
        for container in containers:
            service_name = get_service_name(container)
            
            # Filtrar solo los contenedores importantes
            if service_name not in TARGET_SERVICES:
                continue

            try:
                stats = container.stats(stream=False)
                
                # Memoria
                mem_usage = stats['memory_stats'].get('usage', 0)
                mem_gauge.labels(name=service_name).set(mem_usage)
                
                # CPU
                cpu_percent = calculate_cpu_percent(stats)
                cpu_gauge.labels(name=service_name).set(cpu_percent)
                
                # Red (Sumamos las interfaces)
                networks = stats.get('networks', {})
                rx_bytes = sum(net['rx_bytes'] for net in networks.values())
                tx_bytes = sum(net['tx_bytes'] for net in networks.values())
                net_rx_gauge.labels(name=service_name).set(rx_bytes)
                net_tx_gauge.labels(name=service_name).set(tx_bytes)

            except Exception as e:
                pass
                
    except Exception as e:
        print(f"Error conectando a Docker: {e}")

if __name__ == '__main__':
    print(f"Iniciando Docker Exporter en el puerto {PORT}...")
    start_http_server(PORT)
    
    try:
        client = docker.from_env()
    except Exception as e:
        print(f"Fallo al inicializar cliente Docker: {e}")
        exit(1)

    print(f"Monitoreando servicios: {TARGET_SERVICES}")
    
    while True:
        collect_metrics(client)
        time.sleep(5)
