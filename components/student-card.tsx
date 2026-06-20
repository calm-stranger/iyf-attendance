'use client'

import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateStudent, removeAttendance } from '@/app/actions'
import { compressImage } from '@/lib/compress-image'
import { toast } from 'sonner'
import { Pencil, Trash2, Camera } from 'lucide-react'

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

export function StudentCard({
  student,
  sessionId,
}: {
  student: Student
  sessionId?: string
}) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const age = calculateAge(student.dob)

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await compressImage(file)
    setPhotoBlob(compressed)
    setPreview(URL.createObjectURL(compressed))
  }

  async function handleUpdate(formData: FormData) {
    setSubmitting(true)
    formData.set('id', student.id)
    if (photoBlob) formData.set('photo', photoBlob, 'photo.jpg')
    try {
      await updateStudent(formData)
      toast.success('Details updated')
      setEditing(false)
      setOpen(false)
      setPreview(null)
      setPhotoBlob(null)
    } catch {
      toast.error('Something went wrong — please try again')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRemove() {
    if (!sessionId) return
    try {
      await removeAttendance(sessionId, student.id)
      toast.success(`${student.name} removed from today`)
      setOpen(false)
    } catch {
      toast.error('Something went wrong — please try again')
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex aspect-square w-full flex-col overflow-hidden rounded-xl border bg-background text-left"
      >
        <div className="h-[70%] w-full bg-muted">
          {student.photo_url ? (
            <img src={student.photo_url} alt={student.name} className="h-full w-full object-cover object-top" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">No photo</div>
          )}
        </div>
        <div className="flex h-[30%] w-full flex-col justify-center gap-0.5 p-2">
          <p className="text-sm font-medium leading-tight line-clamp-1">{student.name}</p>
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {student.occupation}{age !== null ? ` · ${age}y` : ''}
          </p>
        </div>
      </button>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditing(false) }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${student.name}` : student.name}</DialogTitle>
          </DialogHeader>

          {!editing ? (
            <div className="space-y-4">
              <div className="aspect-square w-full overflow-hidden rounded-lg bg-muted">
                {student.photo_url ? (
                  <img src={student.photo_url} alt={student.name} className="h-full w-full object-cover object-top" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">No photo</div>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Date of Birth</span>
                  <span className="text-right font-medium">
                    {student.dob
                      ? `${new Date(student.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}${age !== null ? ` (${age}y)` : ''}`
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
                      {new Date(student.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setEditing(true)}>
                  <Pencil className="mr-1.5 h-4 w-4" /> Edit Details
                </Button>
                {sessionId && (
                  <Button variant="outline" className="flex-1 text-red-600 hover:text-red-600" onClick={handleRemove}>
                    <Trash2 className="mr-1.5 h-4 w-4" /> Remove from Today
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <form ref={formRef} action={handleUpdate} className="space-y-4">
              <div className="flex flex-col items-center gap-2">
  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed bg-muted">
    {preview ? (
      <img src={preview} className="h-full w-full object-cover" />
    ) : student.photo_url ? (
      <img src={student.photo_url} className="h-full w-full object-cover object-top" />
    ) : (
      <Camera className="h-8 w-8 text-muted-foreground" />
    )}
  </div>
  <div className="flex gap-2">
    <label htmlFor={`edit-photo-camera-${student.id}`} className="cursor-pointer rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted">
      📷 Take Photo
    </label>
    <label htmlFor={`edit-photo-gallery-${student.id}`} className="cursor-pointer rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted">
      🖼 Gallery
    </label>
  </div>
  <input id={`edit-photo-camera-${student.id}`} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoSelect} />
  <input id={`edit-photo-gallery-${student.id}`} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
</div>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={student.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" name="dob" type="date" defaultValue={student.dob || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Short Address</Label>
                <Input id="address" name="address" defaultValue={student.address || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="occupation">What do they currently do?</Label>
                <Input id="occupation" name="occupation" defaultValue={student.occupation || ''} />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}