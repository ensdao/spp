import path from 'node:path'

type GitHubErrorOptions = {
  filename: string
  line: number
  title: string
  message: string
}

export class GitHubError extends Error {
  public readonly filename: string
  public readonly line: number
  public readonly title: string
  public readonly annotation: string

  constructor({ filename, line, title, message }: GitHubErrorOptions) {
    // Use the message as the regular error message
    super(message)

    // Convert the filename to a relative path
    const rootPath = path.join(import.meta.dirname, '..', '..')
    const relativeFilename = path.relative(rootPath, filename)

    // Store the GitHub annotation separately
    this.filename = relativeFilename
    this.line = line
    this.title = title
    this.annotation = `::error file=${relativeFilename},line=${line},title=${title}::${message}`
  }
}
