import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "../components/common";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-100 text-ink-500">
        <Compass size={26} />
      </span>
      <div>
        <h1 className="text-xl font-semibold text-ink-900">Page not found</h1>
        <p className="mt-1 max-w-md text-sm text-ink-500">
          The page you requested does not exist or has moved.
        </p>
      </div>
      <Button as={Link} to="/dashboard">
        Back to dashboard
      </Button>
    </div>
  );
}
