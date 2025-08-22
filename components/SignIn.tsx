import * as React from 'react'
import { Fragment } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Checkbox } from './ui/checkbox'
import { cn } from './ui/utils'

// Simple placeholder brand icon
function BrandMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="currentColor" d="M12 3l9 6v12H3V9l9-6zm0 2.3L5 10v9h14v-9l-7-4.7z" />
    </svg>
  )
}

// Simple brand buttons (inline SVGs to avoid extra deps)
function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.7 3.8-5.5 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.1 14.7 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.8 0 9.7-4.1 9.7-9.8 0-.7-.1-1.2-.2-1.8H12z"/>
      <path fill="#34A853" d="M3.9 7.4l3.2 2.3C8 7.8 9.9 6.6 12 6.6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.1 14.7 2 12 2 8.7 2 5.8 3.5 3.9 7.4z" opacity=".001"/>
    </svg>
  )
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="#1877F2" d="M22 12a10 10 0 10-11.6 9.9v-7H7.7V12h2.7V9.7c0-2.7 1.6-4.2 4.1-4.2 1.2 0 2.5.2 2.5.2v2.7h-1.4c-1.4 0-1.9.9-1.9 1.8V12h3.2l-.5 2.9h-2.7v7A10 10 0 0022 12z"/>
    </svg>
  )
}

