# chatbot/nlp/intent.py
import joblib
from pathlib import Path

MODEL_PATH = Path(__file__).resolve().parent.parent.parent / "ml" / "intent_model.joblib"
_model = None

def load_model():
    global _model
    if _model is None:
        try:
            _model = joblib.load(MODEL_PATH)
        except FileNotFoundError:
            raise RuntimeError(f"Intent model not found at {MODEL_PATH}. Train the model first.")
    return _model

def get_intent(text: str):
    model = load_model()
    
    # If classifier supports probabilities
    if hasattr(model.named_steps["clf"], "predict_proba"):
        probs = model.predict_proba([text])
        labels = model.named_steps["clf"].classes_
        idx = probs[0].argmax()
        return labels[idx], float(probs[0][idx])
    
    # Fallback if no probability support
    pred = model.predict([text])[0]
    return pred, 0.65
