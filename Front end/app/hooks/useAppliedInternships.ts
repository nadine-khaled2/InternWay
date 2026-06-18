'use client'

import { useCallback } from 'react'

const SESSION_KEY = 'iw_applied_internships'

function readSet(): Set<number> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return new Set()
    const arr = JSON.parse(raw)
    return new Set(Array.isArray(arr) ? arr : [])
  } catch {
    return new Set()
  }
}

function writeSet(set: Set<number>): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(Array.from(set)))  // ← التغيير هنا
  } catch {}
}

export function useAppliedInternships() {
  const isApplied = useCallback((internshipId: number): boolean => {
    return readSet().has(internshipId)
  }, [])

  const markApplied = useCallback((internshipId: number): void => {
    const set = readSet()
    set.add(internshipId)
    writeSet(set)
  }, [])

  return { isApplied, markApplied }
}