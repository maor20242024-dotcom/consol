"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Filter, CalendarIcon } from "lucide-react";
import { LEAD_SOURCES, getLeadSourceOptions } from "@/lib/lead-sources";
import { getCampaigns } from "@/actions/crm";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";

interface LeadFiltersProps {
    onFiltersChange: (filters: {
        search?: string;
        source?: string;
        campaignId?: string;
        priority?: string;
        startDate?: Date;
        endDate?: Date;
    }) => void;
    loading?: boolean;
}

interface Campaign {
    id: string;
    name: string;
    status: string;
    platform: string;
}

export function LeadFilters({ onFiltersChange, loading = false }: LeadFiltersProps) {
    const t = useTranslations("CRM");
    const [search, setSearch] = useState("");
    const [source, setSource] = useState<string>("");
    const [campaignId, setCampaignId] = useState<string>("");
    const [priority, setPriority] = useState<string>("");
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loadingCampaigns, setLoadingCampaigns] = useState(false);

    const sourceOptions = getLeadSourceOptions();

    // Fetch campaigns for dropdown
    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                setLoadingCampaigns(true);
                const result = await getCampaigns();

                if (result.success && result.campaigns) {
                    setCampaigns(result.campaigns.filter((c: Campaign) => c.status === 'ACTIVE'));
                }
            } catch (error) {
                console.error('Failed to fetch campaigns:', error);
            } finally {
                setLoadingCampaigns(false);
            }
        };

        fetchCampaigns();
    }, []);

    const isMounted = useRef(false);

    // Apply filters with debouncing
    useEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }

        const timeoutId = setTimeout(() => {
            onFiltersChange({
                search: search.trim() || undefined,
                source: source || undefined,
                campaignId: campaignId || undefined,
                priority: priority || undefined,
                startDate: dateRange?.from,
                endDate: dateRange?.to,
            });
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search, source, campaignId, priority, dateRange, onFiltersChange]);

    const clearFilters = () => {
        setSearch("");
        setSource("");
        setCampaignId("");
        setPriority("");
        setDateRange(undefined);
    };

    const hasActiveFilters = search || source || campaignId || priority || dateRange;

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Input
                        placeholder={t("searchLeads")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pr-8"
                    />
                    {search && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1 h-6 w-6 p-0"
                            onClick={() => setSearch("")}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </div>
                {hasActiveFilters && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                        className="flex items-center gap-2"
                    >
                        <X className="h-4 w-4" />
                        {t("clearFilters")}
                    </Button>
                )}
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
                {/* Source Filter */}
                <Select value={source} onValueChange={setSource}>
                    <SelectTrigger className="w-[160px]">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder={t("filterBySource")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t("allSources")}</SelectItem>
                        {sourceOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Priority Filter */}
                <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="LOW">Low</SelectItem>
                    </SelectContent>
                </Select>

                {/* Campaign Filter */}
                <Select
                    value={campaignId}
                    onValueChange={setCampaignId}
                    disabled={loadingCampaigns}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder={t("filterByCampaign")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t("allCampaigns")}</SelectItem>
                        {campaigns.map((campaign) => (
                            <SelectItem key={campaign.id} value={campaign.id}>
                                {campaign.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Date Range Picker */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                                "w-[240px] justify-start text-left font-normal",
                                !dateRange && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                                dateRange.to ? (
                                    <>
                                        {format(dateRange.from, "LLL dd, y")} -{" "}
                                        {format(dateRange.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(dateRange.from, "LLL dd, y")
                                )
                            ) : (
                                <span>Pick a date range</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange}
                            onSelect={setDateRange}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="animate-spin rounded-full h-4 w-4 border-b border-primary"></div>
                    {t("filtering")}
                </div>
            )}
        </div>
    );
}
