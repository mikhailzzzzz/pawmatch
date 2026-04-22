from rest_framework import serializers
from django.contrib.auth.models import User
from django.db.models import Count
from .models import Animal, Shelter, Swipe, Match, Pet

class SwipeInputSerializer(serializers.Serializer):
    animal_id = serializers.IntegerField(min_value=1)
    is_like   = serializers.BooleanField()

    def validate_animal_id(self, value):
        if not Animal.objects.filter(id=value, is_adopted=False).exists():
            raise serializers.ValidationError('Животное не найдено.')
        return value

class RegisterInputSerializer(serializers.Serializer):
    username         = serializers.CharField(min_length=3, max_length=150)
    email            = serializers.EmailField()
    password         = serializers.CharField(min_length=6, write_only=True)
    confirm_password = serializers.CharField(min_length=6, write_only=True)

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Пароли не совпадают.'})
        return data

    def create_user(self):
        data = self.validated_data
        return User.objects.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
        )

class UserSerializer(serializers.ModelSerializer):
    is_staff = serializers.BooleanField(read_only=True)

    class Meta:
        model  = User
        fields = ['id', 'username', 'email', 'is_staff']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model  = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
        )


class ShelterSerializer(serializers.ModelSerializer):
    animal_count = serializers.SerializerMethodField()

    class Meta:
        model = Shelter
        fields = ['id', 'name', 'address', 'phone', 'latitude', 'longitude',
                  'telegram', 'instagram', 'website', 'animal_count']

    def get_animal_count(self, obj):
        return obj.animals.filter(is_adopted=False).count()


class AnimalSerializer(serializers.ModelSerializer):
    likes_count = serializers.SerializerMethodField()
    photo = serializers.SerializerMethodField()
    shelter_detail = ShelterSerializer(source='shelter', read_only=True)

    class Meta:
        model = Animal
        fields = [
            'id', 'shelter', 'shelter_detail', 'name', 'species', 'breed', 'age',
            'photo', 'is_vaccinated', 'is_neutered', 'is_adopted', 'likes_count',
        ]

    def get_likes_count(self, obj):
        return obj.likes_count()

    def get_photo(self, obj):
        request = self.context.get('request')
        if obj.photo and request:
            return request.build_absolute_uri(obj.photo.url)
        return obj.photo_url or ''


class AnimalCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Animal
        fields = ['shelter', 'name', 'species', 'breed', 'age',
                  'photo', 'photo_url', 'is_vaccinated', 'is_neutered']

    def create(self, validated_data):
        request = self.context.get('request')
        return Animal.objects.create(submitted_by=request.user, **validated_data)


class SwipeSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Swipe
        fields = ['id', 'animal', 'is_like', 'created_at']


class MatchSerializer(serializers.ModelSerializer):
    animal = AnimalSerializer(read_only=True)
    animal_id = serializers.PrimaryKeyRelatedField(
        queryset=Animal.objects.all(), source='animal', write_only=True
    )
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True, required=False
    )

    class Meta:
        model  = Match
        fields = ['id', 'animal', 'animal_id', 'user', 'user_id', 'created_at']


class PetSerializer(serializers.ModelSerializer):
    animal = AnimalSerializer(read_only=True)
    animal_id = serializers.PrimaryKeyRelatedField(
        queryset=Animal.objects.all(), source='animal', write_only=True
    )
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True, required=False
    )

    class Meta:
        model = Pet
        fields = ['id', 'animal', 'animal_id', 'user', 'user_id', 'name', 'birth_date', 'weight']


# ── Custom Serializers (Non-Model) ─────────────────────────────────────────────

class UserProfileSerializer(serializers.Serializer):
    """Combines user data with their activity statistics"""
    user_id = serializers.IntegerField()
    username = serializers.CharField()
    email = serializers.EmailField()
    is_staff = serializers.BooleanField()
    total_pets = serializers.SerializerMethodField()
    total_matches = serializers.SerializerMethodField()
    total_swipes = serializers.SerializerMethodField()
    favorite_species = serializers.SerializerMethodField()
    
    def get_total_pets(self, obj):
        """Get count of user's pets"""
        return Pet.objects.filter(user_id=obj['user_id']).count()
    
    def get_total_matches(self, obj):
        """Get count of user's matches"""
        return Match.objects.filter(user_id=obj['user_id']).count()
    
    def get_total_swipes(self, obj):
        """Get count of user's swipes"""
        return Swipe.objects.filter(user_id=obj['user_id']).count()
    
    def get_favorite_species(self, obj):
        """Get user's most liked animal species"""
        most_liked = Swipe.objects.filter(
            user_id=obj['user_id'], is_like=True
        ).values('animal__species').annotate(
            count=Count('id')
        ).order_by('-count').first()
        return most_liked['animal__species'] if most_liked else None


class SwipeStatsSerializer(serializers.Serializer):
    """Aggregates swipe statistics for a user"""
    user_id = serializers.IntegerField()
    total_swipes = serializers.IntegerField()
    likes_count = serializers.IntegerField()
    dislikes_count = serializers.IntegerField()
    match_rate = serializers.FloatField()
    last_swiped = serializers.DateTimeField(required=False, allow_null=True)
