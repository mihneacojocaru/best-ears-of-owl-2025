import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Category } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
    
    // Get challenge_id from query params (optional)
    const searchParams = request.nextUrl.searchParams
    const challengeId = searchParams.get('challenge_id')
    
    let query = supabase
      .from('categories')
      .select('*')
    
    // If challenge_id is provided, filter by it
    // Otherwise, get active challenge and filter by that
    if (challengeId) {
      query = query.eq('challenge_id', challengeId)
    } else {
      // Get active challenge
      const { data: activeChallenge } = await supabase
        .from('challenges')
        .select('id')
        .eq('is_active', true)
        .single()
      
      if (activeChallenge) {
        query = query.eq('challenge_id', activeChallenge.id)
      }
    }
    
    const { data, error } = await query.order('name', { ascending: true })
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data as Category[])
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
