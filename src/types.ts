export type Uri = string
export type DitType = 'idea' | 'problem'

export type Interest = { uri: Uri; label: string; description: string }

export type DitThing = {
  type: DitType
  uri: Uri
  label: string
  description: string
  tags: Interest[]
}

export type DitThingSimple = Omit<DitThing, 'tags'> & { tags: Uri[] }
