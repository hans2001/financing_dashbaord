import { PlaidConnectPanel } from "@/components/connect/PlaidConnectPanel";

export default function ConnectPage() {
  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-8">
        <PlaidConnectPanel />
      </div>
    </main>
  );
}
