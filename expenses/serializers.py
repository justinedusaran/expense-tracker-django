from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Category, Expense

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'email')

    def create(self, validated_data):
        # Use create_user to ensure the password gets hashed!
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name"]

class ExpenseSerializer(serializers.ModelSerializer):
    # This matches the 'category_id' you are sending from dashboard.js
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(), 
        source='category'
    )
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Expense
        fields = ["id", "date", "category_id", "category_name", "title", "note", "amount"]
