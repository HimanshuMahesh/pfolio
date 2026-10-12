import { Hero } from "@/components/home/hero/Hero";
import { SelectedWork } from "@/components/home/SelectedWork";
import { Carry } from "@/components/home/carry/Carry";
import { Notes } from "@/components/home/Notes";
import { Contact } from "@/components/home/Contact";
import { Blueprint } from "@/components/home/Blueprint";
import { Ask } from "@/components/ask/Ask";

export default function HomePage() {
  return (
    <>
      <Hero />
      <SelectedWork />
      <Carry />
      <Notes />
      <Contact />
      <Blueprint />
      <Ask />
    </>
  );
}
