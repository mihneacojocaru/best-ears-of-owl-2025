'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Category, Challenge } from '@/lib/types'

export default function VotePage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [user, setUser] = useState<any>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  // Form state
  const [userName, setUserName] = useState('')
  const [bestCategory, setBestCategory] = useState('')
  const [niceCategory, setNiceCategory] = useState('')
  const [ownCategory, setOwnCategory] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    await Promise.all([checkUser(), fetchCategories()])
    setLoading(false)
  }

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }
    setUser(user)
    
    // Check if user has already voted
    const response = await fetch(`/api/vote/check?email=${user.email}`)
    const data = await response.json()
    if (data.hasVoted) {
      setSuccess(true)
      setError('Du hast bereits abgestimmt!')
    }
  }

  async function fetchCategories() {
    try {
      // Fetch active challenge
      const challengeRes = await fetch('/api/admin/challenge')
      const challengeData = await challengeRes.json()
      setActiveChallenge(challengeData)
      
      // Fetch categories (filtered by active challenge)
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    
    // Validation
    if (!userName.trim()) {
      setError('Bitte gib deinen Namen ein')
      return
    }
    
    if (!bestCategory || !niceCategory || !ownCategory) {
      setError('Bitte wähle alle drei Optionen aus')
      return
    }
    
    if (bestCategory === niceCategory || bestCategory === ownCategory || niceCategory === ownCategory) {
      setError('Bitte wähle drei verschiedene Kategorien')
      return
    }
    
    if (!user?.email) {
      setError('Nicht angemeldet')
      return
    }

    setSubmitting(true)
    
    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user.email,
          userName: userName.trim(),
          bestCategoryId: bestCategory,
          niceCategoryId: niceCategory,
          ownCategoryId: ownCategory,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Abstimmen')
      }
      
      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
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

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-primary mb-4">
            Vielen Dank!
          </h1>
          <p className="text-gray-600 mb-6">
            Deine Stimme wurde erfolgreich abgegeben.
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
      <div className="max-w-2xl mx-auto">
        <div className="card">
          {activeChallenge && (
            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-blue-600">
                  {activeChallenge.id}
                </span>
                <div>
                  <h2 className="text-lg font-bold text-blue-900">
                    {activeChallenge.title}
                  </h2>
                </div>
              </div>
            </div>
          )}
          
          <h1 className="text-3xl font-bold text-primary mb-2">
            🎵 BEST EARS OF OWL 2025
          </h1>
          <p className="text-gray-600 mb-8">
            Wähle deine Favoriten aus den Kategorien
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Name Input */}
            <div>
              <label className="block text-lg font-semibold text-primary mb-3">
                Dein Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Max Mustermann"
                required
              />
            </div>

            {/* Best Song */}
            <div>
              <label className="block text-lg font-semibold text-primary mb-3">
                1. Welchen Song findest du am besten?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {categories.map((category) => (
                  <label
                    key={category.id}
                    className="flex items-center p-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name="best"
                      value={category.id}
                      checked={bestCategory === category.id}
                      onChange={(e) => setBestCategory(e.target.value)}
                      className="w-4 h-4 text-primary focus:ring-primary"
                      required
                    />
                    <span className="ml-2 text-base font-medium">
                      {category.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Nice Song */}
            <div>
              <label className="block text-lg font-semibold text-primary mb-3">
                2. Der war auch nice?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {categories.map((category) => (
                  <label
                    key={category.id}
                    className="flex items-center p-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name="nice"
                      value={category.id}
                      checked={niceCategory === category.id}
                      onChange={(e) => setNiceCategory(e.target.value)}
                      className="w-4 h-4 text-primary focus:ring-primary"
                      required
                    />
                    <span className="ml-2 text-base font-medium">
                      {category.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Own Song */}
            <div>
              <label className="block text-lg font-semibold text-primary mb-3">
                3. Welchen Song hast du selbst eingereicht?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {categories.map((category) => (
                  <label
                    key={category.id}
                    className="flex items-center p-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name="own"
                      value={category.id}
                      checked={ownCategory === category.id}
                      onChange={(e) => setOwnCategory(e.target.value)}
                      className="w-4 h-4 text-primary focus:ring-primary"
                      required
                    />
                    <span className="ml-2 text-base font-medium">
                      {category.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full text-lg py-4"
            >
              {submitting ? 'Wird abgeschickt...' : 'Abstimmen →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
