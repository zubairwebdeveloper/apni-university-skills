import { FiMapPin, FiLink, FiCheckCircle } from "react-icons/fi";

export function ProfileHero({ profile }) {
  const name = profile.displayName || "Student";
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="h-28 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent sm:h-36" />
      <div className="px-6 pb-6">
        <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end">
          {profile.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.photoURL}
              alt={name}
              className="h-24 w-24 rounded-full border-4 border-background object-cover shadow"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-background bg-primary text-3xl font-semibold text-primary-foreground shadow">
              {initial}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              {name}
              {profile.emailVerified && (
                <FiCheckCircle
                  className="text-emerald-500"
                  title="Verified email"
                />
              )}
            </h2>
            <p className="text-sm text-muted-foreground">
              {profile.headline ||
                "Add a headline to tell people what you're learning"}
            </p>
          </div>
        </div>

        {profile.bio && (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {profile.bio}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
          {profile.location && (
            <span className="flex items-center gap-1.5">
              <FiMapPin /> {profile.location}
            </span>
          )}
          {profile.website && (
            <a
              href={profile.website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-primary"
            >
              <FiLink /> {profile.website.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
