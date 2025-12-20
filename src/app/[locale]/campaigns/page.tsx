import { redirect } from "next/navigation";

export default function CampaignsRedirect({ params }: { params: { locale: string } }) {
    redirect(`/${params.locale}/campaigns-manager`);
}
