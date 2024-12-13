from celery import shared_task
from allauth.account import app_settings
from django.core.mail import EmailMessage, EmailMultiAlternatives


@shared_task
def add(x, y):
    return x + y


@shared_task
def send_emails(subject, bodies, from_email, to):
    html_ext = app_settings.TEMPLATE_EXTENSION
    # print(to)
    if "txt" in bodies:
        msg = EmailMultiAlternatives(
            subject, bodies["txt"], from_email, to,
        )
        if html_ext in bodies:
            msg.attach_alternative(bodies[html_ext], "text/html")
    else:
        msg = EmailMessage(
            subject, bodies[html_ext], from_email, to,
        )
        msg.content_subtype = "html"  # Main content is now text/html
    msg.send()
