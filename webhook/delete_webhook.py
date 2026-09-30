import dotenv
import requests
import os

def get_env(key: str) -> str:
    value = os.environ.get(key)
    if value is None:
        raise Exception(f"Missing required enviroment variable {key}")
    return value

def delete_webhook():
    dotenv.load_dotenv()
    VIPPS_CLIENT_ID = get_env("VIPPS_CLIENT_ID")
    VIPPS_CLIENT_SECRET = get_env("VIPPS_CLIENT_SECRET")
    VIPPS_SUBSCRIPTION_KEY = get_env("VIPPS_SUBSCRIPTION_KEY")
    VIPPS_MSN = get_env("VIPPS_MSN")
    VIPPS_URL = get_env("VIPPS_URL")
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
    webhooks_res = requests.get(
        url=f"{VIPPS_URL}/webhooks/v1/webhooks",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Ocp-Apim-Subscription-Key": f"{VIPPS_SUBSCRIPTION_KEY}",
            "Merchant-Serial-Number": f"{VIPPS_MSN}",
        },
    )
    webhooks_res.raise_for_status()
    webhooks = webhooks_res.json()["webhooks"]
    if len(webhooks) == 0:
        print("No webhooks found")
        return
    print("\n".join(map(lambda x: f"{x[0]+1}. {x[1]["url"]} - {x[1]["id"]}", enumerate(webhooks))))
    to_delete = int(input("Type the number of the one would you like to delete: ")) - 1
    if to_delete < 0 or to_delete >= len(webhooks):
        print("Invalid number given")
        return
    id_to_delete = webhooks[to_delete]["id"]
    webhooks_delete_res = requests.delete(
        url=f"{VIPPS_URL}/webhooks/v1/webhooks/{id_to_delete}",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Ocp-Apim-Subscription-Key": f"{VIPPS_SUBSCRIPTION_KEY}",
            "Merchant-Serial-Number": f"{VIPPS_MSN}",
        },
    )
    webhooks_delete_res.raise_for_status()
    print("Successfully deleted webhook. Please delete your 'VIPPS_WEBHOOK_SECRET' from your .env")

if __name__ == "__main__":
    delete_webhook()
