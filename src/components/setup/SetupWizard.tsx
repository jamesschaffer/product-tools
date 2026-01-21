import { useNotionConfig } from '../../hooks/useNotionConfig';
import { Button } from '../ui/Button';

export function SetupWizard() {
  const { recheckConfig, isLoading } = useNotionConfig();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-lg rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-2xl font-semibold text-gray-900">
          Configure Notion Connection
        </h1>

        <div className="space-y-6">
          <p className="text-gray-600">
            This app requires environment variables to be configured with your Notion credentials.
          </p>

          <div className="rounded-lg bg-gray-50 p-4">
            <h2 className="mb-3 font-medium text-gray-900">Setup Instructions</h2>

            <ol className="list-decimal space-y-3 pl-5 text-sm text-gray-600">
              <li>
                <strong>Create a Notion integration</strong> at{' '}
                <a
                  href="https://www.notion.so/my-integrations"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  notion.so/my-integrations
                </a>
              </li>

              <li>
                <strong>Create a parent page</strong> in Notion and share it with your integration
              </li>

              <li>
                <strong>Create three databases</strong> inside that page:
                <ul className="mt-2 list-disc pl-5 text-gray-500">
                  <li>Goals (with: Name, Description, Desired Outcome, Priority, Order)</li>
                  <li>Initiatives (with: Name, Ideal Outcome, Goal relation, Order)</li>
                  <li>Deliverables (with: Name, Description, Status, Start Date, End Date, Initiative relation, Order)</li>
                </ul>
              </li>

              <li>
                <strong>Copy the .env.example file</strong> to <code className="rounded bg-gray-200 px-1">.env</code> and fill in:
                <pre className="mt-2 overflow-x-auto rounded bg-gray-900 p-3 text-xs text-gray-100">
{`NOTION_TOKEN=secret_...
GOALS_DB_ID=your-goals-db-id
INITIATIVES_DB_ID=your-initiatives-db-id
DELIVERABLES_DB_ID=your-deliverables-db-id`}
                </pre>
              </li>

              <li>
                <strong>Restart the development server</strong> to load the new environment variables
              </li>
            </ol>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Database IDs can be found in the URL when you open a database.
              They look like: <code className="rounded bg-blue-100 px-1">abc123def456...</code>
            </p>
          </div>

          <Button
            onClick={recheckConfig}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Checking...' : 'Check Configuration'}
          </Button>

          <p className="text-center text-sm text-gray-500">
            Click the button above after configuring your environment variables and restarting the server.
          </p>
        </div>
      </div>
    </div>
  );
}
