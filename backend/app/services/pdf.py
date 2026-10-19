import os

from fpdf import FPDF

FONT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets", "fonts")


def _money(n: float) -> str:
    return f"{n:,.0f} d"


def generate_bill_pdf(bill: dict, room: dict | None, tenant: dict | None) -> bytes:
    pdf = FPDF()
    pdf.add_page()
    pdf.add_font("Noto", "", os.path.join(FONT_DIR, "NotoSans-Regular.ttf"))
    pdf.add_font("Noto", "B", os.path.join(FONT_DIR, "NotoSans-Bold.ttf"))

    pdf.set_font("Noto", "B", 18)
    pdf.cell(0, 12, "HOA DON TIEN PHONG TRO", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.set_font("Noto", "B", 18)
    pdf.set_font("Noto", "", 11)

    pdf.ln(2)
    pdf.set_font("Noto", "", 11)
    pdf.cell(0, 7, f"Mã hóa đơn: {bill['bill_code']}", new_x="LMARGIN", new_y="NEXT")
    pdf.cell(0, 7, f"Tháng: {bill['month']}", new_x="LMARGIN", new_y="NEXT")
    if room:
        pdf.cell(
            0, 7,
            f"Phòng: {room.get('name', '')} (Mã: {room.get('room_code', '')})",
            new_x="LMARGIN", new_y="NEXT",
        )
    if tenant:
        pdf.cell(0, 7, f"Người thuê: {tenant.get('full_name', '')}", new_x="LMARGIN", new_y="NEXT")
        if tenant.get("phone"):
            pdf.cell(0, 7, f"Điện thoại: {tenant.get('phone')}", new_x="LMARGIN", new_y="NEXT")

    pdf.ln(4)
    pdf.set_font("Noto", "B", 11)
    pdf.set_fill_color(230, 230, 230)
    pdf.cell(120, 9, "Khoản mục", border=1, fill=True)
    pdf.cell(70, 9, "Số tiền (VND)", border=1, align="R", fill=True, new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Noto", "", 11)
    rows = [
        ("Tiền phòng", bill["room_rent"]),
        (f"Tiền điện ({bill['electricity_consumption']:g} kWh)", bill["electricity_amount"]),
        (f"Tiền nước ({bill['water_consumption']:g} m3)", bill["water_amount"]),
        ("Phí internet", bill["internet_fee"]),
        ("Phí gửi xe", bill["parking_fee"]),
        ("Phí vệ sinh", bill["cleaning_fee"]),
        ("Phí khác", bill["other_fee"]),
    ]
    for label, amount in rows:
        pdf.cell(120, 8, label, border=1)
        pdf.cell(70, 8, _money(amount), border=1, align="R", new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Noto", "B", 11)
    pdf.cell(120, 9, "TỔNG CỘNG", border=1)
    pdf.cell(70, 9, _money(bill["total_amount"]), border=1, align="R", new_x="LMARGIN", new_y="NEXT")

    pdf.ln(6)
    pdf.set_font("Noto", "", 10)
    status_text = "Đã thanh toán" if bill["status"] == "paid" else "Chưa thanh toán"
    pdf.cell(0, 7, f"Trạng thái: {status_text}", new_x="LMARGIN", new_y="NEXT")

    return bytes(pdf.output())
