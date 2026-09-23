# Tasks: จองคิวตรวจสุขภาพ (Booking)

- Feature: จองคิวตรวจสุขภาพ (Booking)
- Spec ID: SPEC-BKG-001
- อ้างอิง: [plan.md](plan.md)
- วันที่: 2569-09-23

มีทั้งหมด 18 task โดยมี 4 task ที่ต้องรอคำตอบ `Q-02` เรื่องรูปแบบและวิธีออกหมายเลขคิว
งานเรียงตามการพึ่งพา โดยงานหน้าจอเริ่มจาก API จำลองได้ และการเชื่อมต่อ API จริงอยู่ช่วงท้าย

## รายการงาน

### T-01 สร้างโมเดลและ migration ฐานข้อมูล
- รองรับ: CON-TECH-01, DOM-PDPA-01, IF-HIS-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-06 และ T-11
- ไฟล์ที่แตะ: `backend/app/db/models.py`, `backend/app/db/session.py`, `backend/app/db/migrations/001_init.py`, `backend/tests/conftest.py`
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: migration สร้างตาราง `slots`, `bookings` และ `audit_logs` ได้ และตาราง `bookings` ไม่มีคอลัมน์เลขบัตรประชาชน
- สถานะ: เสร็จ รอทีมตรวจ

### T-02 ตั้งค่าแอปและการเชื่อมต่อ PostgreSQL
- รองรับ: CON-TECH-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-01 และ T-03 ถึง T-12
- ไฟล์ที่แตะ: `backend/app/config.py`, `backend/app/main.py`
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: แอปอ่าน `DATABASE_URL` และเริ่มต้น FastAPI พร้อม session ฐานข้อมูลได้
- สถานะ: พร้อมทำ

### T-03 ตรวจผลยืนยันตัวตนก่อนเข้า endpoint
- รองรับ: IF-IDP-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-04 ถึง T-12
- ไฟล์ที่แตะ: `backend/app/auth/idp.py`, `backend/app/main.py`, `backend/tests/test_idp.py`
- ต้องทำหลัง: T-02
- เสร็จเมื่อ: request ที่ไม่มีผลยืนยันตัวตนถูกปฏิเสธ และ request ที่ยืนยันแล้วผ่านตัวตรวจสอบได้
- สถานะ: พร้อมทำ

### T-04 สร้าง API ค้นหาช่วงเวลาว่าง
- รองรับ: FR-BKG-01, FR-BKG-06
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-05 และ T-14
- ไฟล์ที่แตะ: `backend/app/slots/service.py`, `backend/app/slots/router.py`, `backend/app/main.py`, `backend/tests/test_slots.py`
- ต้องทำหลัง: T-01, T-02, T-03
- เสร็จเมื่อ: `GET /slots` คืนช่วงเวลาภายใน 30 วัน จำนวนที่นั่งคงเหลือ และคำนวณใหม่เมื่อส่ง `package_code` ต่างกัน
- สถานะ: พร้อมทำ

### T-05 ทดสอบประสิทธิภาพการค้นหาช่วงเวลา
- รองรับ: NFR-PERF-01, FR-BKG-01
- ตรวจด้วย: AC-BKG-05
- ไฟล์ที่แตะ: `backend/tests/test_AC_BKG_05.py`
- ต้องทำหลัง: T-04
- เสร็จเมื่อ: การทดสอบผู้ใช้พร้อมกัน 200 รายงานค่า p95 ของ `GET /slots` ไม่เกิน 2 วินาที หรือบันทึกผลจริงบนเครื่องทดสอบตามที่กำหนด
- สถานะ: พร้อมทำ

### T-06 สร้างการจองและตัดจำนวนที่นั่งแบบธุรกรรม
- รองรับ: FR-BKG-04
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-07 และ T-08
- ไฟล์ที่แตะ: `backend/app/booking/service.py`, `backend/app/booking/router.py`, `backend/app/main.py`, `backend/tests/test_booking_create.py`
- ต้องทำหลัง: T-01, T-02, T-03, T-04
- เสร็จเมื่อ: การยืนยันที่นั่งว่างบันทึก booking และลด `remaining` ของ slot เดิมได้ในธุรกรรมเดียว
- สถานะ: พร้อมทำ

### T-07 ออกและแสดงหมายเลขคิว
- รองรับ: FR-BKG-04
- ตรวจด้วย: AC-BKG-01
- ไฟล์ที่แตะ: `backend/app/booking/service.py`, `backend/app/booking/router.py`, `backend/tests/test_AC_BKG_01.py`
- ต้องทำหลัง: T-06
- เสร็จเมื่อ: test_AC_BKG_01 ผ่าน โดย booking สำเร็จ แสดงหมายเลขคิว และ `remaining` เป็น 0
- สถานะ: รอ Q-02

