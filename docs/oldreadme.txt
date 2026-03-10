Satisfactory Solver – Web App
=============================

Overview
--------
Satisfactory Solver is a Django + Pyomo web application that optimizes factory layouts for the game *Satisfactory*.
It allows players to define resource limits, recipe availability, item inputs/outputs, and weighting factors, 
then automatically computes the optimal production plan using linear optimization.

The web interface is built in vanilla HTML, CSS, and JavaScript (see index.html) and communicates with 
the backend API endpoints for metadata, optimization, and user-saved presets.

Main Features
-------------
• Dynamic browser UI with multiple tabs:
  - Resources: configure resource availability limits
  - Weights: set optimization weight factors
  - Inputs/Outputs: define items and desired outputs
  - Recipes: toggle alternate recipes on/off
  - Results: display optimization results and statistics

• Pyomo-based backend optimizer using the HiGHS solver

• User authentication and saved presets
  - Users can create accounts, log in/out, and save/load/delete named optimization settings

• JSON-based data model for items, recipes, and resources

• Integrated Django Admin for managing Default and Saved settings


Project Structure
-----------------
ui/index.html             → Main single-page interface
ui/views.py               → Django views and API endpoints
ui/models.py              → DefaultSettings and SavedSettings models
ui/admin.py               → Django admin configuration
ui/urls.py                → URL routes
optimizer/main.py         → Entry point for optimization calls
optimizer/model.py        → Pyomo model creation and constraints
requirements.txt          → Python dependencies

Data files:
ui/data/data.json         → Core Satisfactory item and recipe data


Running Locally
---------------
1. Install dependencies:
       pip install -r requirements.txt

2. Apply migrations:
       python manage.py migrate

3. (Optional) Create a superuser:
       python manage.py createsuperuser

4. Run the development server:
       python manage.py runserver

5. Open your browser at:
       http://127.0.0.1:8000/


Optimization Details
--------------------
The optimizer uses Pyomo and the HiGHS solver to minimize a weighted cost function consisting of:
• Power Use
• Item Use
• Building Use
• Resource Use
• Buildings Scaled
• Resources Scaled
• Nuclear Waste penalty

Users can adjust these weights in the web interface to favor resource efficiency, minimal machine count, or other strategies.

If a resource limit is smaller than 0.0001, it is automatically floored to 0.0001 to avoid numerical instability.


Authentication & Presets
------------------------
• Anonymous users can still run optimizations using the default configuration.
• Authenticated users can:
  - Save named settings
  - Load saved configurations
  - Delete unwanted presets
• Login, logout, and signup views follow Django’s standard auth flow.


License & Credits
-----------------
Created by /u/wrigh516 for Satisfactory enthusiasts.

Not affiliated with Coffee Stain Studios or the official game.

Source: https://github.com/Scott1903/satisfactory-solver
Website: https://satisfactory-solver.com


Support
-------
For troubleshooting or contributions:
  - Open an issue or pull request on GitHub.
  - Ensure that `data.json` and solver dependencies are up-to-date.