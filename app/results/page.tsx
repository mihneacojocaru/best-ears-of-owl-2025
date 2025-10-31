'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Category, Vote } from '@/lib/types'

interface CategoryResult {
  category_id: string
  category_name: string
  best_votes: number
  nice_votes: number
  total_points: number
  submitted_by: string[]
}

export default function ResultsPage() {
  const [results, setResults] = useState<CategoryResult[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [totalVotes, setTotalVotes] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isPublic, setIsPublic] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkIfPublic()
  }, [])

  async function checkIfPublic() {
    try {
      // Check if results are public
      const settingsRes = await fetch('/api/admin/settings')
      const settingsData = await settingsRes.json()
      
      if (!settingsData.results_public) {
        setIsPublic(false)
        setLoading(false)
        return
      }
      
      setIsPublic(true)
      await fetchResults()
    } catch (error) {
      console.error('Error:', error)
      setLoading(false)
    }
  }

  async function fetchResults() {
    try {
      // Fetch categories
      const categoriesRes = await fetch('/api/categories')
      const categoriesData = await categoriesRes.json()
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
      
      // Fetch all votes (public endpoint)
      const votesRes = await fetch('/api/results/public')
      const votesData = await votesRes.json()
      
      if (Array.isArray(votesData) && Array.isArray(categoriesData)) {
        setTotalVotes(votesData.length)
        calculateResults(votesData, categoriesData)
      }
    } catch (error) {
      console.error('Error fetching results:', error)
    } finally {
      setLoading(false)
    }
  }

  function calculateResults(votesData: any[], categoriesData: Category[]) {
    const resultsMap = new Map<string, CategoryResult>()
    
    // Initialize all categories
    categoriesData.forEach((cat: Category) => {
      resultsMap.set(cat.id, {
        category_id: cat.id,
        category_name: cat.name,
        best_votes: 0,
        nice_votes: 0,
        total_points: 0,
        submitted_by: [],
      })
    })
    
    // Count votes
    votesData.forEach((vote: any) => {
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
      
      // Track who submitted this song (only first person)
      if (vote.user_name && vote.own_category_id) {
        const ownResult = resultsMap.get(vote.own_category_id)
        if (ownResult && ownResult.submitted_by.length === 0) {
          ownResult.submitted_by.push(vote.user_name)
        }
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

  if (!isPublic) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-3xl font-bold text-primary mb-4">
            Ergebnisse noch nicht verfügbar
          </h1>
          <p className="text-gray-600 mb-6">
            Die Abstimmungsergebnisse sind noch nicht öffentlich. Bitte warte, bis der Admin sie freigibt.
          </p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Zurück zur Startseite
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="card mb-8 text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">
            🏆 Abstimmungsergebnisse
          </h1>
          <p className="text-gray-600">
            Basierend auf {totalVotes} Stimmen
          </p>
        </div>

        {/* Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {results.slice(0, 3).map((result, index) => (
            <div
              key={result.category_id}
              className={`card text-center transform transition-transform hover:scale-105 ${
                index === 0 ? 'md:order-2' : 
                index === 1 ? 'md:order-1' : 
                'md:order-3'
              }`}
            >
              <div className={`text-6xl mb-4 ${
                index === 0 ? 'animate-bounce' : ''
              }`}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
              </div>
              <div className={`text-xl font-bold mb-2 ${
                index === 0 ? 'text-yellow-600' :
                index === 1 ? 'text-gray-600' :
                'text-orange-600'
              }`}>
                {index === 0 ? '1. Platz' : index === 1 ? '2. Platz' : '3. Platz'}
              </div>
              <h3 className="text-3xl font-bold text-primary mb-3">
                {result.category_name}
              </h3>
              <p className="text-4xl font-bold text-primary mb-3">
                {result.best_votes} Stimmen
              </p>
              <div className="text-sm text-gray-600">
                <p>🏆 Basierend auf "Bester Song" Votes</p>
              </div>
            </div>
          ))}
        </div>

        {/* Full Ranking */}
        <div className="card">
          <h2 className="text-2xl font-bold text-primary mb-6">
            📊 Vollständige Rangliste
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left p-4">Platz</th>
                  <th className="text-left p-4">Kategorie</th>
                  <th className="text-left p-4">Eingereicht von</th>
                  <th className="text-right p-4">Best Votes</th>
                  <th className="text-right p-4">Nice Votes</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr 
                    key={result.category_id} 
                    className={`border-b border-gray-200 ${
                      index < 3 ? 'bg-yellow-50' : ''
                    }`}
                  >
                    <td className="p-4">
                      <span className="text-2xl font-bold">
                        {index + 1}.
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-xl font-bold text-primary">
                        {result.category_name}
                      </span>
                    </td>
                    <td className="p-4">
                      {result.submitted_by.length > 0 ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                          {result.submitted_by[0]}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Niemand</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-2xl font-bold text-primary">
                        {result.best_votes}
                      </span>
                    </td>
                    <td className="p-4 text-right text-lg">
                      {result.nice_votes}
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
