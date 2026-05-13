from rest_framework import serializers

class ContainerSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    name = serializers.CharField()
    image = serializers.CharField()
    status = serializers.CharField()
    short_id = serializers.CharField()
    ports = serializers.DictField(required=False)
    created = serializers.CharField()

class ContainerCreateSerializer(serializers.Serializer):
    image = serializers.CharField(required=True)
    name = serializers.CharField(required=False)
    ports = serializers.DictField(required=False, help_text="Example: {'80/tcp': 8080}")
    volumes = serializers.DictField(required=False, help_text="Example: {'/home/user/data': {'bind': '/mnt/vol1', 'mode': 'rw'}}")
    command = serializers.CharField(required=False)

class ImageSerializer(serializers.Serializer):
    id = serializers.CharField()
    tags = serializers.ListField(child=serializers.CharField())
    size = serializers.IntegerField()
    created = serializers.CharField()

class ImageSearchSerializer(serializers.Serializer):
    name = serializers.CharField()
    description = serializers.CharField(allow_blank=True)
    is_official = serializers.BooleanField()
    star_count = serializers.IntegerField()
