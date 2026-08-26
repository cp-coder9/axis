interface V8RoleBannerProps {
  code: string;
  label: string;
  description: string;
  godMode: boolean;
}

export function V8RoleBanner({ code, label, description, godMode }: V8RoleBannerProps) {
  const title = godMode ? `God Mode with ${label} lens` : `${label} experience`;
  const detail = godMode
    ? 'Full-system exploration is unlocked while the selected role remains a learning lens.'
    : `${description}. Project navigation is filtered to the role while shared collaboration tools remain visible.`;

  return (
    <section data-v8-datum-region="role-banner" className="v8-role-banner">
      <span className="v8-role-avatar" aria-hidden="true">{code}</span>
      <span className="v8-role-copy">
        <b>{title}</b>
        <span>{detail}</span>
      </span>
      <span className="v8-role-tags" aria-label="Experience characteristics">
        <i>{godMode ? 'Full ecosystem' : 'Role relevant'}</i>
        <i>Project-aware</i>
        <i>Audited</i>
      </span>
    </section>
  );
}
