import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({ hasVoted: false })
    }
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { data, error } = await supabase
      .from('votes')
      .select('id')
      .eq('user_email', email)
      .maybeSingle()
    
    if (error) {
      console.error('Check vote error:', error)
      return NextResponse.json({ hasVoted: false })
    }
    
    return NextResponse.json({ hasVoted: !!data })
  } catch (error) {
    console.error('Check vote error:', error)
    return NextResponse.json({ hasVoted: false })
  }
}
