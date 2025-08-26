type GitHubErrorOptions = {
  filename: string
  line: number
  title: string
  message: string
}

export class GitHubError extends Error {
  constructor({ filename, line, title, message }: GitHubErrorOptions) {
    // GitHub will display inline errors if we log the error in the following format
    const errorMessage = `::error file=${filename},line=${line},title=${title}::${message}`
    super(errorMessage)
  }
}