export function SignIn({ className, forceRegisterMode }: { className?: string; forceRegisterMode?: boolean }) {
  const auth = useAuth()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [remember, setRemember] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isRegisterMode, setIsRegisterMode] = React.useState(false)
  const [firstName, setFirstName] = React.useState('')
  const [lastName, setLastName] = React.useState('')
  const [address, setAddress] = React.useState('')
  const [showResetModal, setShowResetModal] = React.useState(false)
  const [resetEmail, setResetEmail] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    try {
      setIsSubmitting(true)
      await auth.handleAuthComplete({ buyerEmail: email, buyerName: email.split('@')[0], password }, false)
      if (remember) {
        try { localStorage.setItem('lastEmail', email) } catch {}
      }
    } catch (err) {
      /* handled in hook state */
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegister = async () => {
    // Switch to registration mode and reflect it in the URL
    try {
      const params = new URLSearchParams(window.location.search)
      params.set('register', '1')
      const url = `${window.location.pathname}?${params.toString()}`
      window.history.replaceState(null, '', url)
    } catch {}
    setIsRegisterMode(true)
  }

  const handlePerformRegistration = async () => {
    if (!email || !password || !firstName || !lastName) {
      window.alert('Please complete first name, last name, email, and password to register.')
      return
    }
    try {
      setIsSubmitting(true)
      const fullName = `${firstName} ${lastName}`.trim()
      await auth.handleAuthComplete({ buyerEmail: email, buyerName: fullName, password }, true)
      // Store additional personal details in Supabase user metadata (best-effort)
      try {
        await auth.updateUserProfile({
          full_name: fullName,
          buyer_name: fullName as any,
          property_address: address as any,
        })
      } catch {}
      // Return to sign-in mode in URL and UI
      try {
        const params = new URLSearchParams(window.location.search)
        params.delete('register')
        const suffix = params.toString() ? `?${params.toString()}` : ''
        window.history.replaceState(null, '', `${window.location.pathname}${suffix}`)
      } catch {}
      setIsRegisterMode(false)
    } catch (err) {
      // handled in hook state
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenResetModal = () => {
    setResetEmail(email)
    setShowResetModal(true)
  }

  const handleSendReset = async () => {
    if (!resetEmail) {
      window.alert('Please enter your email to receive a reset link.')
      return
    }
    try {
      setIsSubmitting(true)
      await auth.authHelpers.resetPassword(resetEmail)
      setShowResetModal(false)
      window.alert('If this email exists, a reset link has been sent. Please check your inbox.')
    } catch (err) {
      window.alert('Could not send reset email. Please try again in a moment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  React.useEffect(() => {
    try {
      if (forceRegisterMode) {
        setIsRegisterMode(true)
      } else {
        const params = new URLSearchParams(window.location.search)
        const reg = params.get('register')
        if (reg !== null) {
          setIsRegisterMode(reg === '1' || reg === 'true' || reg === '')
        }
      }
    } catch {}
    try {
      const v = localStorage.getItem('lastEmail')
      if (v) setEmail(v)
    } catch {}
  }, [])

  // Simple password strength evaluation
  const passwordStrength = React.useMemo(() => {
    const pwd = password || ''
    let score = 0
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[a-z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    return score // 0-5
  }, [password])

  const isPasswordStrongEnough = passwordStrength >= 4
  const doPasswordsMatch = password && confirmPassword && password === confirmPassword

  const handleGoogle = async () => {
    try {
      setIsSubmitting(true)
      await auth.handleGoogleSignIn()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGuest = () => {
    auth.continueAsGuest({ buyerName: 'Guest User', buyerEmail: email || 'guest@handoff.demo' })
  }


  return (
    <div className={cn('min-h-screen w-full grid lg:grid-cols-2 bg-background', className)}>
      {/* Left: hero */}
      <div className="relative hidden lg:block">
        <img
          src="/brand/ef184a0b-1beb-46ef-8edb-99ceb3a022a7.png"
          alt="HandOff brand pattern"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative h-full w-full p-8 flex flex-col">
          <div className="flex items-center gap-3 text-white">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-primary-foreground">
              <BrandMark className="h-5 w-5 text-primary" />
            </span>
            <span className="text-lg font-semibold">HandOff</span>
          </div>
          <div className="mt-auto text-white max-w-md">
            <h2 className="text-4xl font-semibold leading-tight">Find your new home</h2>
            <div className="mt-6 flex gap-2">
              <span className="h-1.5 w-12 rounded-full bg-white" />
              <span className="h-1.5 w-3 rounded-full bg-white/60" />
              <span className="h-1.5 w-3 rounded-full bg-white/40" />
            </div>
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">

          <div className="space-y-2">
            {isRegisterMode ? (
              <Fragment>
                <h1 className="text-3xl font-bold tracking-tight">Create your HandOff account</h1>
                <p className="text-sm text-muted-foreground">Set your details to get started</p>
              </Fragment>
            ) : (
              <Fragment>
                <h1 className="text-3xl font-bold tracking-tight">Welcome Back to HandOff!</h1>
                <p className="text-sm text-muted-foreground">Sign in to your account</p>
              </Fragment>
            )}
          </div>

          {isRegisterMode ? (
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm">First name</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm">Last name</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm">Address</Label>
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St, City, ST" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <div className="text-xs text-muted-foreground">
                  Strength: {'\u2588'.repeat(passwordStrength)}{'\u2591'.repeat(Math.max(0, 5 - passwordStrength))} {isPasswordStrongEnough ? '(good)' : '(use 8+ chars, upper, lower, number, symbol)'}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm">Confirm Password</Label>
                <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                {!doPasswordsMatch && confirmPassword && (
                  <div className="text-xs text-destructive">Passwords do not match.</div>
                )}
              </div>

              <Button type="button" className="w-full" onClick={handlePerformRegistration} disabled={isSubmitting || !isPasswordStrongEnough || !doPasswordsMatch}>
                {isSubmitting ? 'Creating account…' : 'Create account'}
              </Button>

              <div className="text-xs text-center text-muted-foreground">
                Already have an account?{' '}
                <button type="button" className="text-primary hover:underline" onClick={() => {
                  try {
                    const params = new URLSearchParams(window.location.search)
                    params.delete('register')
                    const suffix = params.toString() ? `?${params.toString()}` : ''
                    window.history.replaceState(null, '', `${window.location.pathname}${suffix}`)
                  } catch {}
                  setIsRegisterMode(false)
                }}>Sign in</button>
              </div>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">Your Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span className="absolute inset-y-0 right-3 flex items-center text-muted-foreground/70">
                  {/* eye icon placeholder */}
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"/><circle cx="12" cy="12" r="3"/></svg>
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <label className="inline-flex items-center gap-2">
                  <Checkbox id="remember" checked={remember} onCheckedChange={(v) => setRemember(Boolean(v))} />
                  <span>Remember Me</span>
                </label>
                <button type="button" onClick={handleOpenResetModal} className="hover:underline disabled:opacity-60" disabled={isSubmitting}>
                  Forgot Password?
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Login'}
            </Button>
          </form>

          )}

          {!isRegisterMode && (
          <div className="mt-8">
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" onClick={handleGoogle} disabled={isSubmitting} className="flex items-center gap-2">
                <GoogleIcon className="h-4 w-4" />
                Continue with Google
              </Button>
              <Button type="button" variant="outline" disabled className="flex items-center gap-2 opacity-70">
                <FacebookIcon className="h-4 w-4" />
                Continue with Facebook
              </Button>
            </div>
          </div>
          )}


        {isRegisterMode ? null : (
          <p className="mt-8 text-xs text-muted-foreground text-center">
            Don’t have any account? <button type="button" onClick={handleRegister} className="text-primary hover:underline disabled:opacity-60" disabled={isSubmitting}>Register</button>
          </p>
        )}

          {auth.authError && (
            <div className="mt-4 text-sm text-destructive" role="alert">
              {auth.authError}
            </div>
          )}


          {showResetModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-sm rounded-lg bg-white border border-border p-4 shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Reset your password</h3>
                <p className="text-sm text-muted-foreground mb-4">Enter your account email. We’ll send you a reset link.</p>
                <div className="space-y-2 mb-4">
                  <Label htmlFor="resetEmail" className="text-sm">Email</Label>
                  <Input id="resetEmail" type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} placeholder="you@example.com" />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowResetModal(false)} disabled={isSubmitting}>Cancel</Button>
                  <Button type="button" onClick={handleSendReset} disabled={isSubmitting || !resetEmail}>Send reset link</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
