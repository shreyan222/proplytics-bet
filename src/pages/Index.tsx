
import { Dashboard } from "@/components/Dashboard";
import { NewUserModal } from "@/components/NewUserModal";
import { FloatingHelp } from "@/components/FloatingHelp";
import { useNewUser } from "@/hooks/useNewUser";

const Index = () => {
  const { showNewUserModal, closeNewUserModal } = useNewUser();

  return (
    <>
      <Dashboard />
      <NewUserModal isOpen={showNewUserModal} onClose={closeNewUserModal} />
      <FloatingHelp />
    </>
  );
};

export default Index;
