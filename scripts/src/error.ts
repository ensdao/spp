import path from 'node:path'

type GitHubErrorOptions = {
  filename: string
  title: string
  message: string
}

export class GitHubError extends Error {
  public readonly filename: string
  public readonly title: string
  public readonly annotation: string

  constructor({ filename, title, message }: GitHubErrorOptions) {
    // Use the message as the regular error message
    super(message)

    // Convert the filename to a relative path
    const rootPath = path.join(import.meta.dirname, '..', '..')
    const relativeFilename = path.relative(rootPath, filename)

    // Store the GitHub annotation separately
    this.filename = relativeFilename
    this.title = title
    this.annotation = `::error file=${relativeFilename},title=${title}::${message}`
  }
}
