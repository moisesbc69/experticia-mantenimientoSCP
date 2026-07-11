from django.urls import path

from . import views

urlpatterns = [
    path('plants/', views.plant_list, name='plant-list'),
    path('plants/<int:plant_id>/dashboard/', views.plant_dashboard, name='plant-dashboard'),
]
