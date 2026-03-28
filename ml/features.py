from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer

CATEGORICAL  = ['meal_type', 'category']
NUMERIC      = ['day_of_week', 'menu_items', 'enrolled', 'event_day', 'weather_code', 'hour_of_day']
ALL_FEATURES = CATEGORICAL + NUMERIC
MEAL_HOURS   = {'breakfast': 7, 'lunch': 12, 'dinner': 18}

def build_preprocessor():
    return ColumnTransformer(transformers=[
        ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), CATEGORICAL),
        ('num', 'passthrough', NUMERIC),
    ])

def add_derived_features(df):
    df = df.copy()
    df['hour_of_day'] = df['meal_type'].map(MEAL_HOURS).fillna(12).astype(int)
    df['event_day']   = df['event_day'].astype(int)
    return df
