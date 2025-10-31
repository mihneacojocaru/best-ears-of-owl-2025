import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET settings
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'results_public')
      .single()
    
    if (error) {
      console.error('Error fetching settings:', error)
      return NextResponse.json({ results_public: false })
    }
    
    return NextResponse.json({ results_public: data?.value || false })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ results_public: false })
  }
}

// POST (update) settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, value } = body
    
    if (key !== 'results_public') {
      return NextResponse.json(
        { error: 'Invalid key' },
        { status: 400 }
      )
    }
    
    // Use service role key to update settings
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { error } = await supabase
      .from('settings')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key)
    
    if (error) {
      console.error('Error updating settings:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update settings' },
      { status: 500 }
    )
  }
}
