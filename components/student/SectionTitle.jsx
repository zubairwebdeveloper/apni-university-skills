export function SectionTitle({ icon: Icon, title }) {
  return (
    <h2 className="flex items-center gap-2 text-lg">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      {title}
    </h2>
  );
}
