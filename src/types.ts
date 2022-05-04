export type Uri = string
export type DitType = 'idea' | 'problem'

export type Interest = {
  uri: Uri
  label: string
  description: string
  aliases: string[]
  image?: Uri
  officialWebsite?: Uri
}

export type DitThing = {
  type: DitType
  uri: Uri
  label: string
  description: string
  tags: Uri[]
  creator: Uri
  createdAt: number
  updatedAt?: number
}

export type DitThingBasic = Omit<
  DitThing,
  'creator' | 'createdAt' | 'updatedAt'
>

export type Person = {
  uri: Uri
  name: string
  photo: string
  interests: Uri[]
}
