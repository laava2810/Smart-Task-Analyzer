from django.test import TestCase
from datetime import date, timedelta
from .scoring import compute_task_scores

class ScoringTests(TestCase):
    def setUp(self):
        today = date.today()
        self.tasks = [
            {
                "id": 1,
                "title": "Urgent bug",
                "due_date": today,
                "estimated_hours": 2,
                "importance": 9,
                "dependencies": [],
            },
            {
                "id": 2,
                "title": "Long-term task",
                "due_date": today + timedelta(days=30),
                "estimated_hours": 10,
                "importance": 5,
                "dependencies": [],
            },
        ]

    def test_urgent_task_has_higher_score(self):
        scored = compute_task_scores(self.tasks, strategy="smart_balance")
        self.assertGreater(scored[0]["score"], scored[1]["score"])

    def test_fastest_strategy_prefers_low_effort(self):
        scored = compute_task_scores(self.tasks, strategy="fastest")
        self.assertEqual(scored[0]["title"], "Urgent bug")

    def test_circular_dependency_penalized(self):
        cyclic_tasks = [
            {
                "id": 1,
                "title": "Task A",
                "due_date": date.today(),
                "estimated_hours": 2,
                "importance": 5,
                "dependencies": [2],
            },
            {
                "id": 2,
                "title": "Task B",
                "due_date": date.today(),
                "estimated_hours": 2,
                "importance": 5,
                "dependencies": [1],
            },
        ]
        scored = compute_task_scores(cyclic_tasks)
        for t in scored:
            self.assertIn("circular dependency", t["explanation"])
