import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { RankingResult } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const categoryId = searchParams.get('category')
    const adminEmail = process.env.ADMIN_EMAIL
    
    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      )
    }
    
    // Use service role key to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Verify admin access (check if request is from admin)
    // In production, you'd want to verify the user's session
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      )
    }
    
    // Get all votes for this category
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('best_song_id, nice_song_id')
      .eq('category_id', categoryId)
    
    if (votesError) {
      return NextResponse.json({ error: votesError.message }, { status: 500 })
    }
    
    // Get all submissions for this category
    const { data: submissions, error: submissionsError } = await supabase
      .from('submissions')
      .select('*')
      .eq('category_id', categoryId)
    
    if (submissionsError) {
      return NextResponse.json({ error: submissionsError.message }, { status: 500 })
    }
    
    // Calculate points for each submission
    const pointsMap = new Map<string, { best: number; nice: number }>()
    
    submissions?.forEach(sub => {
      pointsMap.set(sub.id, { best: 0, nice: 0 })
    })
    
    votes?.forEach(vote => {
      const bestEntry = pointsMap.get(vote.best_song_id)
      if (bestEntry) {
        bestEntry.best += 1
      }
      
      const niceEntry = pointsMap.get(vote.nice_song_id)
      if (niceEntry) {
        niceEntry.nice += 1
      }
    })
    
    // Create ranking results
    const results: RankingResult[] = submissions?.map(sub => {
      const points = pointsMap.get(sub.id) || { best: 0, nice: 0 }
      return {
        submission_id: sub.id,
        song_name: sub.song_name,
        song_link: sub.song_link,
        user_email: sub.user_email,
        points: points.best * 2 + points.nice * 1,
        best_votes: points.best,
        nice_votes: points.nice,
      }
    }) || []
    
    // Sort by points descending
    results.sort((a, b) => b.points - a.points)
    
    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    )
  }
}
