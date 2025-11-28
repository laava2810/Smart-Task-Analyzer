
A mini application that scores and prioritizes tasks based on urgency, importance, effort, and dependencies.

# Setup Instructions

1. Clone the repo and open the project folder.
2. Create and activate a virtual environment:

   ```bash
   py -3 -m venv venv
   .\venv\Scripts\Activate.ps1

3. To install backend dependencies

    cd backend
    pip install -r requirements.txt
    python manage.py migrate
    python manage.py runserver

4. Open frontend/index.html in a browser

# Algorithm

1. Urgency - how close the due date is
           - Overdue tasks get the highest urgency boost.

2. Importance – user rating from 1–10
              - Higher importance directly increases the score and is weighted more heavily in the High Impact and Smart Balance strategies.

3. Effort (estimated_hours)
              -Small tasks (≤ 1–3 hours) receive a bonus (“quick wins”).
              -Very large tasks get a small penalty because they are harder to complete quickly.

4. Dependencies
        -Tasks that are depended on by many other tasks gain extra score, because they unblock more work.

# Design Decisions

1. Stateless API:
Tasks are not stored in the database. The frontend sends a list of tasks and receives scored tasks back. This keeps the example small and focused on algorithm design.

2. /suggest endpoint:
Instead of storing tasks to support suggestion, the frontend simply takes the top 3 tasks returned by /analyze and shows them as “Tasks to do today”. The /suggest endpoint is left simple but can be extended later if persistence is added.

3. Separate scoring.py module:
The scoring logic is isolated so it can be tested easily and changed without touching views or serializers.

4. django-cors-headers:
Used to allow the static HTML frontend to call the Django API during local development.

# Time Breakdown 

1. Algorithm design & implementation - 1.5 hours
2. API & serializer - 45 minutes
3. Frontend UI & API integration -1 hour
4. Tests & README - 30 minutes

# Bonus Features Implemented

1. Dependency Visualization**  
  Dependencies are displayed using badges (e.g., "Depends on: 1, 2"), making it easy to see which tasks unlock others.


2.. Eisenhower Matrix View (Urgent vs Important)**  
  After analyzing tasks, the user can open an Eisenhower Matrix view. Tasks are automatically placed into four quadrants:
  - Do Now (Urgent & Important)  
  - Plan (Not Urgent & Important)  
  - Delegate (Urgent & Not Important)  
  - Eliminate (Not Urgent & Not Important)

3.. Unit Tests for Scoring**  
  Basic unit tests validate that urgent tasks receive higher scores, low-effort tasks are preferred in the “Fastest Wins” strategy, and circular dependencies are detected and penalized.

 # Future Enhancement

1. Mobile App
   Convert UI into cross-platform PWA or Flutter app 

2. Voice Assistant Support
   Add tasks by voice 

3. Notifications and Smart Reminders
   Push alerts for upcoming deadlines
 

