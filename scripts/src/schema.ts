import { z } from 'zod'

export const ProposalFrontmatter = z.object({
  name: z.string('Name is required'),
  description: z.string('Description is required'),
  logo: z
    .string('Logo is required as a relative path')
    .refine((str) => str.startsWith('./')),
  website: z.url('Website is required'),
  twitter: z.url('Twitter (full URL, not just username) is required'),
  github: z.url('GitHub (full URL, not just username) is required'),
})
