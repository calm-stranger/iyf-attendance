'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

type Student = {
  id: string
  name: string
  dob?: string | null
  address?: string | null
  occupation?: string | null
  photo_url?: string | null
  created_at?: string | null
}

function calculateAge(dob?: string | null) {
  if (!dob) return null
  const birth = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

export function StudentCard({ student }: { student: Student }) {
  const [open, setOpen] = useState(false)
  const age = calculateAge(student.dob)

  return (
    <>
      <button
  onClick={() => setOpen(true)}
  className="flex aspect-square w-full flex-col overflow-hidden rounded-xl border bg-background text-left"
>
  <div className="h-[70%] w-full bg-muted">
    {student.photo_url ? (
      <img
        src={student.photo_url}
        alt={student.name}
        className="h-full w-full object-cover"
      />
    ) : (
      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
        No photo
      </div>
    )}
  </div>
  <div className="flex h-[30%] w-full flex-col justify-center gap-0.5 p-2">
    <p className="text-sm font-medium leading-tight line-clamp-1">{student.name}</p>
    <p className="line-clamp-1 text-xs text-muted-foreground">
      {student.occupation}
      {age !== null ? ` · ${age}y` : ''}
    </p>
  </div>
</button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{student.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted">
              {student.photo_url ? (
                <img
                  src={student.photo_url}
                  alt={student.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  No photo
                </div>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Date of Birth</span>
                <span className="text-right font-medium">
                  {student.dob
                    ? `${new Date(student.dob).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}${age !== null ? ` (${age}y)` : ''}`
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Address</span>
                <span className="text-right font-medium">{student.address || '—'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-muted-foreground">Occupation</span>
                <span className="text-right font-medium">{student.occupation || '—'}</span>
              </div>
              {student.created_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">First Joined</span>
                  <span className="font-medium">
                    {new Date(student.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}