import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.SUPABASE_URL ?? 'https://maooqhfuotddouudwgad.supabase.co'
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hb29xaGZ1b3RkZG91dWR3Z2FkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzODUxNiwiZXhwIjoyMDg1MjE0NTE2fQ.IaVOieDUe2WLf77UlNjDL36tXgJzS97Gi0Aci9LuzBQ'

function fail(message: string): never {
  console.error(message)
  process.exit(1)
}

function getArgValue(flag: string): string | undefined {
  const index = process.argv.indexOf(flag)
  return index >= 0 ? process.argv[index + 1] : undefined
}

async function main() {
  const userId = getArgValue('--user-id')
  const email = getArgValue('--email')
  const username = getArgValue('--username')
  const temporaryPassword = getArgValue('--password')

  if (!userId || !email || !temporaryPassword) {
    fail(
      'Usage: npm run admin:reset:user -- --user-id <uuid> --email <email> --password <temporary-password> [--username <username>]'
    )
  }

  if (temporaryPassword.length < 8) {
    fail('Temporary password must be at least 8 characters long.')
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, username')
    .eq('id', userId)
    .maybeSingle()

  if (profileError) {
    fail(`Failed to read profile: ${profileError.message}`)
  }

  if (!profile) {
    fail(`Profile ${userId} was not found in profiles.`)
  }

  if (username && profile.username !== username) {
    fail(
      `Profile mismatch. Expected username "${username}", got "${profile.username ?? 'null'}".`
    )
  }

  const { data: authUser, error: authUserError } = await supabase.auth.admin.getUserById(userId)

  if (authUserError) {
    fail(`Failed to read auth user: ${authUserError.message}`)
  }

  if (!authUser.user) {
    fail(`Auth user ${userId} was not found.`)
  }

  const currentEmail = authUser.user.email?.toLowerCase()
  if (currentEmail !== email.toLowerCase()) {
    fail(`Auth email mismatch. Expected "${email}", got "${authUser.user.email ?? 'null'}".`)
  }

  const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
    password: temporaryPassword,
  })

  if (updateError) {
    fail(`Failed to reset password: ${updateError.message}`)
  }

  console.log('Password reset succeeded for exactly one user.')
  console.log(`User ID: ${userId}`)
  console.log(`Email: ${email}`)
  console.log(`Username: ${profile.username ?? 'N/A'}`)
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  fail(`Unexpected error: ${message}`)
})
