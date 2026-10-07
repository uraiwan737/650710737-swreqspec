# RTM: จองคิวตรวจสุขภาพ (Booking)
อ้างอิง: spec.md SPEC-BKG-001 Draft v2 | tasks.md | test-cases.md
สร้างด้วย /verify เมื่อ 2569-10-07 08:31 | test: 7 ผ่าน 0 ไม่ผ่าน

## 1. ตามรอยไปข้างหน้า (requirement ไป โค้ด ไป test)
| ID | AC | task | โค้ด (ไฟล์: ฟังก์ชัน) | test (ผล) | สถานะ |
|---|---|---|---|---|---|
| FR-BKG-01 | AC-BKG-05 | T-02 | backend/app/slots/service.py: list_available_slots; backend/app/slots/router.py: get_slots | backend/tests/test_AC_BKG_05.py: passed | ช่องโหว่ |
| FR-BKG-02 | AC-BKG-02 | T-04 | ไม่มีโค้ดที่ป้องกันการจองซ้ำวันเดียวกันใน backend/app/booking/service.py | ไม่มี test | ยังไม่ถึง |
| FR-BKG-03 | AC-BKG-03 | T-05, T-11, T-12 | ไม่มีโค้ดที่แจ้ง "ช่วงเวลาเต็ม" และเสนอ 3 ตัวเลือกใกล้เคียง | ไม่มี test | ยังไม่ถึง |
| FR-BKG-04 | AC-BKG-01 | T-03, T-06 | backend/app/booking/service.py: create_booking; backend/app/booking/router.py: create_booking | backend/tests/test_AC_BKG_01.py: passed | ช่องโหว่ |
| FR-BKG-05 | AC-BKG-04 | T-07 | ไม่มีคิวส่งข้อความซ้ำ/ติดสถานะค้างส่ง | ไม่มี test | ยังไม่ถึง |
| FR-BKG-06 | AC-BKG-05 | T-02, T-10 | backend/app/slots/service.py: list_available_slots; backend/app/slots/router.py: get_slots | backend/tests/test_AC_BKG_05.py: passed | ช่องโหว่ |
| NFR-PERF-01 | AC-BKG-05 | T-02 | backend/app/slots/service.py: list_available_slots | backend/tests/test_AC_BKG_05.py: passed | ครบ |
| NFR-SEC-01 | ไม่มี AC | ไม่มี task | ไม่มีโค้ดหลังบ้าน/Infra สำหรับ TLS 1.2 ขึ้นไป | ไม่มี test | ยังไม่ถึง |
| NFR-REL-02 | AC-BKG-04 | T-07 | ไม่มีการส่งซ้ำภายใน 5 นาที | ไม่มี test | ยังไม่ถึง |
| NFR-USE-01 | ไม่มี AC | ไม่มี task | ไม่มีโค้ดหรือ test สำหรับผู้ใช้ใหม่ 8/10 คน | ไม่มี test | ยังไม่ถึง |
| CON-TECH-01 | ไม่มี AC | T-01 | backend/app/config.py: DATABASE_URL; backend/app/db/session.py: engine | backend/tests/test_T01_schema.py: passed | ครบ |
| DOM-PDPA-01 | AC-BKG-06 | T-08 | ไม่มี audit log middleware หรือบันทึกที่ระบุ actor_id, action, hn, accessed_at | ไม่มี test | ยังไม่ถึง |
| IF-IDP-01 | AC-BKG-01/AC-BKG-02/AC-BKG-03 ตามประเด็นยืนยันตัวตน | T-03 | backend/app/auth/idp.py: get_verified_hn; backend/app/booking/router.py: create_booking | backend/tests/test_AC_BKG_01.py: passed | ครบ |
| IF-HIS-01 | ไม่มี AC | T-01, T-09 | backend/app/db/models.py: Booking ไม่มี national_id; แต่ไม่มีการค้น HN จาก HIS หรือใช้เลขบัตรประชาชน | backend/tests/test_T01_schema.py: passed | ยังไม่ถึง |
| IF-NOT-01 | AC-BKG-04 | T-07 | ไม่มีโค้ดคิวส่งข้อความแบบ async และไม่มี retry queue | ไม่มี test | ยังไม่ถึง |

