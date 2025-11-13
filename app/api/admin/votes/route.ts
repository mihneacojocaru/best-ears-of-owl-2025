import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Use service role key to bypass RLS
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
      return NextResponse.json([])
    }
    
    // Get all categories for the active challenge
    const { data: categories } = await supabase
      .from('categories')
      .select('id')
      .eq('challenge_id', activeChallenge.id)
    
    if (!categories || categories.length === 0) {
      return NextResponse.json([])
    }
    
    const categoryIds = categories.map(c => c.id)
    
    // Get votes only for the active challenge
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .in('best_category_id', categoryIds)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching votes:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch votes' },
      { status: 500 }
    )
  }
}
