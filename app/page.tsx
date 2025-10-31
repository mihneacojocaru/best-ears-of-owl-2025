'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Category } from '@/lib/types'

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
    fetchCategories()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  async function fetchCategories() {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-primary">Lädt...</div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary mb-4">
            🎵 BEST EARS OF OWL 2025
          </h1>
          <p className="text-xl text-gray-600">
            Wähle eine Kategorie und stimme für deinen Lieblingssong ab
          </p>
        </div>

        {user && (
          <div className="mb-8 text-center">
            <p className="text-gray-700 mb-2">
              Angemeldet als: <span className="font-semibold">{user.email}</span>
            </p>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-500 hover:text-primary underline"
            >
              Abmelden
            </button>
          </div>
        )}

        {!user && (
          <div className="card mb-8 text-center">
            <p className="text-gray-700 mb-4">
              Du musst angemeldet sein, um abzustimmen.
            </p>
            <button
              onClick={() => router.push('/auth/login')}
              className="btn-primary"
            >
              Anmelden
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => router.push('/vote')}
            className="btn-primary text-xl px-12 py-6"
          >
            Jetzt abstimmen →
          </button>
          <button
            onClick={() => router.push('/results')}
            className="btn-secondary text-xl px-12 py-6"
          >
            🏆 Ergebnisse ansehen
          </button>
        </div>

        {user?.email === 'mihnea.co@gmail.com' && (
          <div className="mt-12 text-center">
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="btn-secondary text-sm"
            >
              Admin Dashboard
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
