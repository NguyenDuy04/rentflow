"""Core billing calculation logic, kept isolated from the API layer so it's
easy to unit test and reuse (e.g. for a preview endpoint later)."""


def compute_bill_amounts(room: dict, meter: dict, pricing: dict) -> dict:
    electricity_consumption = meter["electricity_new"] - meter["electricity_old"]
    water_consumption = meter["water_new"] - meter["water_old"]

    electricity_amount = electricity_consumption * pricing["electricity_price"]
    water_amount = water_consumption * pricing["water_price"]
    room_rent = room["rent_price"]

    internet_fee = pricing.get("internet_fee", 0)
    parking_fee = pricing.get("parking_fee", 0)
    cleaning_fee = pricing.get("cleaning_fee", 0)
    other_fee = pricing.get("other_fee", 0)

    total_amount = (
        room_rent
        + electricity_amount
        + water_amount
        + internet_fee
        + parking_fee
        + cleaning_fee
        + other_fee
    )

    return {
        "room_rent": room_rent,
        "electricity_consumption": electricity_consumption,
        "electricity_amount": electricity_amount,
        "water_consumption": water_consumption,
        "water_amount": water_amount,
        "internet_fee": internet_fee,
        "parking_fee": parking_fee,
        "cleaning_fee": cleaning_fee,
        "other_fee": other_fee,
        "total_amount": total_amount,
    }
