from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    # ── Auth ──────────────────────────────────────────────────────────
    path('token/',         TokenObtainPairView.as_view(), name='token_obtain'),
    path('token/refresh/', TokenRefreshView.as_view(),    name='token_refresh'),
    path('register/',      views.register_view,           name='register'),
    path('logout/',        views.logout_view,             name='logout'),
    path('me/',            views.me_view,                 name='me'),

    # ── Shelters ──────────────────────────────────────────────────────
    path('shelters/',      views.ShelterListView.as_view(), name='shelters'),
    path('assistant/',     views.assistant_view,            name='assistant'),

    # ── Swipe & Matches ───────────────────────────────────────────────
    path('swipe-cards/',   views.swipe_cards,               name='swipe_cards'),
    path('swipe/',         views.swipe_view,                name='swipe'),
    path('matches/',       views.MatchListView.as_view(),   name='matches'),

    # ── Animals ───────────────────────────────────────────────────────
    path('animals/submit/', views.submit_animal,            name='animal_submit'),

    # ── Pets ──────────────────────────────────────────────────────────
    path('pets/',          views.PetListCreateView.as_view(),  name='pet_list'),
    path('pets/<int:pk>/', views.PetDetailView.as_view(),      name='pet_detail'),

    # ── Admin ─────────────────────────────────────────────────────────
    path('admin/users/',    views.AdminUserListView.as_view(),        name='admin_users'),
    path('admin/animals/',  views.AdminAnimalListView.as_view(),      name='admin_animals'),
    path('admin/pets/',     views.AdminPetCreateView.as_view(),       name='admin_pets'),
    path('admin/matches/',  views.AdminMatchListCreateView.as_view(), name='admin_matches'),

    # ── Statistics & Profile ──────────────────────────────────────────
    path('user/profile/',     views.user_profile_view,      name='user_profile'),
    path('user/swipe-stats/', views.user_swipe_stats_view,  name='user_stats'),
]