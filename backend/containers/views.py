import docker
from django.http import StreamingHttpResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
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
            logs_data = container.logs(tail=500)
            from django.http import HttpResponse
            return HttpResponse(logs_data, content_type='text/plain')
        except docker.errors.NotFound:
            return Response(status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        client = self.get_client()
        try:
            container = client.containers.get(pk)
            return Response(container.stats(stream=False))
        except docker.errors.NotFound:
            return Response(status=status.HTTP_404_NOT_FOUND)

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
