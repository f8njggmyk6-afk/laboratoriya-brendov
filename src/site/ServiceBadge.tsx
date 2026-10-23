import { serviceIdentity, type ServiceItem } from "./serviceCatalog";
import { useLanguage } from "./i18n";

export function ServiceBadge({ item }: { item: ServiceItem }) {
  const { lang } = useLanguage();
  const identity = serviceIdentity(item, lang);
  return <span className={`service-identity${identity.development ? " is-development" : ""}`} aria-label={identity.label} title={identity.direction}>
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d={identity.development ? "m10 9-7 7 7 7m12-14 7 7-7 7M19 5l-6 22" : "m5 13 17-7v20L5 19v-6Zm17-1 5 2v4l-5 2M9 21l2 7h5l-2-5"}/></svg>
    <span>№ {identity.number}</span>
  </span>;
}
