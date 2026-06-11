import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Renders the assistant's Markdown reply. Crucially, links render as real
// clickable anchors that open in a new tab — this is what surfaces the
// project "Source:" links the n8n agent now appends to every answer.
export default function Markdown({ children }) {
  return (
    <div className="md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
