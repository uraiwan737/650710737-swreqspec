# test ของ T-03: จองคิวสำเร็จ
# AC-BKG-01 (FR-BKG-04)
from app.db.models import Booking
from tests.conftest import AUTH


def test_AC_BKG_01(client, make_slot):
    """AC-BKG-01: ยืนยันตัวตนแล้ว และช่วง 09.00 น. มีที่นั่งว่าง จองแล้วต้องสำเร็จ"""
    slot = make_slot(start="09:00", remaining=1)

    res = client.post("/bookings", json={"slot_id": slot.id}, headers=AUTH)

    assert res.status_code == 201


def test_TC_BKG_01_1_booking_success(client, db, make_slot):
    # Given: ผู้รับบริการยืนยันตัวตนแล้ว และช่วง 09.00 น. มีที่นั่งว่าง 1 ที่
    slot = make_slot(start="09:00", remaining=1)

    # When: ยืนยันการจองช่วง 09.00 น.
    res = client.post("/bookings", json={"slot_id": slot.id}, headers=AUTH)

    # Then: บันทึกการจองสำเร็จ; แสดงหมายเลขคิว (รอ Q-02); ที่นั่งว่างของช่วง 09.00 น. เป็น 0
    assert res.status_code == 201
    payload = res.json()
    assert "booking_id" in payload
    assert "queue_no" in payload
    assert payload["queue_no"] is not None
    assert db.query(Booking).count() == 1
    db.refresh(slot)
    assert slot.remaining == 0


def test_TC_BKG_01_2_last_seat_booking(client, db, make_slot):
    # Given: ผู้รับบริการยืนยันตัวตนแล้ว และช่วง 09.00 น. เป็นช่วงสุดท้ายที่มีที่นั่งว่าง 1 ที่
    slot = make_slot(start="09:00", remaining=1, capacity=1)

    # When: ยืนยันการจองช่วง 09.00 น. ในสถานะเหลือ 1 ที่สุดท้าย
    res = client.post("/bookings", json={"slot_id": slot.id}, headers=AUTH)

    # Then: บันทึกการจองสำเร็จ; แสดงหมายเลขคิว (รอ Q-02); ที่นั่งว่างของช่วง 09.00 น. ลดจาก 1 เป็น 0 อย่างเดียว
    assert res.status_code == 201
    payload = res.json()
    assert "queue_no" in payload
    assert db.query(Booking).count() == 1
    db.refresh(slot)
    assert slot.remaining == 0


def test_TC_BKG_01_3_unverified_user_rejected(client, db, make_slot):
    # Given: ผู้รับบริการยังไม่ได้ยืนยันตัวตน และช่วง 09.00 น. มีที่นั่งว่าง 1 ที่
    slot = make_slot(start="09:00", remaining=1)

    # When: พยายามยืนยันการจองช่วง 09.00 น.
    res = client.post("/bookings", json={"slot_id": slot.id})

    # Then: ไม่บันทึกการจอง; แสดงข้อความปฏิเสธการเข้าถึง/ยืนยันตัวตนก่อนจอง; ไม่ลดที่นั่งของช่วง 09.00 น.
    assert res.status_code == 401
    assert db.query(Booking).count() == 0
    db.refresh(slot)
    assert slot.remaining == 1
