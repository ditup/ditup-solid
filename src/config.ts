export const ditUris = {
  idea: 'https://ditup.example#Idea' as const,
  problem: 'https://ditup.example#Problem' as const,
} as const

// rename to indexFragments and to REACT_APP_INDEX_FRAGMENTS
export const indexServers: readonly string[] = JSON.parse(
  process.env.REACT_APP_INDEX_SERVERS || '[]',
)

export const indexInboxes: readonly string[] = JSON.parse(
  process.env.REACT_APP_INDEX_INBOXES || '[]',
)
