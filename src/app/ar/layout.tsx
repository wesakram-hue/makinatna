import SetLocaleAttrs from "@/components/SetLocaleAttrs";
import AuthHashBridge from "@/components/AuthHashBridge";
import AppHeader from "@/components/AppHeader";
import { Noto_Sans_Arabic } from "next/font/google";

const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SetLocaleAttrs locale="ar" />
      <AuthHashBridge locale="ar" />
      <div className={notoArabic.className}>
        <AppHeader locale="ar" />
        {children}
      </div>
    </>
  );
}
