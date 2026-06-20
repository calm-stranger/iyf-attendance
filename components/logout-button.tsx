'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const router = useRouter()
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
      }}
    >
      Logout
    </Button>
  )
}