### T-08 ป้องกันการจองซ้ำในวันเดียวกัน
- รองรับ: FR-BKG-02
- ตรวจด้วย: AC-BKG-02
- ไฟล์ที่แตะ: `backend/app/booking/service.py`, `backend/app/booking/router.py`, `backend/tests/test_AC_BKG_02.py`
- ต้องทำหลัง: T-06
- เสร็จเมื่อ: test_AC_BKG_02 ผ่าน โดยการจองซ้ำถูกปฏิเสธและ response แสดงหมายเลขคิวเดิม
- สถานะ: พร้อมทำ

### T-09 เสนอช่วงเวลาใกล้เคียงเมื่อที่นั่งเต็ม
- รองรับ: FR-BKG-03
- ตรวจด้วย: AC-BKG-03
- ไฟล์ที่แตะ: `backend/app/slots/service.py`, `backend/app/booking/service.py`, `backend/app/booking/router.py`, `backend/tests/test_AC_BKG_03.py`
- ต้องทำหลัง: T-04, T-06
- เสร็จเมื่อ: test_AC_BKG_03 ผ่าน โดย response แจ้งช่วงเวลาเต็ม คืน 3 ช่วงที่ใกล้ที่สุดในวันเดียวกันหรือวันถัดไป และไม่สร้าง booking ซ้อน
- สถานะ: พร้อมทำ

### T-10 วางงานแจ้งเตือนและส่งซ้ำ
- รองรับ: FR-BKG-05, IF-NOT-01, NFR-REL-02
- ตรวจด้วย: AC-BKG-04
- ไฟล์ที่แตะ: `backend/app/notify/queue.py`, `backend/app/booking/service.py`, `backend/tests/test_AC_BKG_04.py`
- ต้องทำหลัง: T-06
- เสร็จเมื่อ: test_AC_BKG_04 ผ่าน โดย booking และหมายเลขคิวยังคงอยู่เมื่อการแจ้งเตือนล้มเหลว และมีงาน retry กำหนดภายใน 5 นาที
- สถานะ: พร้อมทำ

### T-11 บันทึก audit log ทุกการเข้าถึงข้อมูลการจอง
- รองรับ: DOM-PDPA-01
- ตรวจด้วย: AC-BKG-06
- ไฟล์ที่แตะ: `backend/app/audit/middleware.py`, `backend/app/main.py`, `backend/tests/test_AC_BKG_06.py`
- ต้องทำหลัง: T-01, T-02, T-03
- เสร็จเมื่อ: test_AC_BKG_06 ผ่าน โดย audit log มีผู้เข้าถึง เวลา และ HN และกำหนดการเก็บรักษาไม่น้อยกว่า 1 ปี
- สถานะ: พร้อมทำ

### T-12 ค้น HN จาก HIS โดยไม่เก็บเลขบัตรประชาชน
- รองรับ: IF-HIS-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-06 และ T-11
- ไฟล์ที่แตะ: `backend/app/his/client.py`, `backend/app/booking/router.py`, `backend/tests/test_his_lookup.py`
- ต้องทำหลัง: T-02, T-03
- เสร็จเมื่อ: `GET /patients/lookup` ส่งเลขบัตรไปยัง HIS ได้ คืน HN และไม่มีเลขบัตรประชาชนถูกบันทึกใน booking
- สถานะ: พร้อมทำ

### T-13 บังคับใช้ TLS 1.2 ขึ้นไป
- รองรับ: NFR-SEC-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของการเปิดใช้งานระบบ
- ไฟล์ที่แตะ: `backend/app/config.py`, `backend/app/main.py`, `backend/tests/test_tls_config.py`
- ต้องทำหลัง: T-02
- เสร็จเมื่อ: การตั้งค่าและการทดสอบยืนยันว่าช่องทางรับส่งข้อมูลของ API อนุญาต TLS ตั้งแต่เวอร์ชัน 1.2 ขึ้นไปเท่านั้น
- สถานะ: พร้อมทำ

### T-14 สร้างหน้าจอเลือกแพ็กเกจและช่วงเวลา
- รองรับ: FR-BKG-01, FR-BKG-06
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-17
- ไฟล์ที่แตะ: `frontend/src/pages/SlotPicker.jsx`, `frontend/src/App.jsx`, `frontend/src/api/client.js`, `frontend/src/__tests__/SlotPicker.test.jsx`
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: หน้าจอแสดงวัน ช่วงเวลา และที่นั่งคงเหลือจาก API จำลอง และโหลดข้อมูลใหม่เมื่อเปลี่ยนแพ็กเกจ
- สถานะ: พร้อมทำ

