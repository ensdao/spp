import { readdir } from 'node:fs/promises'
import matter from 'gray-matter'
import path from 'node:path'

import { ProposalFrontmatter } from './schema'
import { validateProposalHeadings } from './validate'

const rootPath = path.join(import.meta.dirname, '..', '..')
const root = await readdir(rootPath)
const sppSeasons = root.filter((entry) => entry.startsWith('spp-'))

for (const sppSeason of sppSeasons) {
  const seasonPath = path.join(rootPath, sppSeason)
  const providers = await readdir(seasonPath)

  for (const provider of providers) {
    const providerPath = path.join(seasonPath, provider)

    // Read the proposal.md file
    const proposal = await Bun.file(`${providerPath}/proposal.md`).text()
    const { data: proposalFrontmatter, content: proposalContent } =
      matter(proposal)

    // Validate the frontmatter
    const validatedFrontmatter = ProposalFrontmatter.parse(proposalFrontmatter)

    // Check if the logo (as a relative path) exists
    const logoPath = path.join(providerPath, validatedFrontmatter.logo)
    const logoExists = await Bun.file(logoPath).exists()
    if (!logoExists) {
      throw new Error(`File does not exist: ${logoPath}`)
    }

    validateProposalHeadings(proposalContent)
  }
}
