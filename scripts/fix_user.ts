
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://maooqhfuotddouudwgad.supabase.co'
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hb29xaGZ1b3RkZG91dWR3Z2FkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzODUxNiwiZXhwIjoyMDg1MjE0NTE2fQ.IaVOieDUe2WLf77UlNjDL36tXgJzS97Gi0Aci9LuzBQ'

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function main() {
  const email = '18355415393@163.com'
  const password = 'password123'

  console.log(`Checking user ${email}...`)

  // List users to find if exists
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
  
  if (listError) {
    console.error('Error listing users:', listError)
    return
  }

  const existingUser = users.find(u => u.email === email)

  if (existingUser) {
    console.log('User exists. Auto-confirming email...')
    const { data, error } = await supabase.auth.admin.updateUserById(
      existingUser.id,
      { email_confirm: true }
    )
    if (error) {
      console.error('Error confirming user:', error)
    } else {
      console.log('User confirmed successfully!')
    }
  } else {
    console.log('User does not exist. Creating new confirmed user...')
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })
    
    if (error) {
      console.error('Error creating user:', error)
    } else {
      console.log('User created and confirmed successfully!')
      console.log(`Email: ${email}`)
      console.log(`Password: ${password}`)
    }
  }
}

main()
