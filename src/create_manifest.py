import os
import json

image_directory = 'public/real_images/'

# Get the list of image files in the directory
image_files = [f for f in os.listdir(image_directory) if os.path.isfile(os.path.join(image_directory, f))]

# Filter the files to include only image files
image_files = [f for f in image_files if f.lower().endswith(('.jpg', '.jpeg', '.png', '.svg'))]

# Write the image file names to manifest.json
manifest = json.dumps(image_files, indent=2)

manifest_path = os.path.join(image_directory, 'manifest.json')
with open(manifest_path, 'w') as f:
    f.write(manifest)

print('manifest.json generated successfully!')
