from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class CustomPagination(PageNumberPagination):
    page_size = 5  # default page size
    page_size_query_param = 'page_size'
    max_page_size = 50

def paginate_queryset(queryset, request, serializer_class):
    """
    Paginate any queryset and return paginated response.
    """
    paginator = CustomPagination()
    page = paginator.paginate_queryset(queryset, request)
    serializer = serializer_class(page, many=True)
    return paginator.get_paginated_response(serializer.data)
