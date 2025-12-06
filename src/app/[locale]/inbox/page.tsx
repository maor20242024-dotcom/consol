import UnifiedInbox from '@/components/inbox/unified-inbox';

export default function InboxPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Unified Inbox</h1>
        <p className="text-muted-foreground">
          Manage all your Instagram and WhatsApp conversations in one place
        </p>
      </div>
      
      <UnifiedInbox />
    </div>
  );
}
