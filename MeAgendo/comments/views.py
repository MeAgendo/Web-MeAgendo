from django.shortcuts import render

# Create your views here.
def test_template_view(request):
    return render(request, 'Blog_prueba.html')