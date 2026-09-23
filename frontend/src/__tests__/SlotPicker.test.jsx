import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import SlotPicker from '../pages/SlotPicker'

const standardSlots = [
  { id: 1, slot_date: '2026-09-24', start_time: '09:00', remaining: 2 },
]
const premiumSlots = [
  { id: 2, slot_date: '2026-09-25', start_time: '13:00', remaining: 1 },
]

describe('SlotPicker', () => {
  it('แสดงวัน ช่วงเวลา และที่นั่งคงเหลือจาก API จำลอง', async () => {
    const apiClient = { getSlots: vi.fn().mockResolvedValue({ slots: standardSlots }) }

    render(<SlotPicker apiClient={apiClient} />)

    expect(await screen.findByText(/2026-09-24 เวลา 09:00/)).toBeTruthy()
    expect(screen.getByText('ที่นั่งคงเหลือ 2')).toBeTruthy()
    expect(apiClient.getSlots).toHaveBeenCalledWith({
      dateFrom: expect.any(String),
      packageCode: 'STANDARD',
    })
  })

  it('โหลดช่วงเวลาใหม่เมื่อเปลี่ยนแพ็กเกจ', async () => {
    const apiClient = {
      getSlots: vi.fn(({ packageCode }) => Promise.resolve({
        slots: packageCode === 'PREMIUM' ? premiumSlots : standardSlots,
      })),
    }

    render(<SlotPicker apiClient={apiClient} />)
    await screen.findByText(/2026-09-24 เวลา 09:00/)

    fireEvent.change(screen.getByLabelText('แพ็กเกจ'), { target: { value: 'PREMIUM' } })

    await waitFor(() => expect(screen.getByText(/2026-09-25 เวลา 13:00/)).toBeTruthy())
    expect(screen.queryByText(/2026-09-24 เวลา 09:00/)).toBeNull()
    expect(apiClient.getSlots).toHaveBeenLastCalledWith({
      dateFrom: expect.any(String),
      packageCode: 'PREMIUM',
    })
  })
})
