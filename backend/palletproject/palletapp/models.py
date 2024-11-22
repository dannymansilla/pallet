from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.utils import timezone

class MyUserManager(BaseUserManager):
    def create_user(self, email, name, password=None):
        if not email:
            raise ValueError("Users must have an email address")
        if not name:
            raise ValueError("Users must have a name")

        user = self.model(
            email=self.normalize_email(email),
            name=name,
        )
        user.set_password(password)  # Automatically hashes the password
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None):
        user = self.create_user(
            email=email,
            name=name,
            password=password,
        )
        user.is_admin = True
        user.save(using=self._db)
        return user


class Company(models.Model):
    company_name = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)

    def __str__(self):
        return self.company_name

class Role(models.Model):
    role_name = models.CharField(max_length=100)

    def __str__(self):
        return self.role_name

class User(AbstractBaseUser):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    password_hash = models.CharField(max_length=255)  # Stores the hashed password
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True)
    company = models.ForeignKey(Company, on_delete=models.SET_NULL, null=True, blank=True)
    
    objects = MyUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    def __str__(self):
        return self.email


class Listing(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='listings')
    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=50, choices=[('Open', 'Open'), ('Closed', 'Closed')], default='Open')
    closing_date = models.DateTimeField()
    current_bids = models.IntegerField(default=0)  # Tracks the number of bids

    def __str__(self):
        return self.title


class Bid(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bids')
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='bids')
    bid_amount = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField()
    status = models.CharField(max_length=50, choices=[('OPEN', 'Open'), ('CLOSED', 'Closed')], default='OPEN')

    def __str__(self):
        return f"Bid by {self.user.name} on {self.listing.title}"
