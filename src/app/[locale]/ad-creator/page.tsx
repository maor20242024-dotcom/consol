import { Suspense } from "react";
import { AdCreatorContent } from "./client";

export default function AdCreatorPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AdCreatorContent />
        </Suspense>
    );
}
