import docker
from django.http import StreamingHttpResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .serializers import (
    ContainerSerializer, 
    ContainerCreateSerializer, 
    ImageSerializer, 
    ImageSearchSerializer
)

class ContainerViewSet(viewsets.ViewSet):
    def get_client(self):
        try:
            return docker.from_env()
        except Exception as e:
            # Fallback for Windows if needed, but spec says unix socket
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
            def stream_logs():
                for line in container.logs(stream=True, follow=True):
                    yield line
            return StreamingHttpResponse(stream_logs(), content_type='text/plain')
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
        except:
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
