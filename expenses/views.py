from rest_framework import viewsets, generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.filters import OrderingFilter
from rest_framework.response import Response
from .models import Category, Expense
from .serializers import CategorySerializer, ExpenseSerializer, RegisterSerializer
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as filters

class RegisterViewSet(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ExpenseFilter(filters.FilterSet):
    start_date = filters.DateFilter(field_name="date", lookup_expr='gte')
    end_date = filters.DateFilter(field_name="date", lookup_expr='lte')
    category = filters.NumberFilter(field_name="category_id")

    class Meta:
        model = Expense
        fields = ['start_date', 'end_date', 'category']

class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = ExpenseFilter
    ordering_fields = ['date', 'amount']
    ordering = ['-date']

    def get_queryset(self):
        return Expense.objects.filter(user=self.request.user).select_related('category')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)