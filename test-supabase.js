// Test Supabase Connection
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

console.log('🔍 Testing Supabase Connection...\n')

// Check environment variables
console.log('Environment Variables:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing')
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing')
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing')
console.log('')

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ Missing required environment variables!')
  process.exit(1)
}

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Test connection by fetching categories
async function testConnection() {
  try {
    console.log('📡 Fetching categories from Supabase...')
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) {
      console.error('❌ Supabase Error:', error.message)
      console.error('Details:', error)
      process.exit(1)
    }
    
    console.log('✅ Connection successful!')
    console.log(`📊 Found ${data.length} categories:`)
    data.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.id})`)
    })
    
    process.exit(0)
  } catch (err) {
    console.error('❌ Unexpected error:', err.message)
    process.exit(1)
  }
}

testConnection()
