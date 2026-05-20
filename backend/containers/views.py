import docker
from django.http import StreamingHttpResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import (
    ContainerSerializer, 
    ContainerCreateSerializer, 
    ImageSerializer, 
    ImageSearchSerializer,
    VolumeSerializer,
    VolumeCreateSerializer
)

class ContainerViewSet(viewsets.ViewSet):
    def get_client(self):
        try:
            return docker.from_env()
        except Exception:
            import platform
            if platform.system() == "Windows":
                # Try common Windows pipes
                for pipe in ['npipe:////./pipe/docker_engine', 'npipe:////./pipe/dockerDesktopLinuxEngine']:
                    try:
                        client = docker.DockerClient(base_url=pipe)
                        client.ping()
                        return client
                    except:
                        continue
            return docker.DockerClient(base_url='unix://var/run/docker.sock')

    def list(self, request):
        client = self.get_client()
        containers = client.containers.list(all=True)
        data = []
        for c in containers:
            data.append({
                'id': c.id,
                'name': c.name,
                'image': c.image.tags[0] if c.image.tags else c.image.id,
                'status': c.status,
                'short_id': c.short_id,
                'ports': c.ports,
                'created': c.attrs['Created']
            })
        serializer = ContainerSerializer(data, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = ContainerCreateSerializer(data=request.data)
        if serializer.is_valid():
            client = self.get_client()
            try:
                container = client.containers.run(
                    serializer.validated_data['image'],
                    name=serializer.validated_data.get('name'),
                    ports=serializer.validated_data.get('ports'),
                    volumes=serializer.validated_data.get('volumes'),
                    detach=True
                )
                return Response({'id': container.id}, status=status.HTTP_201_CREATED)
            except docker.errors.APIError as e:
                if e.response.status_code == 409:
                    return Response({'error': str(e)}, status=status.HTTP_409_CONFLICT)
                return Response({'error': str(e)}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        client = self.get_client()
        try:
            container = client.containers.get(pk)
            container.start()
            return Response({'status': 'started'})
        except docker.errors.NotFound:
            return Response(status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def stop(self, request, pk=None):
        client = self.get_client()
        try:
            container = client.containers.get(pk)
            container.stop()
            return Response({'status': 'stopped'})
        except docker.errors.NotFound:
            return Response(status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def restart(self, request, pk=None):
        client = self.get_client()
        try:
            container = client.containers.get(pk)
            container.restart()
            return Response({'status': 'restarted'})
        except docker.errors.NotFound:
            return Response(status=status.HTTP_404_NOT_FOUND)

    def destroy(self, request, pk=None):
        client = self.get_client()
        try:
            container = client.containers.get(pk)
            container.remove(force=True)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except docker.errors.NotFound:
            return Response(status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'])
    def logs(self, request, pk=None):
        client = self.get_client()
        try:
            container = client.containers.get(pk)
            tail = request.query_params.get('tail', '500')
            timestamps = request.query_params.get('timestamps', 'false') == 'true'
            try:
                tail_int = int(tail)
            except ValueError:
                tail_int = 500
            log_bytes = container.logs(
                stream=False,
                follow=False,
                timestamps=timestamps,
                tail=tail_int,
            )
            if isinstance(log_bytes, bytes):
                log_text = log_bytes.decode('utf-8', errors='replace')
            else:
                log_text = str(log_bytes)
            return Response({'logs': log_text, 'container_name': container.name})
        except docker.errors.NotFound:
            return Response(status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        client = self.get_client()
        try:
            container = client.containers.get(pk)
            return Response(container.stats(stream=False))
        except docker.errors.NotFound:
            return Response(status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def exec(self, request, pk=None):
        """Run a command inside a running container and return the output."""
        client = self.get_client()
        command = request.data.get('command', '').strip()
        if not command:
            return Response({'error': 'Command is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            container = client.containers.get(pk)
            if container.status != 'running':
                return Response({'error': 'Container is not running'}, status=status.HTTP_409_CONFLICT)
            exit_code, output = container.exec_run(
                cmd=['sh', '-c', command],
                stdout=True,
                stderr=True,
                stdin=False,
                tty=False,
                stream=False,
            )
            if isinstance(output, bytes):
                output = output.decode('utf-8', errors='replace')
            return Response({
                'exit_code': exit_code,
                'output': output or '',
                'command': command,
            })
        except docker.errors.NotFound:
            return Response({'error': 'Container not found'}, status=status.HTTP_404_NOT_FOUND)
        except docker.errors.APIError as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ImageViewSet(viewsets.ViewSet):
    def get_client(self):
        try:
            return docker.from_env()
        except Exception:
            import platform
            if platform.system() == "Windows":
                # Try common Windows pipes
                for pipe in ['npipe:////./pipe/docker_engine', 'npipe:////./pipe/dockerDesktopLinuxEngine']:
                    try:
                        client = docker.DockerClient(base_url=pipe)
                        client.ping()
                        return client
                    except:
                        continue
            return docker.DockerClient(base_url='unix://var/run/docker.sock')

    def list(self, request):
        client = self.get_client()
        images = client.images.list()
        data = []
        for img in images:
            data.append({
                'id': img.id,
                'tags': img.tags,
                'size': img.attrs['Size'],
                'created': img.attrs['Created']
            })
        serializer = ImageSerializer(data, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def search(self, request):
        term = request.query_params.get('q', '')
        if not term:
            return Response({'error': 'Search term required'}, status=status.HTTP_400_BAD_REQUEST)
        
        client = self.get_client()
        results = client.images.search(term)
        serializer = ImageSearchSerializer(results, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def pull(self, request):
        image_name = request.data.get('image')
        if not image_name:
            return Response({'error': 'Image name required'}, status=status.HTTP_400_BAD_REQUEST)
        
        client = self.get_client()
        try:
            image = client.images.pull(image_name)
            return Response({'status': f'Pulled {image_name}', 'id': image.id})
        except docker.errors.NotFound:
            return Response({'error': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        """Delete an image by its full ID (sha256:...)"""
        client = self.get_client()
        force = request.query_params.get('force', 'false').lower() == 'true'
        try:
            client.images.remove(image=pk, force=force)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except docker.errors.ImageNotFound:
            return Response({'error': 'Image not found'}, status=status.HTTP_404_NOT_FOUND)
        except docker.errors.APIError as e:
            # Common case: image is in use by a container
            return Response({'error': str(e)}, status=status.HTTP_409_CONFLICT)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class VolumeViewSet(viewsets.ViewSet):
    def get_client(self):
        try:
            return docker.from_env()
        except Exception:
            import platform
            if platform.system() == "Windows":
                for pipe in ['npipe:////./pipe/docker_engine', 'npipe:////./pipe/dockerDesktopLinuxEngine']:
                    try:
                        client = docker.DockerClient(base_url=pipe)
                        client.ping()
                        return client
                    except:
                        continue
            return docker.DockerClient(base_url='unix://var/run/docker.sock')

    def list(self, request):
        client = self.get_client()
        volumes = client.volumes.list()
        data = []
        for vol in volumes:
            data.append({
                'name': vol.name,
                'driver': vol.attrs.get('Driver', ''),
                'mountpoint': vol.attrs.get('Mountpoint', ''),
                'created_at': vol.attrs.get('CreatedAt', '')
            })
        serializer = VolumeSerializer(data, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = VolumeCreateSerializer(data=request.data)
        if serializer.is_valid():
            client = self.get_client()
            try:
                volume = client.volumes.create(name=serializer.validated_data['name'])
                return Response({'name': volume.name}, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

    def destroy(self, request, pk=None):
        client = self.get_client()
        try:
            volume = client.volumes.get(pk)
            volume.remove(force=True)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except docker.errors.NotFound:
            return Response(status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class SystemStatsView(APIView):
    def get_client(self):
        try:
            return docker.from_env()
        except Exception:
            import platform
            if platform.system() == "Windows":
                for pipe in ['npipe:////./pipe/docker_engine', 'npipe:////./pipe/dockerDesktopLinuxEngine']:
                    try:
                        client = docker.DockerClient(base_url=pipe)
                        client.ping()
                        return client
                    except:
                        continue
            return docker.DockerClient(base_url='unix://var/run/docker.sock')

    def calculate_cpu_percent(self, d):
        try:
            cpu_count = len(d["cpu_stats"]["cpu_usage"]["percpu_usage"])
        except KeyError:
            cpu_count = d["cpu_stats"].get("online_cpus", 1)
            
        cpu_percent = 0.0
        try:
            cpu_delta = float(d["cpu_stats"]["cpu_usage"]["total_usage"]) - \
                        float(d["precpu_stats"]["cpu_usage"]["total_usage"])
            system_delta = float(d["cpu_stats"]["system_cpu_usage"]) - \
                           float(d["precpu_stats"]["system_cpu_usage"])
            if system_delta > 0.0:
                cpu_percent = (cpu_delta / system_delta) * cpu_count * 100.0
        except KeyError:
            pass
        return cpu_percent

    def get(self, request):
        client = self.get_client()
        try:
            info = client.info()
            total_memory = info.get('MemTotal', 0)
            
            containers = client.containers.list() # only running
            volumes = client.volumes.list()
            networks = client.networks.list()
            
            used_memory = 0
            total_cpu_percent = 0.0
            net_rx = 0
            net_tx = 0
            blk_read = 0
            blk_write = 0
            per_container = []
            
            for c in containers:
                try:
                    raw = c.stats(stream=False)
                    # Memory
                    mem_usage = raw.get('memory_stats', {}).get('usage', 0)
                    used_memory += mem_usage
                    
                    # CPU
                    cpu = self.calculate_cpu_percent(raw)
                    total_cpu_percent += cpu
                    
                    # Network
                    net_stats = raw.get('networks', {})
                    c_rx, c_tx = 0, 0
                    for net in net_stats.values():
                        c_rx += net.get('rx_bytes', 0)
                        c_tx += net.get('tx_bytes', 0)
                    net_rx += c_rx
                    net_tx += c_tx
                        
                    # Block I/O
                    blkio_stats = raw.get('blkio_stats', {}).get('io_service_bytes_recursive') or []
                    c_blk_read, c_blk_write = 0, 0
                    for stat in blkio_stats:
                        op = stat.get('op', '').lower()
                        if op == 'read':
                            c_blk_read += stat.get('value', 0)
                        elif op == 'write':
                            c_blk_write += stat.get('value', 0)
                    blk_read += c_blk_read
                    blk_write += c_blk_write

                    per_container.append({
                        'name': c.name,
                        'short_id': c.short_id,
                        'memory': mem_usage,
                        'cpu': round(cpu, 2),
                        'net_rx': c_rx,
                        'net_tx': c_tx,
                        'blk_read': c_blk_read,
                        'blk_write': c_blk_write,
                    })
                except Exception:
                    pass
            
            return Response({
                'os': info.get('OperatingSystem', 'Unknown'),
                'kernel': info.get('KernelVersion', 'Unknown'),
                'server_version': info.get('ServerVersion', 'Unknown'),
                'ncpu': info.get('NCPU', 0),
                'total_volumes': len(volumes),
                'total_networks': len(networks),
                'active_containers': info.get('ContainersRunning', len(containers)),
                'total_containers': info.get('Containers', len(containers)),
                'total_images': info.get('Images', 0),
                'total_memory': total_memory,
                'used_memory': used_memory,
                'cpu_usage_percent': min(total_cpu_percent, 100.0),
                'network_rx': net_rx,
                'network_tx': net_tx,
                'block_read': blk_read,
                'block_write': blk_write,
                'per_container_stats': per_container,
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
