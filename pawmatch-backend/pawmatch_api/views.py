from django.contrib.auth.models import User
from rest_framework import generics, status, permissions
from rest_framework.decorators import APIView, api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Animal, Shelter, Swipe, Match, Pet
from .serializers import (
    RegisterSerializer, UserSerializer,
    AnimalSerializer, AnimalCreateSerializer, ShelterSerializer,
    SwipeSerializer, MatchSerializer,
    PetSerializer, UserProfileSerializer, SwipeStatsSerializer,
)


# ── Auth ──────────────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()

    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def me_view(request):
    return Response(UserSerializer(request.user).data)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def logout_view(request):
    """Stateless JWT logout — client must discard tokens."""
    return Response({'detail': 'Successfully logged out.'}, status=status.HTTP_200_OK)


# ── Shelters ──────────────────────────────────────────────────────────────────

class ShelterListView(generics.ListAPIView):
    serializer_class = ShelterSerializer
    queryset = Shelter.objects.all()


# ── Assistant ─────────────────────────────────────────────────────────────────

@api_view(['POST'])
def assistant_view(request):
    message = (request.data.get('message') or '').strip()
    lang = (request.data.get('lang') or 'en').strip().lower()
    normalized = message.lower()
    is_ru = lang == 'ru'

    if not message:
        return Response({
            'reply': 'Напишите вопрос о платформе, приютах, матчах или профиле — и я подскажу.' if is_ru
                     else 'Ask a question about the platform, shelters, matches, or profile — I will help.',
            'suggestions': [
                ['Как работает мэтчинг?', 'Как связаться с приютом?', 'Что есть в профиле?'] if is_ru
                else ['How does matching work?', 'How to contact a shelter?', "What's in the profile?"]
            ][0]
        })

    shelters = list(Shelter.objects.all())
    shelter_names = [shelter.name for shelter in shelters]

    if any(word in normalized for word in ['матч', 'мэтч', 'matching', 'match', 'свайп', 'swipe', 'лайк', 'like']):
        reply = (
            'Мэтч создаётся автоматически при каждом лайке. Поставь лайк животному — '
            'и оно сразу появится в разделе «Матчи».'
        ) if is_ru else (
            'A match is created automatically with every like. Just swipe right on an animal '
            'and it will instantly appear in your Matches section.'
        )
    elif any(word in normalized for word in ['приют', 'shelter', 'телефон', 'phone', 'позвон', 'contact', 'связаться']):
        shelters_text = '; '.join(
            f'{s.name}: {s.phone or ("телефон не указан" if is_ru else "no phone")}'
            for s in shelters[:4]
        ) or ('Список приютов пока пуст.' if is_ru else 'No shelters available yet.')
        reply = (
            f'На странице «Приюты» можно открыть карточку приюта, посмотреть адрес, контакты и карту. '
            f'Сейчас доступны: {shelters_text}.'
        ) if is_ru else (
            f'On the Shelters page you can open a shelter card to see the address, contacts, and map. '
            f'Currently available: {shelters_text}.'
        )
    elif any(word in normalized for word in ['профиль', 'аккаунт', 'кабинет', 'profile', 'account']):
        reply = (
            'В профиле можно посмотреть свои данные, статистику свайпов, быстрые ссылки и '
            'задать вопрос AI-помощнику. Для администратора доступен блок управления.'
        ) if is_ru else (
            'In your profile you can view your account info, swipe statistics, quick links, '
            'and chat with the AI assistant. Admins also have a management panel there.'
        )
    elif any(word in normalized for word in ['питом', 'pet', 'животн', 'animal', 'добавить', 'add']):
        reply = (
            'Питомцы — животные, закреплённые за пользователем. Администратор может назначать '
            'питомцев другим пользователям через блок в профиле.'
        ) if is_ru else (
            'Pets are animals linked to a user. Admins can assign pets to other users '
            'via the admin panel in the profile page.'
        )
    elif any(word in normalized for word in ['платформ', 'сайт', 'pawmatch', 'platform', 'site']):
        reply = (
            'PawMatch помогает находить животных из приютов, свайпать анкеты, получать мэтчи '
            'и связываться с приютами.'
        ) if is_ru else (
            'PawMatch helps you find animals from shelters, swipe through profiles, get matches, '
            'and contact shelters directly.'
        )
    else:
        matching_shelter = next(
            (name for name in shelter_names if name.lower() in normalized),
            None
        )
        if matching_shelter:
            shelter = next(item for item in shelters if item.name == matching_shelter)
            reply = (
                f'По приюту {shelter.name}: адрес — {shelter.address}. '
                f'Телефон — {shelter.phone or "не указан"}.'
            ) if is_ru else (
                f'About {shelter.name}: address — {shelter.address}. '
                f'Phone — {shelter.phone or "not listed"}.'
            )
        else:
            reply = (
                'Я могу подсказать по платформе PawMatch, приютам, мэтчам, профилю и питомцам. '
                'Например: «Как работает мэтчинг?» или «Как связаться с приютом?».'
            ) if is_ru else (
                'I can help with PawMatch topics: shelters, matches, profile, and pets. '
                'Try asking: "How does matching work?" or "How to contact a shelter?".'
            )

    return Response({
        'reply': reply,
        'suggestions': [
            'Как работает мэтчинг?',
            'Как связаться с приютом?',
            'Что можно делать в профиле?',
        ] if is_ru else [
            'How does matching work?',
            'How to contact a shelter?',
            "What can I do in the profile?",
        ]
    })


