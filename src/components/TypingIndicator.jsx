import Logo from './Logo.jsx'

export default function TypingIndicator() {
  return (
    <div className="flex animate-fadeUp items-start gap-2.5">
      <div className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-teal-light">
        <Logo className="h-6 w-6" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-line bg-surface px-4 py-4 shadow-soft">
        <span className="h-2 w-2 animate-blink rounded-full bg-teal [animation-delay:0ms]" />
        <span className="h-2 w-2 animate-blink rounded-full bg-teal [animation-delay:200ms]" />
        <span className="h-2 w-2 animate-blink rounded-full bg-teal [animation-delay:400ms]" />
      </div>
    </div>
  )
}
