import path from 'node:path'

type GitHubErrorOptions = {
  filename: string
  line: number
  title: string
  message: string
}

export class GitHubError extends Error {
  constructor({ filename, line, title, message }: GitHubErrorOptions) {
    // Convert the filename to a relative path
    const rootPath = path.join(import.meta.dirname, '..', '..')
    const relativeFilename = path.relative(rootPath, filename)

    // GitHub will display inline errors if we log the error in the following format
    const errorMessage = `::error file=${relativeFilename},line=${line},title=${title}::${message}`
    super(errorMessage)
  }
}
