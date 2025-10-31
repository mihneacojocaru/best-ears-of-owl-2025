import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Check if results are public
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const { data: settings } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'results_public')
      .single()
    
    if (!settings?.value) {
      return NextResponse.json(
        { error: 'Results are not public yet' },
        { status: 403 }
      )
    }
    
    // Use service role to get votes (without personal data)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { data, error } = await supabaseAdmin
      .from('votes')
      .select('id, user_name, best_category_id, nice_category_id, own_category_id, created_at')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching votes:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch results' },
      { status: 500 }
    )
  }
}
