import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'

type Props = { content?: string; className?: string }

export default function MarkdownRenderer({ content, className }: Props) {
  if (!content) {
    return (
      <div className={className}>
        <div className="rounded-lg border border-dashed p-4 text-center text-gray-500">暂无内容</div>
      </div>
    )
  }
  return (
    <div className={className}>
      <article className="prose prose-sm max-w-none">
        <ReactMarkdown rehypePlugins={[rehypeSanitize]} remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </article>
    </div>
  )
}