import SetLocaleAttrs from "@/components/SetLocaleAttrs";
import AuthHashBridge from "@/components/AuthHashBridge";

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SetLocaleAttrs locale="en" />
      <AuthHashBridge locale="en" />
      {children}
    </>
  );
}
