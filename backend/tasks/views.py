from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import TaskSerializer
from .scoring import compute_task_scores


@api_view(["POST"])
def analyze_tasks(request):
    data = request.data
    tasks_data = data.get("tasks", [])
    strategy = data.get("strategy", "smart_balance")

    serializer = TaskSerializer(data=tasks_data, many=True)
    if not serializer.is_valid():
        return Response(
            {"errors": serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

    validated_tasks = serializer.validated_data
    scored = compute_task_scores(validated_tasks, strategy=strategy)
    return Response({"tasks": scored})


@api_view(["GET"])
def suggest_tasks(request):
    return Response(
        {
            "detail": "Use POST /api/tasks/analyze/ and take top 3 tasks on the frontend."
        },
        status=status.HTTP_200_OK,
    )
