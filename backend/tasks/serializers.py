from rest_framework import serializers

class TaskSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    title = serializers.CharField()
    due_date = serializers.DateField()
    estimated_hours = serializers.FloatField()
    importance = serializers.IntegerField(min_value=1, max_value=10)
    dependencies = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        default=list
    )

    def validate_estimated_hours(self, value):
        if value <= 0:
            raise serializers.ValidationError("Estimated hours must be > 0")
        return value
