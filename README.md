# 🛠️ Satisfactory LP Solver

**Satisfactory LP Solver** is a full-stack web application for optimizing production chains in the game *Satisfactory*, using linear programming (LP). The app allows users to configure item inputs and outputs and tune objective weights with resource and building constraints.

> Created by [u/wrigh516](https://www.reddit.com/user/wrigh516)

---

## 🚀 Features

- 🔄 Interactive React frontend with real-time configuration
- 🧠 Django backend with LP-based optimization logic
- ✅ Dynamic recipe toggles and nuclear waste handling
- ⚙️ Weighted controls for power, items, buildings, and rare resources
- 📊 Print overall optimization results, resources needed, and recipes used

---

## 🧰 Tech Stack

| Layer     | Technology                    |
|-----------|-------------------------------|
| Frontend  | React, Tailwind CSS           |
| Backend   | Django, Django REST Framework |
| Optimizer | Python + Pyomo using 'glpk' solver |
| Hosting   | Azure-ready or standalone     |

---

## 🖥️ Running Locally

### 🔧 Backend Setup

```bash
cd backend
python -m venv env
env\Scripts\activate      # On Windows
# OR
source env/bin/activate   # On macOS/Linux

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 🌐 Frontend Setup

```bash
cd frontend
npm install
npm start
```

Open your browser to:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`

---

## 📦 Production Deployment

To host the app on a server like Azure:

1. Run `npm run build` inside the `frontend/` folder.
2. Place the resulting `build/` folder contents in your Django `static/` or `templates/` directory.
3. Run:

```bash
python manage.py collectstatic
```

4. Update your Django view to serve `index.html`:

```python
from django.shortcuts import render

def index(request):
    return render(request, 'index.html')
```

5. Optionally configure a reverse proxy (e.g. Nginx) for production performance.

---

## 📝 To Do

- [x] Move project to new repo
- [x] Build backend with Django
- [x] Build frontend with React
- [x] Serve React app with Django
- [ ] Deploy with custom domain (e.g., satisfactory-solver.com)
- [ ] Add user login for saved configs
- [ ] Enable settings export/save

---

## 🤝 Contributions

Pull requests are welcome! If you find a bug or want to contribute improvements, please fork the repo and submit a PR.

---