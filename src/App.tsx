import { BootIntro } from "@/features/boot/BootIntro";
import { ProfileView } from "@/features/profile/ProfileView";

const App = () => {
  const handleBootComplete = () => {
    document.body.classList.add("booted");
  };

  return (
    <>
      <BootIntro onComplete={handleBootComplete} />
      <ProfileView />
    </>
  );
};

export default App;
