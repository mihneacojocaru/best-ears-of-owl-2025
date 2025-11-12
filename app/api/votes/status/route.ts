import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
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
      return NextResponse.json({ voters: [], total: 0 })
    }
    
    // Get all categories for the active challenge
    const { data: categories } = await supabase
      .from('categories')
      .select('id')
      .eq('challenge_id', activeChallenge.id)
    
    if (!categories || categories.length === 0) {
      return NextResponse.json({ voters: [], total: 0 })
    }
    
    const categoryIds = categories.map(c => c.id)
    
    // Get votes that belong to the active challenge (by checking if best_category_id is in our category list)
    const { data: votes, error } = await supabase
      .from('votes')
      .select('user_name, created_at, best_category_id')
      .in('best_category_id', categoryIds)
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('Error fetching votes:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Get unique voter names (in case someone voted multiple times, show only once)
    const uniqueVoters = Array.from(new Set(votes?.map(v => v.user_name) || []))
    
    return NextResponse.json({
      voters: uniqueVoters,
      total: uniqueVoters.length,
      challenge_id: activeChallenge.id
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch voting status' },
      { status: 500 }
    )
  }
}
