import geopandas as gpd
import numpy as np
import math
import pandas as pd
from pyproj import Transformer
import random

def calculate_circle_radius(area):
    return math.sqrt(area / math.pi)

def create_uniform_grid_in_circle(radius, num_points):
    points = []
    area_per_point = math.pi * radius ** 2 / num_points
    distance_between_points = math.sqrt(area_per_point)

    num_rings = int(radius / distance_between_points) + 1
    for i in range(num_rings):
        ring_radius = distance_between_points * i
        circumference = 2 * math.pi * ring_radius
        ideal_num_points_in_ring = int(circumference / distance_between_points)

        if ring_radius + distance_between_points > radius:
            num_points_in_ring = int(ideal_num_points_in_ring * (radius - ring_radius) / distance_between_points)
        else:
            num_points_in_ring = ideal_num_points_in_ring

        num_points_in_ring = max(num_points_in_ring, 1) 

        for j in range(num_points_in_ring):
            angle = 2 * math.pi * j / num_points_in_ring
            x = ring_radius * math.cos(angle)
            y = ring_radius * math.sin(angle)
            points.append((x, y))
            if len(points) >= num_points:
                return points[:num_points]
    return points

transformer_to_albers = Transformer.from_crs("EPSG:4326", "EPSG:5070", always_xy=True)
transformer_to_wgs84 = Transformer.from_crs("EPSG:5070", "EPSG:4326", always_xy=True)

def assign_final_lon_lat(geo_data, grid_points, indexes, center, transformer):
    shuffled_indexes = list(indexes)
    random.shuffle(shuffled_indexes)
    
    if len(grid_points) > len(shuffled_indexes):
        grid_points = grid_points[:len(shuffled_indexes)]
    elif len(grid_points) < len(shuffled_indexes):
        extra_points = [grid_points[-1]] * (len(shuffled_indexes) - len(grid_points))
        grid_points.extend(extra_points)
    
    translated_points_albers = [(x + center[0], y + center[1]) for x, y in grid_points]
    translated_points_wgs84 = [transformer.transform(x, y) for x, y in translated_points_albers]
    
    for i, index in enumerate(shuffled_indexes):
        geo_data.at[index, 'final_lon'] = translated_points_wgs84[i][0]
        geo_data.at[index, 'final_lat'] = translated_points_wgs84[i][1]

def assign_final_lon_latv(geo_data, grid_points, indexes, center, transformer):
    shuffled_indexes = list(indexes)
    random.shuffle(shuffled_indexes)
    
    if len(grid_points) > len(shuffled_indexes):
        grid_points = grid_points[:len(shuffled_indexes)]
    elif len(grid_points) < len(shuffled_indexes):
        extra_points = [grid_points[-1]] * (len(shuffled_indexes) - len(grid_points))
        grid_points.extend(extra_points)
    
    translated_points_albers = [(x + center[0], y + center[1]) for x, y in grid_points]
    translated_points_wgs84 = [transformer.transform(x, y) for x, y in translated_points_albers]
    
    for i, index in enumerate(shuffled_indexes):
        geo_data.at[index, 'final_lonv'] = translated_points_wgs84[i][0]
        geo_data.at[index, 'final_latv'] = translated_points_wgs84[i][1]

file_path = 'parcels-rewound.geojson'
geojson_data = gpd.read_file(file_path)

geojson_data_albers = geojson_data.to_crs("EPSG:5070")

group1 = geojson_data_albers[geojson_data_albers['state'] == 'TX']
group2 = geojson_data_albers[geojson_data_albers['state'] != 'TX']

total_acres_group1 = group1['gis_acres'].sum()
total_acres_group2 = group2['gis_acres'].sum()

scale_factor = 15

radius_group1 = calculate_circle_radius(total_acres_group1 * 4046.86) * scale_factor
radius_group2 = calculate_circle_radius(total_acres_group2 * 4046.86) * scale_factor

grid_points_group1 = create_uniform_grid_in_circle(radius_group1, len(group1))
grid_points_group2 = create_uniform_grid_in_circle(radius_group2, len(group2))

center_group1_lonlat = [-82.5, 40.50] 
center_group2_lonlat = [-110.25, 40.50] 
center_group1 = transformer_to_albers.transform(*center_group1_lonlat)
center_group2 = transformer_to_albers.transform(*center_group2_lonlat)

assign_final_lon_lat(geojson_data, grid_points_group1, group1.index, center_group1, transformer_to_wgs84)
assign_final_lon_lat(geojson_data, grid_points_group2, group2.index, center_group2, transformer_to_wgs84)

center_group1_lonlatv = [-96.375, 42] 
center_group2_lonlatv = [-96.375, 21.5] 
center_group1v = transformer_to_albers.transform(*center_group1_lonlatv)
center_group2v = transformer_to_albers.transform(*center_group2_lonlatv)

assign_final_lon_latv(geojson_data, grid_points_group1, group1.index, center_group1v, transformer_to_wgs84)
assign_final_lon_latv(geojson_data, grid_points_group2, group2.index, center_group2v, transformer_to_wgs84)

geojson_data = geojson_data.to_crs("EPSG:4326")

updated_file_path = 'updated-parcels.geojson'
geojson_data.to_file(updated_file_path, driver='GeoJSON')

print(f"Updated GeoJSON file saved to: {updated_file_path}")
