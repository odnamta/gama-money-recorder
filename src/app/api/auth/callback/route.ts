import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { ALLOWED_ROLES } from '@/types/supabase'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    
    // Exchange code for session
    const { error: authError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }

    // Get user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.redirect(`${origin}/login?error=no_user`)
    }

    // Check if email is from allowed domain
    if (!user.email?.endsWith('@gama-group.co')) {
      await supabase.auth.signOut()
      return NextResponse.redirect(`${origin}/login?error=invalid_domain`)
    }

    // Check user role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !ALLOWED_ROLES.includes(profile.role as typeof ALLOWED_ROLES[number])) {
      return NextResponse.redirect(`${origin}/access-denied`)
    }

    return NextResponse.redirect(`${origin}${next}`)
  }

  // No code, redirect to login
  return NextResponse.redirect(`${origin}/login?error=no_code`)
}
