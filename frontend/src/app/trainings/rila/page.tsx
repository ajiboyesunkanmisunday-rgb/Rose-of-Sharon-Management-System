import TrainingGroupPage from "@/components/trainings/TrainingGroupPage";

export default function RilaPage() {
  return (
    <TrainingGroupPage
      groupKeywords={["RILA", "Rila"]}
      title="RILA"
      description="Members enrolled in the Redeemer's International Leadership Academy"
      accentColor="#DC2626"
      formHref="/trainings/rila/form"
      blankFormHref="/trainings/rila/form?mode=blank"
    />
  );
}
