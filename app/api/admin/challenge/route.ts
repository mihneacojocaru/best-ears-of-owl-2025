import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET active challenge
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)
      .single()
    
    if (error) {
      console.error('Error fetching active challenge:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch active challenge' },
      { status: 500 }
    )
  }
}

// POST - Set active challenge
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { challenge_id } = body
    
    if (!challenge_id) {
      return NextResponse.json(
        { error: 'Missing challenge_id' },
        { status: 400 }
      )
    }
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Deactivate all challenges
    await supabase
      .from('challenges')
      .update({ is_active: false })
      .neq('id', 'dummy')
    
    // Activate the selected challenge
    const { error } = await supabase
      .from('challenges')
      .update({ is_active: true })
      .eq('id', challenge_id)
    
    if (error) {
      console.error('Error updating challenge:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update challenge' },
      { status: 500 }
    )
  }
}
