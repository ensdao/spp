import { marked, type Tokens } from 'marked'

import { GitHubError } from './error'

const requiredProposalH2s = [
  'Applicant Information',
  'Eligibility Confirmation',
  'Open Source Commitment',
  'Scope of Work & Budget',
  'Past Achievements & Additional Information',
  'Video Introduction',
  'Conflict Of Interest Statment',
]

export function validateProposalHeadings(content: string, filename: string) {
  const { h1s, h2s } = extractHeadings(content)

  if (h1s.length !== 1) {
    throw new GitHubError({
      filename,
      title: 'Only one H1 is allowed',
      message: 'Please add only one H1 to the proposal.md file.',
    })
  }

  const missingH2s = requiredProposalH2s.filter(
    (h2) => !h2s.some((h) => h.text.includes(h2))
  )

  if (missingH2s.length > 0) {
    throw new GitHubError({
      filename,
      title: 'Missing required headings',
      message: `This proposal is missing the following headings: ${missingH2s.join(
        ', '
      )}`,
    })
  }
}

const requiredUpdateH2s = ['Summary', 'KPIs']

export function validateUpdateHeadings(content: string, filename: string) {
  const { h1s, h2s } = extractHeadings(content)

  if (h1s.length !== 1) {
    throw new GitHubError({
      filename,
      title: 'Only one H1 is allowed',
      message: 'Please add only one H1 to the update.md file.',
    })
  }

  const missingH2s = requiredUpdateH2s.filter(
    (h2) => !h2s.some((h) => h.text.includes(h2))
  )

  if (missingH2s.length > 0) {
    throw new GitHubError({
      filename,
      title: 'Missing required headings',
      message: `This update is missing the following headings: ${missingH2s.join(
        ', '
      )}`,
    })
  }
}

function extractHeadings(content: string) {
  const tokens = marked.lexer(content)
  const headingTokens = tokens.filter(
    (token) => token.type === 'heading'
  ) as Tokens.Heading[]

  const h1s = headingTokens.filter((token) => token.depth === 1)
  const h2s = headingTokens.filter((token) => token.depth === 2)

  return { h1s, h2s }
}
