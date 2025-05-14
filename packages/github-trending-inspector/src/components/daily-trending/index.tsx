"use client"

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { useSession } from '$/lib/auth-client'
import { Repository, LanguageGroup } from './types'
import { LanguageSection } from './language-section'
import { Card, CardContent } from '../ui/card'
import { AlertCircle, Database } from 'lucide-react'
import { SectionSkeleton } from './section-skeleton'

export function DailyTrending({ date }: { date: string }) {
  const { data: session } = useSession()
  const [repoGroups, setRepoGroups] = useState<LanguageGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let mounted = true

    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/trending/${date}`)

        if (!mounted) return

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`)
        }

        const data: Repository[] = await response.json()

        if (!mounted) return

        const groupedRepos = data.reduce((acc, repo) => {
          const existingGroup = acc.find(g => g.language === repo.language)
          if (existingGroup) {
            existingGroup.repos.push(repo)
          } else {
            acc.push({ language: repo.language, repos: [repo] })
          }
          return acc
        }, [] as LanguageGroup[])

        groupedRepos.sort((a, b) => a.language.localeCompare(b.language))

        setRepoGroups(groupedRepos)
      } catch (error) {
        if (mounted) {
          setError(error instanceof Error ? error.message : 'Failed to fetch data')
          setRepoGroups([])
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      mounted = false
    }
  }, [date])

  if (!mounted) {
    return (
      <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, index) => (
          <SectionSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.1,
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1]
            }}
          >
            <SectionSkeleton />
          </motion.div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <Card>
          <CardContent className="flex flex-col items-center justify-center min-h-[200px] gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
            >
              <AlertCircle className="h-6 w-6 text-destructive" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <p className="text-sm font-medium text-destructive">{error}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Please try again later
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (repoGroups.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <Card>
          <CardContent className="flex flex-col items-center justify-center min-h-[200px] gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
            >
              <Database className="h-6 w-6 text-muted-foreground/70" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-muted-foreground"
            >
              No repositories found for this date
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {repoGroups.map((group, index) => (
        <motion.div
          key={group.language}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: index * 0.1,
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          <LanguageSection
            group={group}
            session={session}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
