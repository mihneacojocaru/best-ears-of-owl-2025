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
    
    // Get active challenge
    const { data: activeChallenge } = await supabase
      .from('challenges')
      .select('id')
      .eq('is_active', true)
      .single()
    
    if (!activeChallenge) {
      return NextResponse.json({ hasVoted: false })
    }
    
    // Get all categories for the active challenge
    const { data: categories } = await supabase
      .from('categories')
      .select('id')
      .eq('challenge_id', activeChallenge.id)
    
    if (!categories || categories.length === 0) {
      return NextResponse.json({ hasVoted: false })
    }
    
    const categoryIds = categories.map(c => c.id)
    
    // Check if user has voted for the active challenge
    const { data, error } = await supabase
      .from('votes')
      .select('id')
      .eq('user_email', email)
      .in('best_category_id', categoryIds)
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
