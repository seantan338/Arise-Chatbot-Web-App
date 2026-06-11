import Logo from './Logo.jsx'
import Markdown from './Markdown.jsx'

// A single chat row. User messages are plain text (right-aligned, teal);
// assistant messages render Markdown (left-aligned, white card).
export default function MessageBubble({ role, content, error }) {
  const isUser = role === 'user'

  if (isUser) {
    return (
      <div className="flex animate-fadeUp justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-teal px-4 py-2.5 text-[0.95rem] leading-relaxed text-white shadow-soft">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex animate-fadeUp items-start gap-2.5">
      <div className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-teal-light">
        <Logo className="h-6 w-6" />
      </div>
      <div
        className={[
          'max-w-[88%] rounded-2xl rounded-tl-md border px-4 py-3 text-[0.95rem] shadow-soft',
          error
            ? 'border-red-200 bg-red-50 text-red-700'
            : 'border-line bg-surface text-ink',
        ].join(' ')}
      >
        <Markdown>{content}</Markdown>
      </div>
    </div>
  )
}
