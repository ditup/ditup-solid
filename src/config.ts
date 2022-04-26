export const ditUris = {
  idea: 'https://ditup.example#Idea' as const,
  problem: 'https://ditup.example#Problem' as const,
} as const

export const indexServers: readonly string[] = JSON.parse(
  process.env.REACT_APP_INDEX_SERVERS || '[]',
)
