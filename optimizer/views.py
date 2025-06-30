import os
import json
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from .main import optimize_production
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView
from django.shortcuts import render

BASE_PATH = os.path.dirname(__file__)
DATA_PATH = os.path.join(BASE_PATH, "data", "data.json")
DEFAULT_PATH = os.path.join(BASE_PATH, "data", "default.json")


def load_data():
    with open(DATA_PATH, "r") as f:
        return json.load(f)
    

class FrontendAppView(TemplateView):
    template_name = 'index.html'


class OptimizeView(APIView):
    def post(self, request):
        try:
            settings = request.data.get('settings')
            print("Received settings:", settings)
            data = load_data()
            result = optimize_production(data, settings)
            return Response(result)
        except Exception as e:
            print("Optimization error:", str(e))
            return Response({'error': str(e)}, status=500)


def get_all_metadata(request):
    data = load_data()

    items = [
        {"id": k, "name": v.get("name", k)}
        for k, v in data.get("items", {}).items()
    ]

    resources = [
        {"id": k, "name": v.get("name", k)}
        for k, v in data.get("resources", {}).items()
    ]

    recipes = [
        {
            "id": k,
            "name": v.get("name", k),
            "display": v.get("display", v.get("name", k)),
            "ingredients": v.get("ingredients", []),
            "products": v.get("products", [])
        }
        for k, v in data.get("recipes", {}).items()
    ]

    return JsonResponse({
        "items": items,
        "resources": resources,
        "recipes": recipes
    })


def get_default_settings(request):
    with open(DEFAULT_PATH, "r") as f:
        default_data = json.load(f)
    return JsonResponse(default_data)


def index(request):
    return render(request, 'index.html')