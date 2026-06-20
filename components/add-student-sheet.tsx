'use client'

import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { compressImage } from '@/lib/compress-image'
import { addStudentAndMarkPresent, markExistingStudentPresent, searchStudents } from '@/app/actions'
import { Plus, Camera, Search } from 'lucide-react'
import { toast } from 'sonner'

export function AddStudentSheet({ sessionId }: { sessionId: string }) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  const formRef = useRef<HTMLFormElement>(null)

  async function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await compressImage(file)
    setPhotoBlob(compressed)
    setPreview(URL.createObjectURL(compressed))
  }

  async function handleSubmit(formData: FormData) {
  setSubmitting(true)
  if (photoBlob) {
    formData.set('photo', photoBlob, 'photo.jpg')
  }
  formData.set('sessionId', sessionId)
  const name = formData.get('name') as string
  try {
    await addStudentAndMarkPresent(formData)
    formRef.current?.reset()
    setPreview(null)
    setPhotoBlob(null)
    setOpen(false)
    toast.success(`${name} added and marked present`)
  } catch (err) {
    toast.error('Something went wrong — please try again')
  } finally {
    setSubmitting(false)
  }
}

  async function handleSearch(value: string) {
    setQuery(value)
    if (value.trim().length < 2) {
      setResults([])
      return
    }
    setSearching(true)
    const data = await searchStudents(value)
    setResults(data)
    setSearching(false)
  }

  async function handleMarkPresent(studentId: string, studentName: string) {
  try {
    await markExistingStudentPresent(studentId, sessionId)
    setQuery('')
    setResults([])
    setOpen(false)
    toast.success(`${studentName} marked present`)
  } catch (err) {
    toast.error('Something went wrong — please try again')
  }
}

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
  className={buttonVariants({
    size: 'lg',
    className: 'fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg',
  })}
>
  <Plus className="h-6 w-6" />
</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark Present</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="new">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new">New Student</TabsTrigger>
            <TabsTrigger value="existing">Existing Student</TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="mt-4">
            <form ref={formRef} action={handleSubmit} className="space-y-4">
              <div className="flex flex-col items-center gap-2">
  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-dashed bg-muted">
    {preview ? (
      <img src={preview} alt="preview" className="h-full w-full object-cover" />
    ) : (
      <Camera className="h-8 w-8 text-muted-foreground" />
    )}
  </div>
  <div className="flex gap-2">
    <label htmlFor="photo-camera" className="cursor-pointer rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted">
      📷 Take Photo
    </label>
    <label htmlFor="photo-gallery" className="cursor-pointer rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted">
      🖼 Gallery
    </label>
  </div>
  <input id="photo-camera" type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoSelect} />
  <input id="photo-gallery" type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
</div>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" name="dob" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Short Address</Label>
                <Input id="address" name="address" placeholder="e.g. Zoo Road, Guwahati" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="occupation">What do they currently do?</Label>
                <Input id="occupation" name="occupation" placeholder="e.g. B.Tech student, Job at..." />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save & Mark Present'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="existing" className="mt-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="space-y-2">
              {searching && <p className="text-sm text-muted-foreground">Searching...</p>}
              {results.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleMarkPresent(s.id, s.name)}
                  className="flex w-full items-center gap-3 rounded-lg border p-2 text-left hover:bg-muted"
                >
                  {s.photo_url ? (
                    <img src={s.photo_url} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-muted" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.occupation}</p>
                  </div>
                </button>
              ))}
              {query.length >= 2 && !searching && results.length === 0 && (
                <p className="text-sm text-muted-foreground">No matches — try the &quot;New Student&quot; tab.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}