import { readdir } from 'node:fs/promises'
import matter from 'gray-matter'
import path from 'node:path'

import { ProposalFrontmatter } from './schema'
import { validateProposalHeadings, validateUpdateHeadings } from './validate'
import { GitHubError } from './error'

const rootPath = path.join(import.meta.dirname, '..', '..')
const root = await readdir(rootPath)
const sppSeasons = root.filter((entry) => entry.startsWith('spp-'))

try {
  await validate()
} catch (error) {
  if (error instanceof GitHubError) {
    // Output the GitHub annotation to stdout
    console.log(error.annotation)
    process.exit(1)
  }

  console.error(error)
  process.exit(1)
}

async function validate() {
  for (const sppSeason of sppSeasons) {
    const seasonPath = path.join(rootPath, sppSeason)
    const providers = await readdir(seasonPath)

    for (const provider of providers) {
      const providerPath = path.join(seasonPath, provider)

      // Read the proposal.md file
      const proposalPath = path.join(providerPath, 'proposal.md')
      const { data: proposalFrontmatter, content: proposalMarkdown } = matter(
        await Bun.file(proposalPath).text()
      )

      // Validate the frontmatter
      const validatedFrontmatter =
        ProposalFrontmatter.parse(proposalFrontmatter)

      // Check if the logo (as a relative path) exists
      const logoPath = path.join(providerPath, validatedFrontmatter.logo)
      const logoExists = await Bun.file(logoPath).exists()
      if (!logoExists) {
        throw new GitHubError({
          filename: logoPath,
          title: 'File does not exist',
          message: `The logo file does not exist: ${logoPath}`,
        })
      }

      validateProposalHeadings(proposalMarkdown, proposalPath)

      const updatesPath = path.join(providerPath, 'updates')
      const updates = await readdir(updatesPath)
      const updateFiles = updates.filter((file) => file.endsWith('.md'))

      // Make sure there's nothing else besides {number}.md files
      if (updateFiles.length !== updates.length) {
        throw new GitHubError({
          filename: providerPath,
          title: 'Invalid update files',
          message: `There should only be numbered .md files in the updates folder`,
        })
      }

      // Check that updates are numbered sequentially
      for (let i = 0; i < updateFiles.length; i++) {
        const update = updateFiles[i]!
        const updateNumber = parseInt(update.split('.')[0]!)
        if (updateNumber !== i + 1) {
          throw new GitHubError({
            filename: updatesPath,
            title: 'Updates are not numbered sequentially',
            message: `The update files are not numbered sequentially`,
          })
        }
      }

      for (const updateFile of updateFiles) {
        const updatePath = path.join(providerPath, 'updates', updateFile)
        const updateContent = await Bun.file(updatePath).text()
        const { content: updateMarkdown } = matter(updateContent)

        validateUpdateHeadings(updateMarkdown, updatePath)
      }
    }
  }
}
