from allauth.account.adapter import DefaultAccountAdapter
from django.contrib.sites.shortcuts import get_current_site
from django.template.loader import render_to_string
from django.template import TemplateDoesNotExist
from allauth.account import app_settings
from django.conf import settings
from .tasks import send_emails


class CustomAccountAdapter(DefaultAccountAdapter):

    def send_mail(self, template_prefix, email, context, request):
        ctx = {
            "email": email,
            "current_site": get_current_site(request),
        }
        ctx.update(context)
        to = [email] if isinstance(email, str) else email
        subject = render_to_string(
            "{0}_subject.txt".format(template_prefix), context)
        # remove superfluous line breaks
        subject = " ".join(subject.splitlines()).strip()
        subject = self.format_email_subject(subject)

        from_email = self.get_from_email()

        bodies = {}
        html_ext = app_settings.TEMPLATE_EXTENSION
        for ext in [html_ext, "txt"]:
            try:
                template_name = "{0}_message.{1}".format(template_prefix, ext)
                bodies[ext] = render_to_string(
                    template_name,
                    context,
                    request,
                ).strip()
            except TemplateDoesNotExist:
                if ext == "txt" and not bodies:
                    # We need at least one body
                    raise

        send_emails.apply_async(args=[subject, bodies, from_email, to])

    def send_confirmation_mail(self, request, emailconfirmation, signup):
        context = {
            "user": emailconfirmation.email_address.user,
            "activate_url": self.get_email_confirmation_url(
                request, emailconfirmation
            ),
            "current_site": settings.SITE_ID,
            "key": emailconfirmation.key,
            # Add any extra context you need here
            "custom_value": "",
        }
        if signup:
            email_template = "account/email/email_confirmation_signup"
        else:
            email_template = "account/email/email_confirmation"
        self.send_mail(
            email_template,
            emailconfirmation.email_address.email, context, request
        )

    def get_email_confirmation_url(self, request, emailconfirmation):
        return\
            f"http://localhost:5173/confirm_email/{
                emailconfirmation.key}/"
