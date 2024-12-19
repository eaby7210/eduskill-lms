# myapp/utils.py
import razorpay
from django.conf import settings

client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_SECRET_KEY))
client.set_app_details({"title": "EduSkill", "version": "1.0"})

key = settings.RAZORPAY_KEY_ID
