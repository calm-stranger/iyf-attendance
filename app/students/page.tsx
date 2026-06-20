import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Search, ArrowLeft } from 'lucide-react'
import { StudentCard } from '@/components/student-card'

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const params = await searchParams
  const q = params.q || ''

  const supabase = await createClient()

  let query = supabase
    .from('students')
    .select('id, name, dob, address, occupation, photo_url, created_at')
    .order('created_at', { ascending: false })

  if (q) {
    query = query.ilike('name', `%${q}%`)
  }

  const { data: students } = await query

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="flex items-center gap-3 border-b bg-background px-4 py-3">
        <Link href="/" className="rounded-md p-1.5 hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-semibold">All Students ({students?.length || 0})</h1>
      </header>

      <div className="px-4 py-3">
        <form method="GET" className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q}
            placeholder="Search by name..."
            className="pl-9"
          />
        </form>
      </div>

      <main className="grid grid-cols-2 gap-3 px-4 py-3 sm:grid-cols-3 md:grid-cols-4">
  {students?.map((s) => (
    <StudentCard key={s.id} student={s} />
  ))}
  {(!students || students.length === 0) && (
    <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
      No students found.
    </p>
  )}
</main>
    </div>
  )
}