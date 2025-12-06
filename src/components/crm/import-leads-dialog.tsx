"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileUp, Loader2, Download } from "lucide-react";
import { useTranslations } from "next-intl";

interface ImportLeadsDialogProps {
    onSuccess?: () => void;
}

export function ImportLeadsDialog({ onSuccess }: ImportLeadsDialogProps) {
    const [open, setOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const t = useTranslations("CRM");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const activeLocale = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'en';

    const handleImport = async () => {
        if (!file) return;

        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/crm/import", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast({
                    title: "Import Successful",
                    description: `Imported ${data.imported} leads. Failed: ${data.failed}.`,
                    variant: "default",
                });
                setOpen(false);
                setFile(null);
                if (onSuccess) onSuccess();
            } else {
                throw new Error(data.error || "Import failed");
            }
        } catch (error) {
            console.error("Import error:", error);
            toast({
                title: "Import Failed",
                description: error instanceof Error ? error.message : "Details in console",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await fetch("/api/crm/export");
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                toast({
                    title: "Export Started",
                    description: "Your download should begin shortly.",
                });
            } else {
                throw new Error("Export failed");
            }
        } catch (error) {
            console.error("Export error:", error);
            toast({
                title: "Export Failed",
                description: "Could not download file.",
                variant: "destructive"
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <div className="flex gap-2">
                <Button variant="outline" className="gap-2" onClick={handleExport}>
                    <Download className="h-4 w-4" />
                    Export
                </Button>
                <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                        <Upload className="h-4 w-4" />
                        Import
                    </Button>
                </DialogTrigger>
            </div>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Import Leads</DialogTitle>
                    <DialogDescription>
                        Upload a .xlsx or .csv file. Required column: Name. Optional: Phone, Email, Budget, Status, Source.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="file">File</Label>
                        <Input id="file" type="file" accept=".xlsx, .xls, .csv" onChange={handleFileChange} />
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleImport} disabled={!file || loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileUp className="mr-2 h-4 w-4" />}
                        Import
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
