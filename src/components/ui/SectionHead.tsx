import type { ReactNode } from 'react';
import { Reveal } from './Reveal';

export function SectionHead({ id, eyebrow, title, action }: { id?: string; eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <Reveal className="section-head">
      <div>
        {eyebrow && <div className="section-eyebrow">{eyebrow}</div>}
        <h2 className="section-title" id={id}>{title}</h2>
      </div>
      {action}
    </Reveal>
  );
}
