export function Loading({ text = 'Loading…' }) { return <p className="muted">{text}</p>; }
export function ErrorBox({ message }) { return message ? <p className="error">{message}</p> : null; }
