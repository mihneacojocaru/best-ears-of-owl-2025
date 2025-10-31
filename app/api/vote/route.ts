import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { VoteRequest } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body: VoteRequest = await request.json()
    const { userEmail, userName, bestCategoryId, niceCategoryId, ownCategoryId } = body
    
    // Validate input
    if (!userEmail || !userName || !bestCategoryId || !niceCategoryId || !ownCategoryId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Check if all three categories are different
    if (bestCategoryId === niceCategoryId || bestCategoryId === ownCategoryId || niceCategoryId === ownCategoryId) {
      return NextResponse.json(
        { error: 'You must select three different categories' },
        { status: 400 }
      )
    }
    
    // Use service role key to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Check if user has already voted
    const { data: existingVote } = await supabase
      .from('votes')
      .select('id')
      .eq('user_email', userEmail)
      .single()
    
    if (existingVote) {
      return NextResponse.json(
        { error: 'You have already voted' },
        { status: 400 }
      )
    }
    
    // Insert vote
    const { error: insertError } = await supabase
      .from('votes')
      .insert({
        user_email: userEmail,
        user_name: userName,
        best_category_id: bestCategoryId,
        nice_category_id: niceCategoryId,
        own_category_id: ownCategoryId,
      })
    
    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Vote error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit vote' },
      { status: 500 }
    )
  }
}

// Check if user has voted
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({ hasVoted: false })
    }
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    const { data } = await supabase
      .from('votes')
      .select('id')
      .eq('user_email', email)
      .single()
    
    return NextResponse.json({ hasVoted: !!data })
  } catch (error) {
    return NextResponse.json({ hasVoted: false })
  }
}
