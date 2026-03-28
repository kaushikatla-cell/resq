import os, pickle
import pandas as pd
from sklearn.linear_model import Ridge
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_absolute_error
from features import build_preprocessor, add_derived_features, ALL_FEATURES

def fetch_data():
    url = os.environ.get('SUPABASE_URL') or os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
    key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    if url and key:
        from supabase import create_client
        sb   = create_client(url, key)
        rows = sb.table('historical_surplus_data').select('*').execute()
        df   = pd.DataFrame(rows.data)
        print(f'  Fetched {len(df)} rows from Supabase')
        return df
    print('  No Supabase creds — using synthetic data')
    return _synthetic()

def _synthetic():
    import numpy as np; np.random.seed(42); n = 500
    days = np.random.randint(0,7,n); meals = np.random.choice(['breakfast','lunch','dinner'],n)
    cats = np.random.choice(['hot_entrees','bakery','salad','produce','dairy'],n)
    items = np.random.randint(4,18,n); enrolled = np.random.choice([180,200,350,420,1200],n)
    event = np.random.randint(0,2,n); weather = np.random.choice([0,0,0,1,2],n)
    cm = {'hot_entrees':1.0,'bakery':1.8,'salad':1.2,'produce':1.4,'dairy':0.9}
    dm = [1.2,1.0,1.0,1.0,1.0,0.6,0.6]
    surpluses = [max(5,int(enrolled[i]*0.08*cm[cats[i]]*dm[days[i]]*(0.5 if event[i] else 1.0)*np.random.uniform(0.7,1.3))) for i in range(n)]
    return pd.DataFrame({'day_of_week':days,'meal_type':meals,'category':cats,'menu_items':items,'enrolled':enrolled,'event_day':event,'weather_code':weather,'actual_surplus':surpluses})

def train():
    print('\n🤖 ResQ ML Training\n' + '─'*40)
    df = add_derived_features(fetch_data())
    X  = df[ALL_FEATURES]; y = df['actual_surplus']
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    pipeline = Pipeline([('preprocessor', build_preprocessor()), ('model', Ridge(alpha=1.0))])
    pipeline.fit(X_train, y_train)
    preds = pipeline.predict(X_test)
    mae   = mean_absolute_error(y_test, preds)
    cv    = cross_val_score(pipeline, X, y, cv=5, scoring='neg_mean_absolute_error')
    print(f'  MAE (test):      {mae:.1f} servings')
    print(f'  MAE (5-fold CV): {-cv.mean():.1f} ± {cv.std():.1f} servings')
    model_path = os.path.join(os.path.dirname(__file__), 'model.pkl')
    with open(model_path, 'wb') as f: pickle.dump(pipeline, f)
    print(f'\n✅ Model saved → {model_path}')

if __name__ == '__main__': train()
