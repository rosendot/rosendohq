import Sidebar from "@/components/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      {/*
        Below lg the sidebar is an off-canvas drawer, so it reserves no gutter.
        Pages clear the fixed hamburger themselves: sticky headers take a
        `pl-[68px]` inset, plain pages a `pt-14`. Padding <main> here instead
        would push the sticky headers down off the top of the viewport.
      */}
      <main className="min-h-screen lg:pl-16">{children}</main>
    </>
  );
}