### T-15 สร้างหน้าจอยืนยันและแสดงตัวเลือกทดแทน
- รองรับ: FR-BKG-03, FR-BKG-04
- ตรวจด้วย: AC-BKG-03
- ไฟล์ที่แตะ: `frontend/src/pages/ConfirmBooking.jsx`, `frontend/src/App.jsx`, `frontend/src/api/client.js`, `frontend/src/__tests__/AC-BKG-03.test.jsx`
- ต้องทำหลัง: T-14
- เสร็จเมื่อ: AC-BKG-03.test.jsx ผ่าน โดย API จำลองตอบ 409 แล้วหน้าจอแจ้งช่วงเวลาเต็มและแสดงตัวเลือก 3 รายการ
- สถานะ: พร้อมทำ

### T-16 สร้างหน้าจอผลการจองและการแจ้งเตือนล้มเหลว
- รองรับ: FR-BKG-04, FR-BKG-05
- ตรวจด้วย: AC-BKG-04
- ไฟล์ที่แตะ: `frontend/src/pages/BookingResult.jsx`, `frontend/src/App.jsx`, `frontend/src/__tests__/BookingResult.test.jsx`
- ต้องทำหลัง: T-15
- เสร็จเมื่อ: หน้าจอผลการจองแสดงหมายเลขคิวและสถานะการส่งข้อความเมื่อ API จำลองแจ้งว่าส่งไม่สำเร็จ
- สถานะ: รอ Q-02

### T-17 ต่อหน้าจอกับ API จริง
- รองรับ: FR-BKG-01, FR-BKG-03, FR-BKG-04, FR-BKG-05
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานรวมของ T-04, T-09, T-10, T-14 ถึง T-16
- ไฟล์ที่แตะ: `frontend/src/api/client.js`, `frontend/src/App.jsx`, `frontend/src/pages/SlotPicker.jsx`, `frontend/src/pages/ConfirmBooking.jsx`, `frontend/src/pages/BookingResult.jsx`, `frontend/src/__tests__/api-integration.test.jsx`
- ต้องทำหลัง: T-04, T-09, T-10, T-14, T-15, T-16
- เสร็จเมื่อ: หน้าจอเรียก `/api` จริงได้ครบทั้งค้นช่วงเวลา ยืนยันการจอง แสดงตัวเลือกเมื่อเต็ม และแสดงผลการจอง
- สถานะ: รอ Q-02

### T-18 ทดสอบความสำเร็จของผู้ใช้ใหม่
- รองรับ: NFR-USE-01, ASM-05
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นการตรวจ NFR ด้วยผู้ทดสอบจริง
- ไฟล์ที่แตะ: `frontend/src/__tests__/NFR-USE-01.test.jsx`
- ต้องทำหลัง: T-17
- เสร็จเมื่อ: ผู้ใช้ใหม่ 10 คนทดสอบการจอง และอย่างน้อย 8 คนทำสำเร็จภายใน 3 นาทีโดยไม่ขอความช่วยเหลือ
- สถานะ: รอ Q-02

## ตารางตรวจความครบของ Acceptance Criteria

| AC ID | task ที่ตรวจ AC นี้ |
|---|---|
| AC-BKG-01 | T-07 |
| AC-BKG-02 | T-08 |
| AC-BKG-03 | T-09, T-15 |
| AC-BKG-04 | T-10, T-16 |
| AC-BKG-05 | T-05 |
| AC-BKG-06 | T-11 |

## ตารางตรวจความครบของ Constraints

| Constraint ID | task ที่ทำให้เป็นจริง |
|---|---|
| CON-TECH-01 | T-01, T-02 |
| DOM-PDPA-01 | T-01, T-11 |
| IF-IDP-01 | T-03 |
| IF-HIS-01 | T-01, T-12 |
| IF-NOT-01 | T-10 |

## สิ่งที่ยังไม่ทำ

- `Q-02` หมายเลขคิวรีเซ็ตรายวัน หรือนับต่อเนื่อง และมีรูปแบบอย่างไร เช่น `A001` ต้องถามเจ้าหน้าที่เวชระเบียน
- งานที่รอคำตอบ: T-07, T-16, T-17
- ยังไม่สร้างวิธีออกหมายเลขคิวและส่วนที่ต้องผูกกับรูปแบบหมายเลขคิว จนกว่าจะได้คำตอบของ `Q-02`
- ไม่สร้างงานสำหรับการยกเลิก/เลื่อนคิว การชำระค่าบริการ การจัดการตารางคิวและโควตา หรือการยืนยันตัวตน ตาม Out of scope ใน `spec.md`
