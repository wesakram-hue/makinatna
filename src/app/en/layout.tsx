import SetLocaleAttrs from "@/components/SetLocaleAttrs";

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SetLocaleAttrs locale="en" />
      {children}
    </>
  );
}
