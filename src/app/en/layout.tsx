import SetLocaleAttrs from "@/components/SetLocaleAttrs";
import AuthHashBridge from "@/components/AuthHashBridge";
import AppHeader from "@/components/AppHeader";

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SetLocaleAttrs locale="en" />
      <AuthHashBridge locale="en" />
      <AppHeader locale="en" />
      {children}
    </>
  );
}
