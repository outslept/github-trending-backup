"use client"

import { Button } from "$/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "$/components/ui/card"
import { useState } from "react"
import { signIn } from "$/lib/auth-client"
import { cn } from "$/lib/utils"
import { toast } from "sonner"

export default function SignIn() {
  const [loading, setLoading] = useState(false)

  return (
    <Card className="max-w-md w-full">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl">Sign In</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Sign in with your GitHub account to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className={cn(
            "w-full gap-2 flex items-center",
            "justify-between flex-col"
          )}>
            <Button
              variant="outline"
              className={cn(
                "w-full gap-2"
              )}
              disabled={loading}
              onClick={async () => {
                try {
                  await signIn.social(
                    {
                      provider: "github"
                    },
                    {
                      onRequest: () => {
                        setLoading(true)
                      },
                      onResponse: () => {
                        setLoading(false)
                      },
                      onError: (error) => {
                        toast.error('Failed to sign in with GitHub')
                        console.error('Sign in error:', error)
                        setLoading(false)
                      }
                    }
                  )
                } catch (error) {
                  toast.error('Failed to sign in with GitHub')
                  console.error('Sign in error:', error)
                  setLoading(false)
                }
              }}
            >
              {loading ? (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
                  />
                </svg>
              )}
              {loading ? 'Signing in...' : 'Sign in with Github'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
