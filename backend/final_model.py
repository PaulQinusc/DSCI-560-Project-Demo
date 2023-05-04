def predict_func(user_destination, walking_distance):
    import random
    import pickle
    import pandas as pd
    import datetime
    import holidays
    import json
    import numpy as np
    from operator import itemgetter
    import googlemaps
    gmaps = googlemaps.Client(key='YOUR GOOGLE DISTANCE MATRIX API KEY')
    feature_list = ['Encoded_BlockFace', 'Day_type_Weekday', 'Day_type_Weekend', 'Hour_0',
                    'Hour_1', 'Hour_2', 'Hour_3', 'Hour_4', 'Hour_5', 'Hour_6', 'Hour_7',
                    'Hour_8', 'Hour_9', 'Hour_10', 'Hour_11', 'Hour_12', 'Hour_13',
                    'Hour_14', 'Hour_15', 'Hour_16', 'Hour_17', 'Hour_18', 'Hour_19',
                    'Hour_20', 'Hour_21', 'Hour_22', 'Hour_23', 'Month_1', 'Month_2',
                    'Month_3', 'Month_4', 'Month_5', 'Month_6', 'Month_7', 'Month_8',
                    'Month_9', 'Month_10', 'Month_11', 'Month_12', 'Holiday', 'Normal_day']
    # file name, I'm using *.pickle as a file extension
    filename = "DecisionTree.pickle"

    # load model
    loaded_model = pickle.load(open(filename, "rb"))

    # you can use loaded model to compute predictions

    # Modify the input data to predict
    encoded_block = pd.read_csv('encoded_blockface.csv')

    def create_feature_info():
        feature_dict = dict()
        now = datetime.datetime.now()
        hour = now.hour
        month = now.month

        # Determine day type (weekday or weekend)
        if now.weekday() < 5:
            feature_dict['Day_type_Weekday'] = 1  # weekday
        else:
            feature_dict['Day_type_Weekend'] = 1  # weekend

        # Determine if it's a holiday or not
        us_holidays = holidays.US()
        if now.date() in us_holidays:
            feature_dict['Holiday'] = 1
        else:
            feature_dict['Normal_day'] = 1
        feature_dict[f'Month_{month}'] = 1
        feature_dict[f'Hour_{hour}'] = 1
        return feature_dict

    feature_dictionary = create_feature_info()
    input_data = pd.DataFrame(0, index=np.arange(len(encoded_block)), columns=feature_list)
    input_data['Encoded_BlockFace'] = encoded_block['Encoded_BlockFace']
    for col in input_data.columns:
        if col in feature_dictionary:
            input_data[col] = 1
    y_predicted = loaded_model.predict(input_data)
    predictions = {b: s for b, s in zip(encoded_block['BlockFace'], y_predicted)}
    avaiable_locations = [k for k, v in predictions.items() if v == 1]
    complete_address = []
    for i in avaiable_locations:
        i += ' Los Angeles, CA, USA'  # to make sure these streets are in LA
        complete_address.append(i)
    rate_time_feature = pd.read_csv('Blockface_features.csv')
    block_dict_info = rate_time_feature.set_index('BlockFace').T.to_dict('list')
    complete_block_dict_info = {k + ' Los Angeles, CA, USA' : v for k, v in block_dict_info.items()}
    origin = user_destination
    dest_dict = {}
    for destination in complete_address:
        distance = gmaps.distance_matrix(origin, destination, mode='driving', units='imperial',
                            avoid=None)["rows"][0]["elements"][0]["distance"]["value"] * 0.000621371
        if float(distance) <= walking_distance * 0.00018939: 
            dest_dict[destination] = [distance]
            dest_dict[destination].append(complete_block_dict_info[destination])
    sorted_dict = sorted(dest_dict.items(), key=lambda x: x[1][0])
    smallest_5_dict = {k: v for k, v in sorted_dict[:5]}
    result = [{'name': k[:len(k) - 21], 'distance': f'{int(v[0] * 5280)} feet', 'rateRange': v[1][1], 'timeLimit': v[1][0]} for k, v in
                smallest_5_dict.items()]
    return print(json.dumps(result))

if __name__ == '__main__':
    import sys
    predict_func(sys.argv[1], float(sys.argv[2]))
