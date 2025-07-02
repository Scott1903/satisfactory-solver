# Satisfactory LP Solver

**Satisfactory LP Solver** is a full-stack web application for optimizing production chains in the game *[Satisfactory](https://www.satisfactorygame.com/)*, using linear programming (LP). The app allows users to configure item inputs and outputs and tune objective weights with resource and building constraints.

> Created by [u/wrigh516](https://www.reddit.com/user/wrigh516/submitted/)

---

## Features

- Interactive React frontend with real-time configuration
- Django backend with LP-based optimization logic
- Dynamic recipe toggles and nuclear waste handling
- Weighted controls for power, items, buildings, and rare resources
- Print overall optimization results, resources needed, and recipes used

---

## Tech Stack

| Layer     | Technology                         |
|-----------|------------------------------------|
| Frontend  | React, Tailwind CSS                |
| Backend   | Django, Django REST Framework      |
| Optimizer | Python + Pyomo using 'glpk' solver |
| Hosting   | Local or Windows VM with Py 3.13   |

---

## Running Locally

```bash
env\Scripts\activate      # On Windows
# OR
source env/bin/activate   # On macOS/Linux

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

- API: `http://localhost:8000`

---

## Pre-Deployment

1. Run `npm run build` inside the `frontend/` folder.
2. Place the resulting `build/` js and css folders and contents into your Django `static/` directory.
3. Place the resulting `build/` index.html file into your `templates/` directory.
4. Note: glpk glpsol.exe requires a Windows machine or VM without Docker.

---

## To Do

- [x] Move project to new repo
- [x] Build backend with Django
- [x] Build frontend with React
- [x] Serve React app with Django
- [ ] Deploy with custom domain (e.g., satisfactory-solver.com)
- [ ] Add user login for saved configs
- [ ] Enable settings export/save

---

## License Notice for GLPK

This project includes the [GNU Linear Programming Kit (GLPK)](https://www.gnu.org/software/glpk/), version 4.65, distributed under the [GNU General Public License v3.0 (GPLv3)](https://www.gnu.org/licenses/gpl-3.0.en.html).

- The `glpk-4.65/w64/glpsol.exe` binary is bundled for convenience when running the optimizer on Windows-based environments.
- The original source code for GLPK is available at: https://ftp.gnu.org/gnu/glpk/

If you distribute or modify this project, please ensure compliance with the terms of the GPLv3 as it applies to GLPK.

---

---

## Contributions

Pull requests are welcome! If you find a bug or want to contribute improvements, please fork the repo and submit a PR.

---