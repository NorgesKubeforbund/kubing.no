import dotenv
import requests
import os

def get_env(key: str) -> str:
    value = os.environ.get(key)
    if value is None:
        raise Exception(f"Missing required enviroment variable {key}")
    return value

def add_webhook():
    dotenv.load_dotenv()
    VIPPS_CLIENT_ID = get_env("VIPPS_CLIENT_ID")
    VIPPS_CLIENT_SECRET = get_env("VIPPS_CLIENT_SECRET")
    VIPPS_SUBSCRIPTION_KEY = get_env("VIPPS_SUBSCRIPTION_KEY")
    VIPPS_MSN = get_env("VIPPS_MSN")
    VIPPS_URL = get_env("VIPPS_URL")
    APP_URL = get_env("APP_URL")
    access_token_res = requests.post(
        url=f"{VIPPS_URL}/accesstoken/get",
        headers={
            "Content-Type": "application/json",
            "client_id": f"{VIPPS_CLIENT_ID}",
            "client_secret": f"{VIPPS_CLIENT_SECRET}",
            "Ocp-Apim-Subscription-Key": f"{VIPPS_SUBSCRIPTION_KEY}",
            "Merchant-Serial-Number": f"{VIPPS_MSN}",
        },
    )
    access_token_res.raise_for_status()
    access_token = access_token_res.json()["access_token"]
    webhook_res = requests.post(
        url=f"{VIPPS_URL}/webhooks/v1/webhooks",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Ocp-Apim-Subscription-Key": f"{VIPPS_SUBSCRIPTION_KEY}",
            "Merchant-Serial-Number": f"{VIPPS_MSN}",
        },
        json={
            "url": f"{APP_URL}/api/vipps/webhook",
            "events": [
                "recurring.agreement-activated.v1",
                "recurring.agreement-rejected.v1",
                "recurring.agreement-stopped.v1",
                "recurring.agreement-expired.v1",
                "recurring.charge-captured.v1",
            ],
        },
    )
    webhook_res.raise_for_status()
    webhook_secret = webhook_res.json()["secret"]
    with open(".env", "a") as f:
        f.write(f"VIPPS_WEBHOOK_SECRET={webhook_secret}\n")
    print("Successfully added 'VIPPS_WEBHOOK_SECRET' to your .env")

if __name__ == "__main__":
    add_webhook()
