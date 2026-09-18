<<<<<<< HEAD
from django.shortcuts import render

# Create your views here.
=======
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.throttling import AnonRateThrottle

from .serializers import RegisterSerializer, UserSerializer


class RegisterView(generics.CreateAPIView):
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                'success': True,
                'message': 'User registered successfully.',
                'data': UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginThrottle(AnonRateThrottle):
    scope = 'login'
    rate = '5/min'


class LoginView(TokenObtainPairView):
    throttle_classes = (LoginThrottle,)


class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {'success': True, 'message': 'Logged out successfully.'},
                status=status.HTTP_200_OK,
            )
        except Exception:
            return Response(
                {'success': False, 'error': 'Invalid or missing refresh token.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
>>>>>>> madhura-google-workspace
