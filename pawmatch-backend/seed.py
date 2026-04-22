"""
Скрипт для заполнения базы тестовыми данными.
Запуск: python seed.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pawmatch_backend.settings')
django.setup()

from django.contrib.auth.models import User
from pawmatch_api.models import Shelter, Animal

print("🧹 Очистка базы данных (Animals, Shelters)...")
Animal.objects.all().delete()
Shelter.objects.all().delete()

# ========== 1. ПОЛЬЗОВАТЕЛИ ==========
print("👥 Настройка пользователей...")
users_data = [
    {
        'username': 'imeke',
        'email': 'imekeshovamalika@gmail.com',
        'password': '212223',
        'is_superuser': True
    },
    {
        'username': 'malika',
        'email': 'malika@example.com',
        'password': 'test1234',
        'is_superuser': False
    },
    {
        'username': 'almaty_user',
        'email': 'user@pawmatch.kz',
        'password': 'user123',
        'is_superuser': False
    },
]

for user_data in users_data:
    User.objects.filter(username=user_data['username']).delete()
    if user_data['is_superuser']:
        User.objects.create_superuser(
            username=user_data['username'],
            email=user_data['email'],
            password=user_data['password']
        )
        print(f"✅ Суперпользователь: {user_data['username']} / {user_data['password']}")
    else:
        User.objects.create_user(
            username=user_data['username'],
            email=user_data['email'],
            password=user_data['password']
        )
        print(f"✅ Пользователь: {user_data['username']} / {user_data['password']}")

# ========== 2. ПРИЮТЫ ==========
print("🏠 Создание приютов...")
shelters_data = [
    dict(name='Happy Paws Almaty', address='г. Алматы, ул. Толе би, 78', phone='+7 700 123 45 67', latitude=43.238949, longitude=76.889709,
         instagram='https://instagram.com/happypaws_almaty', telegram='https://t.me/happypaws_almaty'),
    dict(name='Dog Shelter Astana', address='г. Астана, пр. Туран, 15', phone='+7 700 765 43 21', latitude=51.128207, longitude=71.430420,
         instagram='https://instagram.com/dogshelter_astana', telegram='https://t.me/dogshelter_astana'),
    dict(name='Cat Home Shymkent', address='г. Шымкент, ул. Байтурсынова, 22', phone='+7 700 111 22 33', latitude=42.341700, longitude=69.590100,
         instagram='https://instagram.com/cathome_shymkent', telegram='https://t.me/cathome_shymkent')
]

for data in shelters_data:
    Shelter.objects.create(**data)
    print(f'✅ Приют: {data["name"]}')

# ========== 3. ЖИВОТНЫЕ ==========
print("🐾 Создание животных для свайпа...")
animals_by_shelter = {
    'Happy Paws Almaty': [
        dict(name='Мурка', species='cat', breed='Британская', age=2, photo_url='https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba', is_vaccinated=True, is_neutered=True),
        dict(name='Барсик', species='cat', breed='Сибирская', age=3, photo_url='https://images.unsplash.com/photo-1573865662567-57ef5b67bd00', is_vaccinated=True, is_neutered=False),
        dict(name='Шарик', species='dog', breed='Лабрадор', age=2, photo_url='https://images.unsplash.com/photo-1583511655857-d19b40a7a54e', is_vaccinated=True, is_neutered=False),
        dict(name='Бобик', species='dog', breed='Дворняга', age=5, photo_url='https://images.unsplash.com/photo-1537151608828-ea2b11777ee8', is_vaccinated=True, is_neutered=True),
    ],
    'Dog Shelter Astana': [
        dict(name='Зевс', species='dog', breed='Хаски', age=2, photo_url='https://images.unsplash.com/photo-1534361960057-19889db9621e', is_vaccinated=True, is_neutered=False),
        dict(name='Арчи', species='dog', breed='Корги', age=4, photo_url='https://images.unsplash.com/photo-1519052537078-e6302a4968d4', is_vaccinated=False, is_neutered=False),
        dict(name='Рекс', species='dog', breed='Овчарка', age=3, photo_url='https://images.unsplash.com/photo-1589941013453-ec89f33b5e95', is_vaccinated=True, is_neutered=False),
    ],
    'Cat Home Shymkent': [
        dict(name='Граф', species='cat', breed='Мейн-кун', age=3, photo_url='https://images.unsplash.com/photo-1533738363-b7f9aef128ce', is_vaccinated=True, is_neutered=True),
        dict(name='Симба', species='cat', breed='Рыжий', age=2, photo_url='https://images.unsplash.com/photo-1574158622682-e40e69881006', is_vaccinated=True, is_neutered=True),
    ]
}

for shelter_name, animals in animals_by_shelter.items():
    shelter = Shelter.objects.get(name=shelter_name)
    for data in animals:
        Animal.objects.create(shelter=shelter, **data)
        print(f'  🐾 Добавлен: {data["name"]} ({data["species"]})')

print('\n✨ База данных успешно пересоздана с нуля!')
print(f'👤 Админ: imeke / 212223')
print(f'🏠 Приютов: {Shelter.objects.count()}')
print(f'🐶 Животных: {Animal.objects.count()}')