## 2. ตามรอยย้อนกลับ (โค้ด ไป requirement)
| โค้ด (ไฟล์: ฟังก์ชัน หรือ endpoint) | อ้าง ID | ตรงกับข้อความใน spec ไหม | หมายเหตุ |
|---|---|---|---|
| backend/app/slots/service.py: list_available_slots | FR-BKG-01, FR-BKG-06 | ไม่ครบ | ใช้ `DAYS_AHEAD = 14` แทน 30 วัน ตาม FR-BKG-01 และกรองแค่ `remaining > 0` แต่ไม่ตรวจว่าโมเดลช่วงเวลาสำหรับแพ็กเกจ/วันถัดไปถูกคำนวณครบตาม spec |
| backend/app/booking/service.py: create_booking | FR-BKG-02, FR-BKG-04 | ไม่ครบ | ตรวจ `remaining < 0` เท่านั้น ไม่ป้องกันกรณี `remaining == 0` จึงอนุญาตให้จองเกินที่นั่งได้ และไม่ตรวจคิวที่ยังไม่ได้ใช้ในวันเดียวกัน |
| backend/app/booking/service.py: next_queue_no | FR-BKG-04, Q-02 | ไม่ครบ | เลือกรูปแบบ `A001` และเริ่มนับใหม่ทุกวัน แม้ Q-02 ยังไม่ได้คำตอบจากเจ้าหน้าที่เวชระเบียน |
| backend/app/db/models.py: Booking | IF-HIS-01 | ครึ่งหนึ่ง | เก็บ `hn` เท่านั้น และไม่มีคอลัมน์ `national_id` ตาม requirement แต่ request model ที่ router ยังมี `national_id` เป็น field ใน API จึงเป็นการยีดเก็บข้อมูลที่ไม่จำเป็นและอาจให้สัญญาณว่าไม่จัดการข้อมูลที่ห้ามเก็บด้วยความระมัดระวัง |
| backend/app/config.py: DATABASE_URL | CON-TECH-01 | ครบ | ใช้ env `DATABASE_URL` สำหรับ PostgreSQL ในระบบจริง และ fallback SQLite สำหรับ dev/test ตามแผน |
| backend/app/auth/idp.py: get_verified_hn | IF-IDP-01 | ครบ | ตรวจ token prefix ของระบบยืนยันตัวตนและ 401 เมื่อยังไม่ได้ยืนยันตัวตน |
| backend/app/main.py: app | DOM-PDPA-01 | ไม่ครบ | ไม่มี middleware บันทึก audit log ทุกการเข้าถึงข้อมูลการจอง |

## 3. ข้อค้นพบ
ชนิด: AC ไม่มี test / test อ่อน / โค้ดไม่มี FR / FR ไม่มี AC / เดา Q-xx / ละเมิด Constraint / ตัวเลขไม่ตรง spec / อ้าง ID ผิดเรื่อง
ทีมตัดสิน: แก้โค้ด / แก้ spec / เพิ่ม Q-xx / ไม่ใช่ปัญหา (พร้อมเหตุผล 1 บรรทัด)

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-001 | เดา Q-xx | backend/app/booking/service.py: next_queue_no | Q-02, FR-BKG-04 | โค้ดตัดสินเองว่า queue_no เป็น `A001` และเริ่มนับใหม่ทุกวัน แม้ spec ระบุว่า Q-02 ยังไม่ได้คำตอบและให้ถามเจ้าหน้าที่เวชระเบียนก่อน | เพิ่ม Q-xx |
| F-002 | ตัวเลขไม่ตรง spec | backend/app/slots/service.py: list_available_slots | FR-BKG-01 | `DAYS_AHEAD = 14` จึงแสดงช่วงเวลาเฉพาะ 14 วันข้างหน้า ไม่ใช่ภายใน 30 วันข้างหน้า ตาม spec | แก้โค้ด |
| F-003 | โค้ดไม่มี FR / test อ่อน | backend/app/booking/service.py: create_booking | FR-BKG-02, FR-BKG-04 | ตรวจ `remaining < 0` เท่านั้น จึงยังอนุญาตให้จองเมื่อ `remaining == 0` และไม่ป้องกันจองซ้ำวันเดียวกันตาม FR-BKG-02; test ทั้งหมดยังไม่มีกรณีนี้ | แก้โค้ด |

## 4. แก้แล้ว
| F-ID | แก้อย่างไร | รู้ได้อย่างไร |
|---|---|---|
