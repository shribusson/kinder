import PageHeader from "@/app/components/PageHeader";
import WebsiteLeadForm from "./website-lead-form";

export default function SitePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Сайт и заявки"
        subtitle="Форма заявки с UTM и автозанесением в CRM"
      />
      <div className="card">
        <WebsiteLeadForm />
      </div>
    </div>
  );
}
