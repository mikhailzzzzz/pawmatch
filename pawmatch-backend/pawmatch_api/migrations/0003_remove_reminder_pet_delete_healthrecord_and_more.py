from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('pawmatch_api', '0002_animal_submitted_by_shelter_instagram_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='reminder',
            name='pet',
        ),
        migrations.DeleteModel(
            name='HealthRecord',
        ),
        migrations.DeleteModel(
            name='Reminder',
        ),
    ]
