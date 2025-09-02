import os
from django.conf import settings

def save_file(file_obj, upload_dir, request=None):
    import os
    from django.conf import settings

    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file_obj.name)

    with open(file_path, "wb+") as f:
        for chunk in file_obj.chunks():
            f.write(chunk)

    rel_path = os.path.relpath(file_path, settings.MEDIA_ROOT).replace("\\", "/")

    if request:
        base_url = request.build_absolute_uri(settings.MEDIA_URL)
    else:
        # fallback to MEDIA_URL only (relative path)
        base_url = settings.MEDIA_URL

    return f"{base_url}{rel_path}"
