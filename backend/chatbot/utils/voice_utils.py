import speech_recognition as sr

def audio_to_text(audio_file):
    """
    Convert uploaded audio file to text using Google Speech Recognition.
    """
    recognizer = sr.Recognizer()
    with sr.AudioFile(audio_file) as source:
        audio_data = recognizer.record(source)
    return recognizer.recognize_google(audio_data)
