
import csv
import random
import os
output_directory = 'public/distances/'

# Generate a random distance matrix

matrix_size = 100 #len(os.listdir("public/TI_images/"))  
print(matrix_size)

similarity_matrix = [[random.random() for j in range(matrix_size)] for i in range(matrix_size)]

for i in range(matrix_size):
    similarity_matrix[i][i] = 1.
    for j in range(i):
        similarity_matrix[i][j] = similarity_matrix[j][i]

csv_filepath = output_directory + 'sim_matrix1.csv'
with open(csv_filepath, 'w', newline='') as file:
    writer = csv.writer(file)
    writer.writerows(similarity_matrix)

print('simiarity matrix generated successfully!')
