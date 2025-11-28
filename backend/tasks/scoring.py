from datetime import date

def compute_urgency_score(due_date: date) -> float:
    today = date.today()
    delta_days = (due_date - today).days

    if delta_days < 0:
        return 25.0
    if delta_days == 0:
        return 20.0
    if delta_days <= 2:
        return 15.0
    if delta_days <= 7:
        return 10.0
    if delta_days <= 14:
        return 5.0
    return 0.0


def compute_effort_score(estimated_hours: float) -> float:
    if estimated_hours <= 1:
        return 8.0
    if estimated_hours <= 3:
        return 5.0
    if estimated_hours <= 6:
        return 2.0
    return -2.0


def build_dependency_graph(tasks):
    depends_on_count = {task["id"]: 0 for task in tasks if "id" in task}
    for task in tasks:
        for dep_id in task.get("dependencies", []):
            if dep_id in depends_on_count:
                depends_on_count[dep_id] += 1
    return depends_on_count


def detect_cycles(tasks):
    id_to_deps = {t["id"]: t.get("dependencies", []) for t in tasks if "id" in t}
    visited = {}
    in_cycle = set()

    def dfs(node):
        if node not in id_to_deps:
            return False
        state = visited.get(node, 0)  
        if state == 1:
            in_cycle.add(node)
            return True
        if state == 2:
            return False
        visited[node] = 1
        for nei in id_to_deps[node]:
            if dfs(nei):
                in_cycle.add(node)
        visited[node] = 2
        return False

    for nid in id_to_deps:
        dfs(nid)
    return in_cycle


def compute_task_scores(tasks, strategy="smart_balance"):
    dep_weight_map = build_dependency_graph(tasks)
    cyclic_ids = detect_cycles(tasks)

    scored = []
    for task in tasks:
        importance = task["importance"]
        eh = task["estimated_hours"]
        due = task["due_date"]
        tid = task.get("id")

        urgency = compute_urgency_score(due)
        effort = compute_effort_score(eh)
        dependency_weight = dep_weight_map.get(tid, 0) * 3.0 if tid is not None else 0.0
        cycle_penalty = -10.0 if tid in cyclic_ids else 0.0

        if strategy == "fastest":
            score = effort * 2 + urgency * 0.5 + importance * 0.5
        elif strategy == "high_impact":
            score = importance * 3 + urgency + effort
        elif strategy == "deadline":
            score = urgency * 3 + importance + effort * 0.2
        else:  
            score = (
                importance * 2.0
                + urgency * 1.5
                + effort * 1.0
                + dependency_weight
                + cycle_penalty
            )

        explanation_parts = [
            f"Importance {importance}",
            f"Estimated {eh}h",
        ]

        if dependency_weight > 0:
            explanation_parts.append("Blocks other tasks")
        if tid in cyclic_ids:
            explanation_parts.append(f"Blocks {dep_weight_map.get(tid, 0)} other tasks")


        task_with_meta = {
            **task,
            "score": round(score, 2),
            "explanation": "; ".join(explanation_parts),
        }
        scored.append(task_with_meta)

    scored.sort(key=lambda t: t["score"], reverse=True)
    return scored
