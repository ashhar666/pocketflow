from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0004_remove_hardcoded_admin'),
    ]

    operations = [
        migrations.CreateModel(
            name='SupportMessage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('sender_email', models.EmailField(blank=True, max_length=254)),
                ('message', models.TextField()),
                ('email_sent', models.BooleanField(default=False)),
                ('email_error', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='supportmessage',
            index=models.Index(fields=['created_at'], name='users_suppo_created_1206ed_idx'),
        ),
        migrations.AddIndex(
            model_name='supportmessage',
            index=models.Index(fields=['sender_email'], name='users_suppo_sender__59c3d1_idx'),
        ),
    ]
