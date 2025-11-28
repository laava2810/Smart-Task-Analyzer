
window.addEventListener("load", () => {
  const jsonBox = document.getElementById("json-input");
  if (jsonBox) jsonBox.value = "";
});

let tasks = [];
let nextId = 1;
let lastScoredTasks = [];


const form = document.getElementById("task-form");
const jsonInput = document.getElementById("json-input");
const analyzeBtn = document.getElementById("analyze-btn");
const resultsDiv = document.getElementById("results");
const errorP = document.getElementById("error");
const strategySelect = document.getElementById("strategy");
const matrixBtn = document.getElementById("matrix-btn");


form.addEventListener("submit", (e) => {
  e.preventDefault();
  errorP.textContent = "";

  const title = document.getElementById("task_title").value.trim();
  const due_date = document.getElementById("due_date").value;
  const estimated_hours = parseFloat(
    document.getElementById("estimated_hours").value
  );
  const importance = parseInt(
    document.getElementById("importance").value,
    10
  );
  const depsRaw = document.getElementById("dependencies").value.trim();

  if (!title || !due_date || isNaN(estimated_hours) || isNaN(importance)) {
    errorP.textContent = "Please fill all required fields.";
    return;
  }

  const dependencies = depsRaw
    ? depsRaw
        .split(",")
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n))
    : [];

  const task = {
    id: nextId++,
    title,
    due_date,
    estimated_hours,
    importance,
    dependencies,
  };

  tasks.push(task);
  form.reset();
  renderLocalTasks();
});


function renderLocalTasks() {
  resultsDiv.innerHTML = "<h3>Current Tasks (not yet analyzed)</h3>";
  tasks.forEach((t) => {
    const div = document.createElement("div");
    div.className = "task-card";
    div.textContent = `${t.id}. ${t.title} (due: ${t.due_date}, imp: ${t.importance}, hrs: ${t.estimated_hours})`;
    resultsDiv.appendChild(div);
  });
}


analyzeBtn.addEventListener("click", async () => {
  errorP.textContent = "";

  
  if (jsonInput.value.trim()) {
    try {
      const parsed = JSON.parse(jsonInput.value);
      tasks = parsed.map((t, idx) => ({
        id: t.id ?? idx + 1,
        ...t,
      }));
    } catch (err) {
      console.error(err);
      errorP.textContent = "Invalid JSON format. Please check and try again.";
      return;
    }
  }

  if (!tasks.length) {
    errorP.textContent = "Add at least one task before analyzing.";
    return;
  }

  const payload = {
    tasks,
    strategy: strategySelect.value,
  };

  try {
    const res = await fetch("http://127.0.0.1:8000/api/tasks/analyze/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let message = "Unknown error";
      try {
        const errData = await res.json();
        message = JSON.stringify(errData);
      } catch (_) {}
      throw new Error(message);
    }

    const data = await res.json();
    lastScoredTasks = data.tasks || [];
    renderResults(lastScoredTasks);
  } catch (err) {
    console.error(err);
    errorP.textContent = "API error: " + err.message;
  }
});


function renderResults(scoredTasks) {
  resultsDiv.innerHTML = "<h3>Analyzed Tasks</h3>";

  if (!scoredTasks || !scoredTasks.length) {
    const p = document.createElement("p");
    p.textContent = "No tasks returned from API.";
    resultsDiv.appendChild(p);
    return;
  }

  
  const top3 = scoredTasks.slice(0, 3);
  const topTitle = document.createElement("p");
  topTitle.innerHTML = `<strong>Top 3 to work on today:</strong> ${top3
    .map((t) => t.title)
    .join(", ")}`;
  resultsDiv.appendChild(topTitle);

  
  scoredTasks.forEach((t) => {
    const div = document.createElement("div");

    
    const priorityClass =
      t.score >= 30 ? "task-high" : t.score >= 15 ? "task-medium" : "task-low";

    div.className = `task-card ${priorityClass}`;

    
    let deps = t.dependencies ?? [];
    if (!Array.isArray(deps)) {
      deps = [deps];
    }
    const hasDeps = deps.length > 0;

    const depBadge = hasDeps
      ? `<span class="badge badge-dep">Depends on: ${deps.join(
          ", "
        )}</span><br/>`
      : "";

    
    const hasCycle =
      t.explanation && t.explanation.toLowerCase().includes("circular");
    const cycleBadge = hasCycle
      ? `<span class="badge badge-cycle">⚠ Cycle detected</span><br/>`
      : "";

    div.innerHTML = `
      <strong>${t.title}</strong> (Score: ${t.score})<br/>
      Due: ${t.due_date}, Importance: ${t.importance}, Estimated: ${
      t.estimated_hours
    }h<br/>
      ${depBadge}
      ${cycleBadge}
      <em>${t.explanation || ""}</em>
    `;

    resultsDiv.appendChild(div);
  });
}


function renderMatrix(tasksForMatrix) {
  const container = document.getElementById("matrix-view");
  if (!container) return;

  if (!tasksForMatrix || !tasksForMatrix.length) {
    errorP.textContent = "Analyze tasks first, then open the matrix.";
    return;
  }

  container.style.display = "grid";

  const q1List = document.getElementById("q1-list");
  const q2List = document.getElementById("q2-list");
  const q3List = document.getElementById("q3-list");
  const q4List = document.getElementById("q4-list");

  
  [q1List, q2List, q3List, q4List].forEach((ul) => {
    if (ul) ul.innerHTML = "";
  });

  tasksForMatrix.forEach((t) => {
    const li = document.createElement("li");
    li.textContent = t.title;

    const explanation = (t.explanation || "").toLowerCase();
    const isUrgent = explanation.includes("urgent"); 
    const isImportant = t.importance >= 7; 

    if (isUrgent && isImportant) {
      q1List.appendChild(li); 
    } else if (!isUrgent && isImportant) {
      q2List.appendChild(li); 
    } else if (isUrgent && !isImportant) {
      q3List.appendChild(li); 
    } else {
      q4List.appendChild(li); 
    }
  });
}


if (matrixBtn) {
  matrixBtn.addEventListener("click", () => {
    renderMatrix(lastScoredTasks);
  });
}
