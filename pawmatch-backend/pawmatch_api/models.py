from django.db import models
from django.contrib.auth.models import User


class AvailableAnimalManager(models.Manager):
    """Returns only animals that have not been adopted yet."""
    def get_queryset(self):
        return super().get_queryset().filter(is_adopted=False)


class Shelter(models.Model):
    name      = models.CharField(max_length=200)
    address   = models.TextField()
    phone     = models.CharField(max_length=20, blank=True)          # добавлено!
    latitude  = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    telegram  = models.CharField(max_length=100, blank=True)
    instagram = models.CharField(max_length=100, blank=True)
    website   = models.URLField(blank=True)

    def __str__(self):
        return self.name

class AnimalManager(models.Manager):
    def available(self):
        return self.filter(is_adopted=False)
    def dogs(self):
        return self.filter(species='dog', is_adopted=False)
    def cats(self):
        return self.filter(species='cat', is_adopted=False)
    
class Animal(models.Model):
    SPECIES_CHOICES = [('dog', 'Собака'), ('cat', 'Кошка'), ('other', 'Другое')]

    shelter      = models.ForeignKey(Shelter, on_delete=models.CASCADE, related_name='animals')
    submitted_by = models.ForeignKey(
        User, null=True, blank=True,
        on_delete=models.SET_NULL, related_name='submitted_animals'
    )
    name         = models.CharField(max_length=100)
    species      = models.CharField(max_length=20, choices=SPECIES_CHOICES, default='dog')
    breed        = models.CharField(max_length=100)
    age          = models.PositiveIntegerField(default=1)
    photo        = models.ImageField(upload_to='animals/', blank=True, null=True)
    photo_url    = models.URLField(blank=True)
    is_vaccinated = models.BooleanField(default=False)
    is_neutered   = models.BooleanField(default=False)
    is_adopted    = models.BooleanField(default=False)

    available = AvailableAnimalManager()  # only non-adopted animals
    objects = AnimalManager()
    def likes_count(self):
        return Swipe.objects.filter(animal=self, is_like=True).count()

    def __str__(self):
        return f'{self.name} ({self.species})'


class Swipe(models.Model):
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='swipes')
    animal     = models.ForeignKey(Animal, on_delete=models.CASCADE, related_name='swipes')
    is_like    = models.BooleanField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'animal')

    def __str__(self):
        action = '❤️' if self.is_like else '👎'
        return f'{self.user.username} {action} {self.animal.name}'


class Match(models.Model):
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='matches')
    animal     = models.ForeignKey(Animal, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'animal')

    def __str__(self):
        return f'Match: {self.user.username} ↔ {self.animal.name}'


class Pet(models.Model):
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pets')
    animal     = models.ForeignKey(Animal, on_delete=models.CASCADE, unique=True)
    name       = models.CharField(max_length=100)
    birth_date = models.DateField()
    weight     = models.FloatField()

    def __str__(self):
        return f'{self.name} (хозяин: {self.user.username})'
