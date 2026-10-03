import { Link } from "react-router-dom";
import { AccessDenied, Button } from "../components/common";

export default function UnauthorizedPage() {
  return (
    <div className="px-4">
      <AccessDenied message="Your role does not have permission to access this route. If you reached this page by URL, the request is blocked both in the UI and at the database level." />
      <div className="flex justify-center pb-10">
        <Button as={Link} to="/dashboard">
          Back to dashboard
        </Button>
      </div>
    </div>
  );
}