# ── Swipe ─────────────────────────────────────────────────────────────────────

@api_view(['GET'])
def swipe_cards(request):
    already_swiped = Swipe.objects.filter(user=request.user).values_list('animal_id', flat=True)
    species = request.query_params.get('species')
    if species == 'dog':
        animals = Animal.objects.dogs().exclude(id__in=already_swiped)
    elif species == 'cat':
        animals = Animal.objects.cats().exclude(id__in=already_swiped)
    else:
        animals = Animal.objects.available().exclude(id__in=already_swiped)
    return Response(AnimalSerializer(animals, many=True, context={'request': request}).data)


@api_view(['POST'])
def swipe_view(request):
    animal_id = request.data.get('animal_id')
    is_like = request.data.get('is_like', False)

    try:
        animal = Animal.objects.get(id=animal_id)
    except Animal.DoesNotExist:
        return Response({'error': 'Животное не найдено'}, status=404)

    swipe, created = Swipe.objects.get_or_create(
        user=request.user,
        animal=animal,
        defaults={'is_like': is_like}
    )
    if not created:
        swipe.is_like = is_like
        swipe.save()

    if is_like:
        if animal.is_adopted:
            return Response({'error': 'This animal has already been adopted'}, status=400)
        match, _ = Match.objects.get_or_create(user=request.user, animal=animal)
        match_data = MatchSerializer(match, context={'request': request}).data
        return Response({'status': 'matched', 'match': match_data})

    if not is_like:
        Match.objects.filter(user=request.user, animal=animal).delete()

    return Response({'status': 'swiped'})


# ── Matches ───────────────────────────────────────────────────────────────────

class MatchListView(APIView):
    def get(self, request):
        matches = Match.objects.filter(user=request.user).select_related('animal', 'animal__shelter')
        return Response(MatchSerializer(matches, many=True, context={'request': request}).data)


# ── Submit animal ─────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def submit_animal(request):
    serializer = AnimalCreateSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    animal = serializer.save()
    return Response(
        AnimalSerializer(animal, context={'request': request}).data,
        status=status.HTTP_201_CREATED
    )


# ── Pets ──────────────────────────────────────────────────────────────────────

class PetListCreateView(APIView):
    def get(self, request):
        pets = Pet.objects.filter(user=request.user).select_related('animal', 'animal__shelter')
        return Response(PetSerializer(pets, many=True, context={'request': request}).data)

    def post(self, request):
        serializer = PetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=201)


class PetDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PetSerializer

    def get_queryset(self):
        return Pet.objects.filter(user=self.request.user)

    def perform_destroy(self, instance):
        animal = instance.animal
        instance.delete()
        animal.is_adopted = False
        animal.save()


# ── Admin Pets ────────────────────────────────────────────────────────────────

class AdminUserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = User.objects.all().order_by('username')


class AdminAnimalListView(generics.ListAPIView):
    serializer_class = AnimalSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Animal.objects.all().select_related('shelter').order_by('name')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class AdminPetCreateView(generics.ListCreateAPIView):
    serializer_class = PetSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Pet.objects.all().select_related('user', 'animal', 'animal__shelter').order_by('-id')

    def perform_create(self, serializer):
        pet = serializer.save()
        animal = pet.animal
        if not animal.is_adopted:
            animal.is_adopted = True
            animal.save()


class AdminMatchListCreateView(generics.ListCreateAPIView):
    serializer_class = MatchSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Match.objects.all().select_related('user', 'animal', 'animal__shelter').order_by('-created_at')

    def perform_create(self, serializer):
        animal = serializer.validated_data.get('animal')
        if animal and animal.is_adopted:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'animal': 'This animal has already been adopted'})
        serializer.save()


# ── Statistics & Profile ──────────────────────────────────────────────────────

@api_view(['GET'])
def user_profile_view(request):
    """Get comprehensive user profile with statistics"""
    user_data = {
        'user_id': request.user.id,
        'username': request.user.username,
        'email': request.user.email,
        'is_staff': request.user.is_staff,
    }
    serializer = UserProfileSerializer(user_data)
    return Response(serializer.data)


@api_view(['GET'])
def user_swipe_stats_view(request):
    """Get swipe statistics for authenticated user"""
    total_swipes = Swipe.objects.filter(user=request.user).count()
    likes = Swipe.objects.filter(user=request.user, is_like=True).count()
    dislikes = total_swipes - likes
    match_rate = (likes / total_swipes * 100) if total_swipes > 0 else 0.0
    
    last_swipe = Swipe.objects.filter(user=request.user).order_by('-created_at').first()
    
    stats_data = {
        'user_id': request.user.id,
        'total_swipes': total_swipes,
        'likes_count': likes,
        'dislikes_count': dislikes,
        'match_rate': round(match_rate, 2),
        'last_swiped': last_swipe.created_at if last_swipe else None,
    }
    serializer = SwipeStatsSerializer(stats_data)
    return Response(serializer.data)
