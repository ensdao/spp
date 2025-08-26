import { marked, type Tokens } from 'marked'

const requiredProposalH2s = [
  'Applicant Information',
  'Eligibility Confirmation',
  'Open Source Commitment',
  'Scope of Work & Budget',
  'Past Achievements & Additional Information',
  'Video Introduction',
  'Conflict Of Interest Statment',
]

export function validateProposalHeadings(content: string) {
  const headingTokens = marked.lexer(content)
  const headings = headingTokens.filter(
    (token) => token.type === 'heading'
  ) as Tokens.Heading[]

  const h1s = headings.filter((token) => token.depth === 1)
  const h2s = headings.filter((token) => token.depth === 2)

  if (h1s.length !== 1) {
    throw new Error('Only one H1 is allowed')
  }

  const missingH2s = requiredProposalH2s.filter(
    (h2) => !h2s.some((h) => h.text.includes(h2))
  )

  if (missingH2s.length > 0) {
    throw new Error(
      `Missing required headings: ${missingH2s.join(
        ', '
      )}. Please add them to the proposal.md file.`
    )
  }
}
