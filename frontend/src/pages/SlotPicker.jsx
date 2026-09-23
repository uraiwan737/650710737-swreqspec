import { useEffect, useState } from 'react'

import { api as defaultApi } from '../api/client'

const today = new Date().toISOString().slice(0, 10)

// รองรับ FR-BKG-01 และ FR-BKG-06 ด้วยการเลือกช่วงเวลาตามแพ็กเกจ
export default function SlotPicker({ apiClient = defaultApi }) {
  const [packageCode, setPackageCode] = useState('STANDARD')
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadSlots() {
      setLoading(true)
      setError('')
      try {
        const response = await apiClient.getSlots({ dateFrom: today, packageCode })
        if (active) setSlots(response.slots ?? response)
      } catch {
        if (active) setError('ไม่สามารถโหลดช่วงเวลาว่างได้')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadSlots()
    return () => {
      active = false
    }
  }, [apiClient, packageCode])

  // รองรับ FR-BKG-01 และ FR-BKG-06 ด้วยการแสดงช่วงเวลาและโหลดใหม่ตามแพ็กเกจ
  function renderSlot(slot) {
    return (
      <li key={slot.id} className="flex items-center justify-between border-b border-slate-200 py-3 last:border-b-0">
        <div>
          <p className="font-medium text-slate-900">{slot.slot_date} เวลา {slot.start_time}</p>
          <p className="text-sm text-slate-600">ที่นั่งคงเหลือ {slot.remaining}</p>
        </div>
        <button
          type="button"
          disabled={slot.remaining === 0}
          className="rounded-md bg-teal-700 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          เลือกเวลา
        </button>
      </li>
    )
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Booking</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">เลือกแพ็กเกจและช่วงเวลาตรวจ</h1>
      </header>

      <label className="block text-sm font-semibold text-slate-700" htmlFor="package-code">
        แพ็กเกจ
        <select
          id="package-code"
          value={packageCode}
          onChange={(event) => setPackageCode(event.target.value)}
          className="mt-2 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-normal text-slate-900"
        >
          <option value="STANDARD">ตรวจมาตรฐาน</option>
          <option value="PREMIUM">ตรวจพรีเมียม</option>
        </select>
      </label>

      <section aria-labelledby="available-slots-heading" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 id="available-slots-heading" className="text-lg font-semibold text-slate-900">ช่วงเวลาว่างภายใน 30 วัน</h2>
        {loading && <p className="mt-4 text-slate-600">กำลังโหลดช่วงเวลา...</p>}
        {error && <p className="mt-4 text-red-700" role="alert">{error}</p>}
        {!loading && !error && slots.length === 0 && <p className="mt-4 text-slate-600">ไม่พบช่วงเวลาว่าง</p>}
        {!loading && !error && slots.length > 0 && <ul className="mt-3">{slots.map(renderSlot)}</ul>}
      </section>
    </main>
  )
}
