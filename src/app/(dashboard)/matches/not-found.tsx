import Link from 'next/link';

export default function MatchNotFound() {
  return (
    <div className="max-w-md mx-auto text-center py-16">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Match not found</h1>
      <p className="text-gray-600 mb-6">
        This match may have been removed or the link is outdated. If you reset or changed the database, old match links will no longer work.
      </p>
      <Link href="/dashboard" className="btn-primary">
        Go to Dashboard
      </Link>
    </div>
  );
}
