import smtplib
import os

email = "kannan2005@gmail.com"
password = os.environ.get("SMTP_TEST_PASSWORD")

try:
    server = smtplib.SMTP("smtp.gmail.com", 587)
    server.ehlo()
    server.starttls()
    server.ehlo()
    server.login(email, password)

    print("GMAIL SMTP AUTHENTICATION SUCCESSFUL")

    server.quit()

except Exception as e:
    print("GMAIL SMTP AUTHENTICATION FAILED")
    print(e)