'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Category, Vote, Challenge } from '@/lib/types'

interface VoteWithCategories extends Vote {
  best_category_name?: string
  nice_category_name?: string
  own_category_name?: string
}

interface CategoryResult {
  category_id: string
  category_name: string
  best_votes: number
  nice_votes: number
  total_points: number
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [votes, setVotes] = useState<VoteWithCategories[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [results, setResults] = useState<CategoryResult[]>([])
  const [loading, setLoading] = useState(true)
  const [resultsPublic, setResultsPublic] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null)
  const [switchingChallenge, setSwitchingChallenge] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    // Check if user is admin
    if (user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL && user.email !== 'mihnea.co@gmail.com') {
      router.push('/')
      return
    }
    
    setUser(user)
    await fetchData()
  }

  async function fetchData() {
    setLoading(true)
    try {
      // Fetch all challenges
      const challengesRes = await fetch('/api/challenges')
      const challengesData = await challengesRes.json()
      setChallenges(Array.isArray(challengesData) ? challengesData : [])
      
      // Find active challenge
      const active = challengesData.find((c: Challenge) => c.is_active)
      setActiveChallenge(active || null)
      
      // Fetch categories (filtered by active challenge)
      const categoriesRes = await fetch('/api/categories')
      const categoriesData = await categoriesRes.json()
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
      
      // Fetch settings
      const settingsRes = await fetch('/api/admin/settings')
      const settingsData = await settingsRes.json()
      setResultsPublic(settingsData.results_public || false)
      
      // Fetch all votes
      const votesRes = await fetch('/api/admin/votes')
      const votesData = await votesRes.json()
      
      if (Array.isArray(votesData) && Array.isArray(categoriesData)) {
        // Enrich votes with category names
        const enrichedVotes = votesData.map((vote: Vote) => ({
          ...vote,
          best_category_name: categoriesData.find((c: Category) => c.id === vote.best_category_id)?.name,
          nice_category_name: categoriesData.find((c: Category) => c.id === vote.nice_category_id)?.name,
          own_category_name: categoriesData.find((c: Category) => c.id === vote.own_category_id)?.name,
        }))
        setVotes(enrichedVotes)
        
        // Calculate results
        calculateResults(votesData, categoriesData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function toggleResultsPublic() {
    setUpdating(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'results_public',
          value: !resultsPublic,
        }),
      })
      
      if (response.ok) {
        setResultsPublic(!resultsPublic)
      }
    } catch (error) {
      console.error('Error updating settings:', error)
    } finally {
      setUpdating(false)
    }
  }

  async function switchToChallenge(challengeId: string) {
    if (!confirm('Challenge wechseln? Alle User sehen dann die neue Challenge.')) {
      return
    }
    
    setSwitchingChallenge(true)
    try {
      const response = await fetch('/api/admin/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challenge_id: challengeId }),
      })
      
      if (response.ok) {
        // Reload data
        await fetchData()
      }
    } catch (error) {
      console.error('Error switching challenge:', error)
    } finally {
      setSwitchingChallenge(false)
    }
  }

  function calculateResults(votesData: Vote[], categoriesData: Category[]) {
    const resultsMap = new Map<string, CategoryResult>()
    
    // Initialize all categories
    categoriesData.forEach((cat: Category) => {
      resultsMap.set(cat.id, {
        category_id: cat.id,
        category_name: cat.name,
        best_votes: 0,
        nice_votes: 0,
        total_points: 0,
      })
    })
    
    // Count votes
    votesData.forEach((vote: Vote) => {
      // Best song: 1 point (for ranking)
      const bestResult = resultsMap.get(vote.best_category_id)
      if (bestResult) {
        bestResult.best_votes++
        bestResult.total_points += 1
      }
      
      // Nice song: 1 point (shown in table, not in ranking)
      const niceResult = resultsMap.get(vote.nice_category_id)
      if (niceResult) {
        niceResult.nice_votes++
        // Nice votes don't count for ranking
      }
    })
    
    // Sort by BEST votes only (not total points)
    const sortedResults = Array.from(resultsMap.values())
      .sort((a, b) => b.best_votes - a.best_votes)
    
    setResults(sortedResults)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Lädt...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Challenge Switcher */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-primary mb-4">
            🎯 Challenge Management
          </h2>
          
          {activeChallenge && (
            <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-500 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl font-bold text-blue-600">
                  {activeChallenge.id}
                </span>
                <div>
                  <h3 className="text-xl font-bold text-blue-900">
                    Aktive Challenge
                  </h3>
                  <p className="text-blue-700">
                    {activeChallenge.title}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {challenges.map((challenge) => (
              <button
                key={challenge.id}
                onClick={() => switchToChallenge(challenge.id)}
                disabled={challenge.is_active || switchingChallenge}
                className={`p-4 rounded-lg border-2 transition-all ${
                  challenge.is_active
                    ? 'bg-blue-500 text-white border-blue-600 cursor-default'
                    : 'bg-white border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                } ${switchingChallenge ? 'opacity-50' : ''}`}
              >
                <div className="text-2xl font-bold mb-1">{challenge.id}</div>
                <div className="text-xs line-clamp-2">
                  {challenge.title}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="card mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">
                📊 Ergebnisse
              </h1>
              <p className="text-gray-600">
                Challenge {activeChallenge?.id}: {votes.length} Stimmen
              </p>
            </div>
            
            <div className="text-right">
              <label className="flex items-center gap-3 cursor-pointer">
                <span className="text-sm font-medium text-gray-700">
                  Ergebnisse öffentlich:
                </span>
                <button
                  onClick={toggleResultsPublic}
                  disabled={updating}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    resultsPublic ? 'bg-green-500' : 'bg-gray-300'
                  } ${updating ? 'opacity-50' : ''}`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      resultsPublic ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-sm font-bold ${resultsPublic ? 'text-green-600' : 'text-gray-500'}`}>
                  {resultsPublic ? 'AN' : 'AUS'}
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-2">
                {resultsPublic ? '✅ Alle können die Ergebnisse sehen' : '🔒 Nur du siehst die Ergebnisse'}
              </p>
            </div>
          </div>
        </div>

        {/* Results / Ranking */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-primary mb-6">
            🏆 Ranking
          </h2>
          
          {/* Podium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {results.slice(0, 3).map((result, index) => (
              <div
                key={result.category_id}
                className={`p-6 rounded-lg text-center ${
                  index === 0 ? 'bg-yellow-100 border-2 border-yellow-500' :
                  index === 1 ? 'bg-gray-100 border-2 border-gray-400' :
                  'bg-orange-100 border-2 border-orange-400'
                }`}
              >
                <div className="text-4xl mb-2">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  {result.category_name}
                </h3>
                <p className="text-3xl font-bold text-primary mb-2">
                  {result.best_votes} Stimmen
                </p>
                <p className="text-sm text-gray-600">
                  🏆 Basierend auf "Bester Song" Votes
                </p>
              </div>
            ))}
          </div>

          {/* Full Ranking Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left p-3">Platz</th>
                  <th className="text-left p-3">Kategorie</th>
                  <th className="text-right p-3">Best Votes</th>
                  <th className="text-right p-3">Nice Votes</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={result.category_id} className="border-b border-gray-200">
                    <td className="p-3 font-bold">{index + 1}.</td>
                    <td className="p-3 font-semibold">{result.category_name}</td>
                    <td className="p-3 text-right font-bold text-primary">{result.best_votes}</td>
                    <td className="p-3 text-right">{result.nice_votes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* All Votes */}
        <div className="card">
          <h2 className="text-2xl font-bold text-primary mb-6">
            📊 Alle Stimmen
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">E-Mail</th>
                  <th className="text-left p-3">Bester Song</th>
                  <th className="text-left p-3">Nice Song</th>
                  <th className="text-left p-3">Eigener Song</th>
                  <th className="text-left p-3">Datum</th>
                </tr>
              </thead>
              <tbody>
                {votes.map((vote) => (
                  <tr key={vote.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-3 font-medium">{vote.user_name}</td>
                    <td className="p-3 text-sm text-gray-600">{vote.user_email}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-semibold">
                        {vote.best_category_name}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-semibold">
                        {vote.nice_category_name}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded font-semibold">
                        {vote.own_category_name}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {new Date(vote.created_at).toLocaleDateString('de-DE')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/')}
            className="btn-secondary"
          >
            ← Zurück zur Startseite
          </button>
        </div>
      </div>
    </div>
  )
}
