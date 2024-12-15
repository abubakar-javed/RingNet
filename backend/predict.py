import sys
import joblib
import numpy as np

model = joblib.load('earthquake_model.pkl')

input_params = list(map(float, sys.argv[1:13]))
input_array = np.array([input_params])

predicted_magnitude = model.predict(input_array)[0]
# GMPE-based formula to estimate destruction range
# I(R) = a + b * M - c * log10(R), solved for R
# def estimate_distance(magnitude):
#     # Coefficients based on literature (example values, adjust as needed)
#     a = 1.0   # baseline intensity
#     b = 1.2   # magnitude scaling factor
#     c = 0.003 # attenuation coefficient (distance dependency)

#     # Threshold intensity for significant destruction
#     threshold_intensity = 0.5

#     # Solve for R (distance)
#     distance = 10 ** ((magnitude * b - threshold_intensity - a) / c)
#     return round(distance, 2)

def estimate_distance(magnitude):
    if magnitude >= 7:
        return 500
    elif magnitude >= 5:
        return 200
    else:
        return 100

distance = estimate_distance(predicted_magnitude)
print(f"{predicted_magnitude},{distance}")

